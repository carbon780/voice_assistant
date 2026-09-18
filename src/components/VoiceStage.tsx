import React from "react";
import { Mic, MicOff, PhoneCall, PhoneOff, RotateCcw, Activity, Globe } from "lucide-react";
import { ConnectionState, AssistantAudioState, Language } from "../types";
import { translations } from "../utils/translations";

interface VoiceStageProps {
  connectionState: ConnectionState;
  audioState: AssistantAudioState;
  inputVolume: number;
  outputVolume: number;
  isMuted: boolean;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onStartSession: () => void;
  onEndSession: () => void;
  onToggleMute: () => void;
  onResetIntake: () => void;
  currentAssistantSentence?: string;
  currentUserSentence?: string;
  errorMessage?: string;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({
  connectionState,
  audioState,
  inputVolume,
  outputVolume,
  isMuted,
  language,
  onSelectLanguage,
  onStartSession,
  onEndSession,
  onToggleMute,
  onResetIntake,
  currentAssistantSentence,
  currentUserSentence,
  errorMessage,
}) => {
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";
  const t = translations[language];

  // Dynamic scale for visualizer rings
  const assistantScale = 1 + Math.min(outputVolume * 0.8, 0.6);
  const userScale = 1 + Math.min(inputVolume * 0.8, 0.6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-radial from-teal-50/50 via-slate-50/20 to-transparent pointer-events-none" />

      {/* Top status indicator pill & Language reminder */}
      <div className="relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2">
        {isConnected ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                audioState === "speaking"
                  ? "bg-teal-600 animate-pulse"
                  : audioState === "listening"
                  ? "bg-emerald-500 animate-ping"
                  : "bg-teal-500"
              }`}
            />
            <span>
              {audioState === "speaking"
                ? t.statusAssistantSpeaking
                : audioState === "listening"
                ? `${t.statusListening} (${language === "hi" ? "हिंदी में बोलें" : "Speak naturally"})`
                : audioState === "thinking"
                ? t.statusProcessing
                : t.statusActive}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.statusReady}</span>
          </div>
        )}

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200/60">
          <Globe className="w-3 h-3 text-teal-600" />
          <span>{language === "hi" ? "भाषा: हिन्दी" : "Language: English"}</span>
        </div>
      </div>

      {/* Main Interactive Visualizer Orb */}
      <div className="relative z-10 my-4 flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
        {/* Outermost animated pulse ring */}
        {isConnected && audioState === "speaking" && (
          <div
            className="absolute inset-0 rounded-full bg-teal-200/40 transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${assistantScale * 1.3})`,
              opacity: Math.max(0.2, outputVolume * 1.5),
            }}
          />
        )}
        {isConnected && audioState === "listening" && !isMuted && (
          <div
            className="absolute inset-0 rounded-full bg-emerald-200/40 transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${userScale * 1.3})`,
              opacity: Math.max(0.2, inputVolume * 1.5),
            }}
          />
        )}

        {/* Secondary wave ring */}
        {isConnected && (
          <div
            className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full transition-transform duration-100 ease-out ${
              audioState === "speaking"
                ? "bg-teal-300/30"
                : audioState === "listening"
                ? "bg-emerald-300/30"
                : "bg-slate-200/40"
            }`}
            style={{
              transform: `scale(${
                audioState === "speaking"
                  ? assistantScale * 1.15
                  : audioState === "listening"
                  ? userScale * 1.15
                  : 1
              })`,
            }}
          />
        )}

        {/* Core Visualizer Orb */}
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${
            isConnected
              ? audioState === "speaking"
                ? "bg-teal-600 text-white shadow-teal-600/20"
                : audioState === "listening"
                ? "bg-emerald-600 text-white shadow-emerald-600/20"
                : "bg-teal-700 text-white shadow-teal-700/20"
              : isConnecting
              ? "bg-amber-500 text-white animate-pulse"
              : "bg-slate-100 border border-slate-200 text-slate-600"
          }`}
        >
          {isConnected ? (
            <>
              {audioState === "speaking" ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-9 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-7 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
              ) : audioState === "listening" ? (
                <div className="flex flex-col items-center">
                  <Mic className="w-8 h-8 animate-pulse text-white" />
                  <span className="text-[10px] font-medium tracking-wide mt-1 uppercase opacity-90">
                    {language === "hi" ? "सुन रहे हैं" : "Listening"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Activity className="w-8 h-8 text-white/90" />
                  <span className="text-[10px] font-medium tracking-wide mt-1 uppercase opacity-90">
                    {language === "hi" ? "समझ रहे हैं" : "Thinking"}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-8 h-8 text-slate-400" />
              <span className="text-[10px] font-medium tracking-wide mt-1 uppercase text-slate-500">
                {language === "hi" ? "तैयार" : "Ready"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Subtitles / Live Speech Display */}
      <div className="relative z-10 w-full max-w-xl min-h-[64px] mb-5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
        {isConnected ? (
          currentAssistantSentence ? (
            <p className="text-sm text-slate-800 font-medium leading-relaxed italic">
              "{currentAssistantSentence}"
            </p>
          ) : currentUserSentence ? (
            <p className="text-sm text-teal-800 font-medium leading-relaxed">
              <span className="text-xs uppercase text-teal-600 font-bold mr-1">{t.youPrefix}</span>
              "{currentUserSentence}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              {t.subtitlesAwaiting}
            </p>
          )
        ) : (
          <p className="text-xs text-slate-500 max-w-md">
            {t.tapToSpeakNotice}
          </p>
        )}
      </div>

      {/* Error message alert */}
      {errorMessage && (
        <div className="relative z-10 mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 max-w-md">
          {errorMessage}
        </div>
      )}

      {/* Language selection banner before connecting */}
      {!isConnected && (
        <div className="relative z-10 mb-4 flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{t.languageLabel}:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => onSelectLanguage("en")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                language === "en"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSelectLanguage("hi")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                language === "hi"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>
      )}

      {/* Main Call Actions */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
        {!isConnected ? (
          <button
            onClick={onStartSession}
            disabled={isConnecting}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm shadow-sm transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isConnecting ? t.connectingSession : t.startConsultation}</span>
          </button>
        ) : (
          <>
            <button
              onClick={onToggleMute}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isMuted
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? t.unmuteMic : t.muteMic}</span>
            </button>

            <button
              onClick={onEndSession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{t.endConsultation}</span>
            </button>

            <button
              onClick={onResetIntake}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              title={t.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.reset}</span>
            </button>
          </>
        )}
      </div>

      {/* Guided Consultation Progression Indicators */}
      <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 w-full max-w-2xl">
        <div className="text-left mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.progressionProtocol}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-teal-600 block">Step 1</span>
            <span className="text-xs font-medium text-slate-800">{t.step1Title}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.step1Desc}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-teal-600 block">Step 2</span>
            <span className="text-xs font-medium text-slate-800">{t.step2Title}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.step2Desc}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-teal-600 block">Step 3</span>
            <span className="text-xs font-medium text-slate-800">{t.step3Title}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.step3Desc}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-teal-600 block">Step 4</span>
            <span className="text-xs font-medium text-slate-800">{t.step4Title}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.step4Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
