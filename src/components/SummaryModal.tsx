import React, { useState } from "react";
import { X, Copy, Check, Printer, Stethoscope } from "lucide-react";
import { Language } from "../types";
import { translations } from "../utils/translations";

interface SummaryModalProps {
  summary: string;
  language: Language;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ summary, language, onClose }) => {
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {t.modalTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50 border-y border-slate-100">
          {summary}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            {t.modalDisclaimer}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.print}</span>
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyNote}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
