import React from "react";
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  Pill, 
  HeartHandshake, 
  Copy, 
  Check, 
  Sparkles,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { IntakeChart, Language } from "../types";
import { translations } from "../utils/translations";

interface IntakeChartPanelProps {
  chart: IntakeChart;
  language: Language;
  onGenerateSummary: () => void;
  isGeneratingSummary: boolean;
}

export const IntakeChartPanel: React.FC<IntakeChartPanelProps> = ({
  chart,
  language,
  onGenerateSummary,
  isGeneratingSummary,
}) => {
  const [copied, setCopied] = React.useState(false);
  const t = translations[language];

  const parseSeverityNumber = (sev?: string): number | null => {
    if (!sev) return null;
    const match = sev.match(/(\d+)/);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 1 && val <= 10) return val;
    }
    return null;
  };

  const severityNum = parseSeverityNumber(chart.severity);

  const copyChartToClipboard = () => {
    const text = `PATIENT INTAKE SUMMARY (${language === "hi" ? "HINDI CONSULTATION" : "ENGLISH"})
----------------------
${t.chiefComplaint}: ${chart.chiefComplaint || "Not specified"}
${t.locationSite}: ${chart.location || "Not specified"}
${t.onsetDuration}: ${chart.onset || "Not specified"}
${t.severityRating}: ${chart.severity || "Not specified"}
${t.trajectory}: ${chart.trajectory || "Not specified"}

${t.associatedSymptoms}:
${chart.associatedSymptoms?.length ? chart.associatedSymptoms.map((s) => `• ${s}`).join("\n") : "None reported"}

${t.currentMedications}:
${chart.currentMedications?.length ? chart.currentMedications.map((m) => `• ${m}`).join("\n") : "None reported"}

${t.knownAllergies}:
${chart.allergies?.length ? chart.allergies.map((a) => `• ${a}`).join("\n") : "No known drug allergies (NKDA)"}

${t.conditions}:
${chart.medicalHistory?.length ? chart.medicalHistory.map((h) => `• ${h}`).join("\n") : "None reported"}

${t.surgeries}:
${chart.surgeriesAndHospitalizations?.length ? chart.surgeriesAndHospitalizations.map((s) => `• ${s}`).join("\n") : "None reported"}

${t.triageCategory}: ${(chart.triageLevel || "routine").toUpperCase()}
Notes: ${chart.clinicalNotes || "None"}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasData = Boolean(
    chart.chiefComplaint ||
    chart.location ||
    chart.onset ||
    chart.severity ||
    (chart.associatedSymptoms && chart.associatedSymptoms.length > 0) ||
    (chart.currentMedications && chart.currentMedications.length > 0) ||
    (chart.allergies && chart.allergies.length > 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 flex flex-col h-full shadow-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {t.liveChartTitle}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t.liveChartSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyChartToClipboard}
            disabled={!hasData}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Copy intake summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copy}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chart Content Area */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Chief Complaint & Location Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t.chiefComplaint}
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {chart.chiefComplaint || (
                <span className="text-slate-400 italic font-normal">{t.chiefComplaintAwaiting}</span>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{t.locationSite}</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {chart.location || (
                <span className="text-slate-400 italic font-normal">{t.locationNotSpecified}</span>
              )}
            </p>
          </div>
        </div>

        {/* Onset, Severity & Trajectory Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{t.onsetDuration}</span>
              </div>
              <p className="text-xs font-medium text-slate-800">
                {chart.onset || <span className="text-slate-400 italic font-normal">{t.onsetPending}</span>}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                {t.trajectory}
              </span>
              <div className="flex items-center gap-1 text-xs font-medium">
                {chart.trajectory?.toLowerCase().includes("worsen") || chart.trajectory?.includes("बढ़") ? (
                  <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-xs">
                    <TrendingUp className="w-3 h-3" /> {t.worsening}
                  </span>
                ) : chart.trajectory?.toLowerCase().includes("improv") || chart.trajectory?.toLowerCase().includes("better") || chart.trajectory?.includes("सुधार") ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                    <TrendingDown className="w-3 h-3" /> {t.improving}
                  </span>
                ) : chart.trajectory ? (
                  <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                    <Minus className="w-3 h-3" /> {chart.trajectory}
                  </span>
                ) : (
                  <span className="text-slate-400 italic font-normal">{t.onsetPending}</span>
                )}
              </div>
            </div>
          </div>

          {/* Severity Visual Rating */}
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {t.severityRating}
              </span>
              <span className="font-semibold text-slate-800">
                {chart.severity || <span className="text-slate-400 italic font-normal">{t.severityUnrated}</span>}
              </span>
            </div>
            {/* Visual 10-step progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  severityNum && severityNum >= 7
                    ? "bg-rose-500"
                    : severityNum && severityNum >= 4
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${severityNum ? severityNum * 10 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{t.mild}</span>
              <span>{t.moderate}</span>
              <span>{t.severe}</span>
            </div>
          </div>
        </div>

        {/* Associated Symptoms */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-2">
            {t.associatedSymptoms}
          </span>
          {chart.associatedSymptoms && chart.associatedSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {chart.associatedSymptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 text-xs font-medium"
                >
                  {sym}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">{t.noAssociatedSymptoms}</p>
          )}
        </div>

        {/* Medications & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Medications */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <Pill className="w-3 h-3 text-slate-400" />
              <span>{t.currentMedications}</span>
            </div>
            {chart.currentMedications && chart.currentMedications.length > 0 ? (
              <ul className="space-y-1">
                {chart.currentMedications.map((med, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                    <span>{med}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">{t.noMedications}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>{t.knownAllergies}</span>
            </div>
            {chart.allergies && chart.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {chart.allergies.map((allg, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
                  >
                    {allg}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">{t.noAllergies}</p>
            )}
          </div>
        </div>

        {/* Medical History & Surgeries */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            <HeartHandshake className="w-3 h-3 text-slate-400" />
            <span>{t.medicalHistoryAndSurgeries}</span>
          </div>
          <div className="space-y-2">
            {chart.medicalHistory && chart.medicalHistory.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">{t.conditions}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {chart.medicalHistory.map((cond, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {chart.surgeriesAndHospitalizations && chart.surgeriesAndHospitalizations.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">{t.surgeries}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {chart.surgeriesAndHospitalizations.map((surg, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs">
                      {surg}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(!chart.medicalHistory || chart.medicalHistory.length === 0) &&
              (!chart.surgeriesAndHospitalizations || chart.surgeriesAndHospitalizations.length === 0) && (
                <p className="text-xs text-slate-400 italic">{t.noHistory}</p>
              )}
          </div>
        </div>

        {/* Triage Status Banner */}
        {chart.triageLevel && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              chart.triageLevel === "emergency"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : chart.triageLevel === "urgent"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <span className="font-semibold block uppercase text-[11px]">
                  {t.triageCategory}: {chart.triageLevel}
                </span>
                <span className="text-[11px] opacity-90">
                  {chart.clinicalNotes || (language === "hi" ? "चिकित्सीय परीक्षण की सिफारिश की गई है।" : "Clinical evaluation recommended.")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Doctor Summary Button */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onGenerateSummary}
          disabled={!hasData || isGeneratingSummary}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {isGeneratingSummary ? t.generatingDoctorNote : t.generateDoctorNote}
          </span>
        </button>
      </div>
    </div>
  );
};
