import { PatientVoiceHistoryFile, ConsultationSessionRecord } from "../types";

const LOCAL_STORAGE_KEY = "patient_voice_chat_history_cache";

/**
 * Loads the consolidated voice chat history from the single server record file (patient_voice_chat_history.json),
 * with graceful localStorage fallback.
 */
export async function fetchVoiceHistory(): Promise<PatientVoiceHistoryFile> {
  try {
    const res = await fetch("/api/history");
    if (res.ok) {
      const data: PatientVoiceHistoryFile = await res.json();
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch (_) {}
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch remote history, checking local cache:", err);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_) {}

  return {
    recordMetadata: {
      title: "Patient Voice Chat History Record",
      description: "Consolidated repository recording all voice-to-voice consultations and dialogues between patient and AI medical assistant.",
      version: "1.0.0",
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalConsultations: 0,
      totalSpokenTurns: 0,
    },
    consultations: [],
  };
}

/**
 * Downloads the single unified patient_voice_chat_history.json file to the patient's device.
 */
export async function downloadVoiceHistoryFile(): Promise<void> {
  try {
    const res = await fetch("/api/history/download");
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patient_voice_chat_history.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
  } catch (err) {
    console.warn("Server download failed, generating client download:", err);
  }

  // Client-side fallback download
  const history = await fetchVoiceHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "patient_voice_chat_history.json";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Clears the voice history file.
 */
export async function clearVoiceHistory(): Promise<boolean> {
  try {
    const res = await fetch("/api/history", { method: "DELETE" });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return res.ok;
  } catch (err) {
    console.error("Failed to clear voice history:", err);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return false;
  }
}
