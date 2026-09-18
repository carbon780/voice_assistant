import fs from "fs";
import path from "path";
import { ConsultationSessionRecord, PatientVoiceHistoryFile, VoiceChatTurn, IntakeChart } from "./src/types";

const HISTORY_FILE_PATH = path.join(process.cwd(), "patient_voice_chat_history.json");

/**
 * Ensures the single history file exists and returns its parsed content.
 */
export function getHistoryFile(): PatientVoiceHistoryFile {
  try {
    if (fs.existsSync(HISTORY_FILE_PATH)) {
      const data = fs.readFileSync(HISTORY_FILE_PATH, "utf-8");
      return JSON.parse(data) as PatientVoiceHistoryFile;
    }
  } catch (err) {
    console.error("Failed to read history file, re-initializing:", err);
  }

  const initialRecord: PatientVoiceHistoryFile = {
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

  saveHistoryFile(initialRecord);
  return initialRecord;
}

/**
 * Atomically writes the history object back to patient_voice_chat_history.json.
 */
export function saveHistoryFile(data: PatientVoiceHistoryFile): void {
  try {
    data.recordMetadata.lastUpdated = new Date().toISOString();
    let totalTurns = 0;
    for (const session of data.consultations) {
      totalTurns += session.turns?.length || 0;
    }
    data.recordMetadata.totalConsultations = data.consultations.length;
    data.recordMetadata.totalSpokenTurns = totalTurns;

    fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to patient_voice_chat_history.json:", err);
  }
}

/**
 * Starts or retrieves an active consultation session in the record file.
 */
export function startOrGetSessionRecord(sessionId: string, language: "en" | "hi", voice: string): ConsultationSessionRecord {
  const history = getHistoryFile();
  let existing = history.consultations.find((s) => s.id === sessionId);

  if (!existing) {
    existing = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      language,
      voice,
      turns: [],
    };
    history.consultations.push(existing);
    saveHistoryFile(history);
  }

  return existing;
}

/**
 * Appends a spoken voice turn (patient or AI) into the single history file.
 */
export function recordSpokenTurnInHistory(
  sessionId: string,
  role: "assistant" | "user",
  text: string,
  language?: "en" | "hi"
): void {
  if (!text || !text.trim()) return;

  const history = getHistoryFile();
  let session = history.consultations.find((s) => s.id === sessionId);

  if (!session) {
    session = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      language: language || "en",
      voice: "Kore",
      turns: [],
    };
    history.consultations.push(session);
  }

  const newTurn: VoiceChatTurn = {
    id: `${sessionId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    role,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    language,
  };

  session.turns.push(newTurn);
  saveHistoryFile(history);
}

/**
 * Updates the clinical intake chart snapshot for the session in the history file.
 */
export function updateSessionChartInHistory(sessionId: string, chart: IntakeChart): void {
  const history = getHistoryFile();
  const session = history.consultations.find((s) => s.id === sessionId);
  if (session) {
    session.chart = { ...session.chart, ...chart };
    saveHistoryFile(history);
  }
}

/**
 * Concludes a session and optionally attaches a physician summary note.
 */
export function completeSessionInHistory(sessionId: string, summaryNote?: string): void {
  const history = getHistoryFile();
  const session = history.consultations.find((s) => s.id === sessionId);
  if (session) {
    session.endedAt = new Date().toISOString();
    if (summaryNote) {
      session.summaryNote = summaryNote;
    }
    saveHistoryFile(history);
  }
}

/**
 * Clears all recorded history from the file while preserving structure.
 */
export function clearAllVoiceHistory(): void {
  const initialRecord: PatientVoiceHistoryFile = {
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
  saveHistoryFile(initialRecord);
}
