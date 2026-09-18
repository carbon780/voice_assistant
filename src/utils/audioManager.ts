/**
 * Audio Manager for Live API Voice to Voice
 * Handles 16kHz microphone capture (PCM 16-bit little-endian)
 * and 24kHz seamless audio playback with volume visualization
 */

export class AudioManager {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted: boolean = false;
  
  public onAudioInput?: (base64Pcm: string) => void;
  public onInputVolume?: (volume: number) => void;
  public onOutputVolume?: (volume: number) => void;

  /**
   * Starts capturing user microphone at 16kHz
   */
  async startMic(): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
    
    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume();
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.sourceNode = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    // Buffer size 2048 samples (~128ms at 16kHz) for low latency
    this.processorNode = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

    this.processorNode.onaudioprocess = (e) => {
      if (this.isMuted) {
        if (this.onInputVolume) this.onInputVolume(0);
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate RMS for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      const normalizedVolume = Math.min(1, rms * 5); // Boost slightly for visual effect
      if (this.onInputVolume) {
        this.onInputVolume(normalizedVolume);
      }

      // Convert Float32 to 16-bit PCM
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64 = this.arrayBufferToBase64(pcm16);

      if (this.onAudioInput) {
        this.onAudioInput(base64);
      }
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.inputAudioCtx.destination);
  }

  /**
   * Initializes the 24kHz output context for model playback
   */
  ensureOutputContext(): void {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume().catch(() => {});
    }
  }

  /**
   * Plays a 24kHz PCM chunk received from Live API
   */
  playChunk(base64Data: string): void {
    try {
      this.ensureOutputContext();
      if (!this.outputAudioCtx) return;

      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const dataView = new DataView(bytes.buffer);
      const numSamples = Math.floor(bytes.length / 2);
      if (numSamples === 0) return;

      const float32Data = new Float32Array(numSamples);
      let sum = 0;
      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        const floatVal = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
        float32Data[i] = floatVal;
        sum += floatVal * floatVal;
      }

      // Model speaking volume
      const rms = Math.sqrt(sum / numSamples);
      if (this.onOutputVolume) {
        this.onOutputVolume(Math.min(1, rms * 4));
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, numSamples, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioCtx.destination);

      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0 && this.onOutputVolume) {
          this.onOutputVolume(0);
        }
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  }

  /**
   * Immediately stops all currently playing audio chunks (barge-in / interrupt)
   */
  stopOutput(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (_) {}
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    if (this.onOutputVolume) {
      this.onOutputVolume(0);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.onInputVolume) {
      this.onInputVolume(0);
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Converts Float32Array to 16-bit PCM little-endian ArrayBuffer
   */
  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  }

  /**
   * Converts ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Cleanup everything
   */
  destroy(): void {
    this.stopOutput();
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }
}
