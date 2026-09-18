import React, { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { VoiceStage } from "./components/VoiceStage";
import { IntakeChartPanel } from "./components/IntakeChartPanel";
import { TranscriptFeed } from "./components/TranscriptFeed";
import { SummaryModal } from "./components/SummaryModal";
import { VoiceHistoryModal } from "./components/VoiceHistoryModal";
import { AudioManager } from "./utils/audioManager";
import { ChatMessage, ConnectionState, AssistantAudioState, IntakeChart, Language } from "./types";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [audioState, setAudioState] = useState<AssistantAudioState>("silent");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [isMuted, setIsMuted] = useState(false);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAssistantSentence, setCurrentAssistantSentence] = useState("");
  const [currentUserSentence, setCurrentUserSentence] = useState("");

  const [chart, setChart] = useState<IntakeChart>({
    triageLevel: "routine",
  });

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const sessionIdRef = useRef<string>("");

  // Buffer assistant speech to assemble completed sentences
  const assistantSpeechBufferRef = useRef<string>("");
  const userSpeechBufferRef = useRef<string>("");

  // Clean up audio & socket on unmount
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.destroy();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    if (audioManagerRef.current) {
      const next = !isMuted;
      audioManagerRef.current.setMuted(next);
      setIsMuted(next);
      if (next) setInputVolume(0);
    }
  }, [isMuted]);

  const endSession = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.destroy();
      audioManagerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState("disconnected");
    setAudioState("silent");
    setInputVolume(0);
    setOutputVolume(0);
    setCurrentAssistantSentence("");
    setCurrentUserSentence("");
  }, []);

  const startSession = useCallback(async () => {
    try {
      setErrorMessage("");
      setConnectionState("connecting");
      setAudioState("thinking");

      // Initialize audio manager
      const manager = new AudioManager();
      audioManagerRef.current = manager;

      manager.onInputVolume = (vol) => {
        setInputVolume(vol);
        if (vol > 0.08 && connectionState === "connected") {
          setAudioState("listening");
        }
      };

      manager.onOutputVolume = (vol) => {
        setOutputVolume(vol);
        if (vol > 0.04) {
          setAudioState("speaking");
        }
      };

      // Request microphone access
      try {
        await manager.startMic();
      } catch {
        setErrorMessage(
          language === "hi"
            ? "माइक्रोफ़ोन एक्सेस अस्वीकार कर दिया गया था। कृपया बोलने के लिए माइक्रोफ़ोन अनुमति दें।"
            : "Microphone access was denied. Please allow microphone permissions to speak."
        );
        setConnectionState("error");
        manager.destroy();
        return;
      }

      // Establish WebSocket to backend Live API bridge with voice and selected language
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/live?voice=${selectedVoice}&lang=${language}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      manager.onAudioInput = (base64) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "audio", data: base64 }));
        }
      };

      ws.onopen = () => {
        console.log(`WebSocket connected to /ws/live (language: ${language})`);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "session_ready") {
            if (msg.sessionId) {
              sessionIdRef.current = msg.sessionId;
            }
            setConnectionState("connected");
            setAudioState("thinking");
            // Trigger opening medical question from the assistant in the chosen language
            ws.send(JSON.stringify({ type: "start_intake", language }));
          } else if (msg.type === "audio") {
            if (audioManagerRef.current) {
              audioManagerRef.current.playChunk(msg.data);
              setAudioState("speaking");
            }
          } else if (msg.type === "transcript") {
            if (msg.role === "assistant") {
              assistantSpeechBufferRef.current += (assistantSpeechBufferRef.current ? " " : "") + msg.text;
              setCurrentAssistantSentence(assistantSpeechBufferRef.current);

              if (msg.finished) {
                const textToAdd = assistantSpeechBufferRef.current.trim();
                if (textToAdd) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      role: "assistant",
                      text: textToAdd,
                      timestamp: new Date(),
                    },
                  ]);
                }
                assistantSpeechBufferRef.current = "";
                setCurrentAssistantSentence("");
              }
            } else if (msg.role === "user") {
              userSpeechBufferRef.current += (userSpeechBufferRef.current ? " " : "") + msg.text;
              setCurrentUserSentence(userSpeechBufferRef.current);

              if (msg.finished) {
                const textToAdd = userSpeechBufferRef.current.trim();
                if (textToAdd) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      role: "user",
                      text: textToAdd,
                      timestamp: new Date(),
                    },
                  ]);
                }
                userSpeechBufferRef.current = "";
                setCurrentUserSentence("");
              }
            }
          } else if (msg.type === "interrupted") {
            if (audioManagerRef.current) {
              audioManagerRef.current.stopOutput();
            }
            assistantSpeechBufferRef.current = "";
            setCurrentAssistantSentence("");
            setAudioState("listening");
          } else if (msg.type === "turn_complete") {
            // Commit assistant sentence if not finished yet
            if (assistantSpeechBufferRef.current.trim()) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  role: "assistant",
                  text: assistantSpeechBufferRef.current.trim(),
                  timestamp: new Date(),
                },
              ]);
              assistantSpeechBufferRef.current = "";
              setCurrentAssistantSentence("");
            }
            setAudioState("listening");
          } else if (msg.type === "chart_update") {
            if (msg.chart) {
              setChart((prev) => ({
                ...prev,
                ...msg.chart,
                lastUpdated: new Date().toLocaleTimeString(),
              }));
            }
          } else if (msg.type === "error") {
            setErrorMessage(msg.error || "Connection error with medical assistant");
            setConnectionState("error");
          }
        } catch (err) {
          console.error("Error processing websocket message:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setErrorMessage(
          language === "hi"
            ? "सर्वर से संपर्क नहीं हो सका। कृपया नेटवर्क और कनेक्शन जांचें।"
            : "WebSocket connection failed. Please verify network and server."
        );
        setConnectionState("error");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionState((prev) => (prev === "connected" ? "disconnected" : prev));
        setAudioState("silent");
      };
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setErrorMessage(err?.message || "Failed to initialize consultation session.");
      setConnectionState("error");
    }
  }, [selectedVoice, language, connectionState]);

  const handleSendTextMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Add immediately to local message feed
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: "user",
          text,
          timestamp: new Date(),
        },
      ]);
      wsRef.current.send(JSON.stringify({ type: "text", text }));
      setAudioState("thinking");
    }
  }, []);

  const handleResetIntake = useCallback(() => {
    setChart({ triageLevel: "routine" });
    setMessages([]);
    setCurrentAssistantSentence("");
    setCurrentUserSentence("");
    assistantSpeechBufferRef.current = "";
    userSpeechBufferRef.current = "";
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "start_intake", language }));
    }
  }, [language]);

  const handleGenerateSummary = useCallback(async () => {
    try {
      setIsGeneratingSummary(true);
      const transcriptText = messages
        .map((m) => `${m.role === "user" ? "Patient" : "Doctor Assistant"}: ${m.text}`)
        .join("\n\n");

      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart,
          transcript: transcriptText,
          language,
          sessionId: sessionIdRef.current || undefined,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setSummaryContent(data.summary);
        setSummaryModalOpen(true);
      } else {
        alert(data.error || "Could not generate clinical summary note.");
      }
    } catch (err: any) {
      console.error("Error generating summary:", err);
      alert("Failed to contact clinical documentation service.");
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [chart, messages, language]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <Header
        connectionState={connectionState}
        audioState={audioState}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        language={language}
        onSelectLanguage={setLanguage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top: Central Voice Interaction Stage */}
        <VoiceStage
          connectionState={connectionState}
          audioState={audioState}
          inputVolume={inputVolume}
          outputVolume={outputVolume}
          isMuted={isMuted}
          language={language}
          onSelectLanguage={setLanguage}
          onStartSession={startSession}
          onEndSession={endSession}
          onToggleMute={handleToggleMute}
          onResetIntake={handleResetIntake}
          currentAssistantSentence={currentAssistantSentence}
          currentUserSentence={currentUserSentence}
          errorMessage={errorMessage}
        />

        {/* Bottom Split: Clinical Intake Chart & Spoken Dialogue Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-[460px]">
          {/* Left Column: Live Structured Clinical Chart */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <IntakeChartPanel
              chart={chart}
              language={language}
              onGenerateSummary={handleGenerateSummary}
              isGeneratingSummary={isGeneratingSummary}
            />
          </div>

          {/* Right Column: Live Transcript Feed with Text Fallback */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <TranscriptFeed
              messages={messages}
              language={language}
              currentAssistantSentence={currentAssistantSentence}
              currentUserSentence={currentUserSentence}
              onSendTextMessage={handleSendTextMessage}
              isConnected={connectionState === "connected"}
              onOpenHistory={() => setHistoryModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Clinical EHR Note Modal */}
      {summaryModalOpen && (
        <SummaryModal
          summary={summaryContent}
          language={language}
          onClose={() => setSummaryModalOpen(false)}
        />
      )}

      {/* Single-File Voice Chat History Modal */}
      {historyModalOpen && (
        <VoiceHistoryModal
          language={language}
          onClose={() => setHistoryModalOpen(false)}
        />
      )}
    </div>
  );
}
