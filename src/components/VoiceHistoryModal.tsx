import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Trash2,
  FileText,
  Clock,
  MessageSquare,
  Activity,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Language, PatientVoiceHistoryFile, ConsultationSessionRecord } from "../types";
import { translations } from "../utils/translations";
import { fetchVoiceHistory, downloadVoiceHistoryFile, clearVoiceHistory } from "../utils/voiceChatHistory";

interface VoiceHistoryModalProps {
  language: Language;
  onClose: () => void;
}

export const VoiceHistoryModal: React.FC<VoiceHistoryModalProps> = ({ language, onClose }) => {
  const [historyData, setHistoryData] = useState<PatientVoiceHistoryFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const t = translations[language];

  const loadData = async () => {
    setLoading(true);
    const data = await fetchVoiceHistory();
    setHistoryData(data);
    if (data.consultations.length > 0 && !selectedSessionId) {
      setSelectedSessionId(data.consultations[data.consultations.length - 1].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = async () => {
    await downloadVoiceHistoryFile();
  };

  const handleClear = async () => {
    const confirmMsg =
      language === "hi"
        ? "क्या आप वाकई सभी रिकॉर्डेड वॉयस चैट इतिहास को मिटाना चाहते हैं?"
        : "Are you sure you want to clear all recorded voice chat history?";
    if (window.confirm(confirmMsg)) {
      await clearVoiceHistory();
      await loadData();
      setSelectedSessionId(null);
    }
  };

  const handleCopyAll = () => {
    if (!historyData) return;
    const jsonStr = JSON.stringify(historyData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedSession: ConsultationSessionRecord | undefined =
    historyData?.consultations.find((s) => s.id === selectedSessionId) ||
    historyData?.consultations[historyData.consultations.length - 1];

  return (
    <div
      id="voice-history-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="voice-history-modal-container"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{t.voiceHistoryTitle}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  patient_voice_chat_history.json
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.recordedFileNotice}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="voice-history-refresh-btn"
              onClick={loadData}
              title="Refresh"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
            </button>
            <button
              id="voice-history-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Sub-bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t.totalSessions}:</span>
              <span className="font-semibold text-slate-800">
                {historyData?.recordMetadata?.totalConsultations ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t.totalTurns}:</span>
              <span className="font-semibold text-slate-800">
                {historyData?.recordMetadata?.totalSpokenTurns ?? 0}
              </span>
            </div>
            {historyData?.recordMetadata?.lastUpdated && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(historyData.recordMetadata.lastUpdated).toLocaleDateString()} {" "}
                  {new Date(historyData.recordMetadata.lastUpdated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="voice-history-download-btn"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadHistoryFile}</span>
            </button>
            <button
              id="voice-history-copy-btn"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
            {historyData && historyData.consultations.length > 0 && (
              <button
                id="voice-history-clear-btn"
                onClick={handleClear}
                title={t.clearHistory}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-teal-600" />
              <span>Loading recorded voice history...</span>
            </div>
          ) : !historyData || historyData.consultations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">
                {language === "hi" ? "कोई इतिहास उपलब्ध नहीं है" : "No Voice Consultations Recorded Yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">{t.historyEmpty}</p>
            </div>
          ) : (
            <>
              {/* Sessions List (Sidebar on desktop) */}
              <div className="w-full md:w-72 border-r border-slate-200 bg-white overflow-y-auto max-h-48 md:max-h-none shrink-0 p-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  {language === "hi" ? "दर्ज सत्र (Sessions)" : "Recorded Sessions"}
                </p>
                {historyData.consultations
                  .slice()
                  .reverse()
                  .map((session, index) => {
                    const isSelected = session.id === (selectedSession?.id || "");
                    const sessionDate = new Date(session.startedAt);
                    const turnsCount = session.turns?.length || 0;
                    const complaint = session.chart?.chiefComplaint || (language === "hi" ? "सामान्य परामर्श" : "General Consultation");

                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-50/70 border-teal-300 shadow-xs text-slate-900"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-800">
                            {sessionDate.toLocaleDateString()} {sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                              session.language === "hi" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {session.language === "hi" ? "हिन्दी" : "English"}
                          </span>
                        </div>
                        <p className="text-xs font-medium line-clamp-1 text-slate-900 mb-1">{complaint}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{turnsCount} {t.exchanges}</span>
                          <span className="text-[10px] font-mono text-slate-400">Voice: {session.voice}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Selected Session Details */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {selectedSession && (
                  <>
                    {/* Session Metadata Banner */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {selectedSession.chart?.chiefComplaint || (language === "hi" ? "वॉयस परामर्श" : "Voice Consultation")}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {t.sessionRecordBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: <span className="font-mono text-[11px]">{selectedSession.id}</span> • {new Date(selectedSession.startedAt).toLocaleString()}
                        </p>
                      </div>

                      {selectedSession.chart?.severity && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                            {t.severityRating}
                          </span>
                          <span className="text-xs font-bold text-teal-700">
                            {selectedSession.chart.severity}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Clinical Snapshot if chart was populated */}
                    {selectedSession.chart && (selectedSession.chart.location || selectedSession.chart.onset || selectedSession.chart.currentMedications?.length) && (
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          <span>{t.liveChartTitle}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {selectedSession.chart.location && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">{t.locationSite}</span>
                              <span className="font-medium text-slate-800">{selectedSession.chart.location}</span>
                            </div>
                          )}
                          {selectedSession.chart.onset && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">{t.onsetDuration}</span>
                              <span className="font-medium text-slate-800">{selectedSession.chart.onset}</span>
                            </div>
                          )}
                          {selectedSession.chart.trajectory && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">{t.trajectory}</span>
                              <span className="font-medium text-slate-800">{selectedSession.chart.trajectory}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dialogue Transcript Turns */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          {t.transcriptTitle} ({selectedSession.turns?.length || 0})
                        </p>
                      </div>

                      {selectedSession.turns && selectedSession.turns.length > 0 ? (
                        <div className="space-y-2.5">
                          {selectedSession.turns.map((turn, idx) => {
                            const isUser = turn.role === "user";
                            const turnTime = turn.timestamp ? new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                            return (
                              <div
                                key={turn.id || idx}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                                  isUser
                                    ? "bg-teal-50/50 border-teal-100/80 ml-4 sm:ml-8"
                                    : "bg-white border-slate-200 mr-4 sm:mr-8"
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                                    isUser
                                      ? "bg-teal-600 text-white shadow-2xs"
                                      : "bg-slate-100 text-teal-800 border border-slate-200"
                                  }`}
                                >
                                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                                    <span className="font-semibold text-slate-800">
                                      {isUser ? t.youPatient : t.medicalAssistant}
                                    </span>
                                    {turnTime && <span className="text-slate-400 font-mono text-[10px]">{turnTime}</span>}
                                  </div>
                                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {turn.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                          {language === "hi" ? "इस सत्र में कोई संवाद दर्ज नहीं हुआ।" : "No spoken turns recorded for this session yet."}
                        </div>
                      )}
                    </div>

                    {/* Summary Note if attached */}
                    {selectedSession.summaryNote && (
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>{t.modalTitle}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                          {selectedSession.summaryNote}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
