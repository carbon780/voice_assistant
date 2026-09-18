import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, MessageSquare, FileText } from "lucide-react";
import { ChatMessage, Language } from "../types";
import { translations } from "../utils/translations";

interface TranscriptFeedProps {
  messages: ChatMessage[];
  language: Language;
  currentAssistantSentence?: string;
  currentUserSentence?: string;
  onSendTextMessage: (text: string) => void;
  isConnected: boolean;
  onOpenHistory?: () => void;
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({
  messages,
  language,
  currentAssistantSentence,
  currentUserSentence,
  onSendTextMessage,
  isConnected,
  onOpenHistory,
}) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentAssistantSentence, currentUserSentence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendTextMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {t.transcriptTitle}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t.transcriptSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              id="feed-voice-history-btn"
              onClick={onOpenHistory}
              title={t.voiceHistoryTitle}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>{t.viewHistory}</span>
            </button>
          )}
          <span className="text-[11px] font-medium text-slate-400">
            {messages.length} {t.exchanges}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.length === 0 && !currentAssistantSentence && !currentUserSentence && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 stroke-[1.5] text-slate-300" />
            <p className="text-xs font-medium text-slate-600">{t.emptyTranscriptTitle}</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              {t.emptyTranscriptDesc}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-teal-700 border border-slate-200"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-teal-600 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className={`text-[10px] font-semibold tracking-wide ${
                      isUser ? "text-teal-100" : "text-slate-500"
                    }`}
                  >
                    {isUser ? t.youPatient : t.medicalAssistant}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isUser ? "text-teal-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Live streaming user bubble */}
        {currentUserSentence && (
          <div className="flex items-start gap-2.5 flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tr-none px-4 py-2.5 text-xs leading-relaxed bg-teal-50 border border-teal-200 text-teal-900 animate-pulse">
              <span className="text-[10px] font-semibold text-teal-700 block mb-1">
                {t.youAreSaying}
              </span>
              <p className="italic">{currentUserSentence}</p>
            </div>
          </div>
        )}

        {/* Live streaming assistant bubble */}
        {currentAssistantSentence && (
          <div className="flex items-start gap-2.5 flex-row">
            <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs leading-relaxed bg-slate-50 border border-slate-200 text-slate-800">
              <span className="text-[10px] font-semibold text-teal-700 block mb-1">
                {t.assistantSpeaking}
              </span>
              <p className="italic">{currentAssistantSentence}</p>
            </div>
          </div>
        )}
      </div>

      {/* Text fallback input form */}
      <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!isConnected}
          placeholder={
            isConnected
              ? t.inputPlaceholder
              : t.inputDisabledPlaceholder
          }
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || !isConnected}
          className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Send text to assistant"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
