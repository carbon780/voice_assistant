import React from "react";
import { Stethoscope, AlertTriangle, ShieldCheck, Volume2, Mic, MicOff, Globe, FileText } from "lucide-react";
import { ConnectionState, AssistantAudioState, Language } from "../types";
import { translations } from "../utils/translations";

interface HeaderProps {
  connectionState: ConnectionState;
  audioState: AssistantAudioState;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  audioState,
  selectedVoice,
  onSelectVoice,
  language,
  onSelectLanguage,
  isMuted,
  onToggleMute,
  onOpenHistory,
}) => {
  const t = translations[language];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Emergency Alert Notice */}
      <div className="bg-rose-50 border-b border-rose-100 px-4 py-1.5 text-xs text-rose-800 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span>
            <strong>{t.emergencyNoticeTitle}</strong> {t.emergencyNoticeBody}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                {t.appTitle}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/60">
                <ShieldCheck className="w-3 h-3" /> {t.appBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Controls & Status */}
        <div className="flex items-center flex-wrap gap-2.5 ml-auto">
          {/* Dual Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center px-1.5 py-1 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => onSelectLanguage("en")}
              disabled={connectionState === "connected"}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer disabled:cursor-not-allowed ${
                language === "en"
                  ? "bg-white text-teal-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSelectLanguage("hi")}
              disabled={connectionState === "connected"}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer disabled:cursor-not-allowed ${
                language === "hi"
                  ? "bg-white text-teal-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          {/* Voice Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-500">{t.voiceLabel}:</span>
            <select
              value={selectedVoice}
              disabled={connectionState === "connected"}
              onChange={(e) => onSelectVoice(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="Kore">Kore (Warm / आत्मीय)</option>
              <option value="Zephyr">Zephyr (Calm / शांत)</option>
              <option value="Puck">Puck (Friendly / मित्रवत)</option>
              <option value="Fenrir">Fenrir (Deep / गंभीर)</option>
              <option value="Charon">Charon (Measured / स्पष्ट)</option>
            </select>
          </div>

          {/* Voice History Button */}
          {onOpenHistory && (
            <button
              id="header-voice-history-btn"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title={t.voiceHistoryTitle}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.viewHistory}</span>
            </button>
          )}

          {/* Mute Mic Button (when connected) */}
          {connectionState === "connected" && (
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isMuted
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title={isMuted ? t.unmuteMic : t.muteMic}
            >
              {isMuted ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t.micMuted}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.micActive}</span>
                </>
              )}
            </button>
          )}

          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === "connected"
                  ? audioState === "speaking"
                    ? "bg-teal-500 animate-pulse"
                    : audioState === "listening"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-teal-500"
                  : connectionState === "connecting"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-400"
              }`}
            />
            <span className="text-slate-700">
              {connectionState === "connected"
                ? audioState === "speaking"
                  ? t.statusAssistantSpeaking
                  : audioState === "listening"
                  ? t.statusListening
                  : audioState === "thinking"
                  ? t.statusProcessing
                  : t.statusActive
                : connectionState === "connecting"
                ? t.statusConnecting
                : connectionState === "error"
                ? t.statusError
                : t.statusReady}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
