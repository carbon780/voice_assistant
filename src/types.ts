export interface IntakeChart {
  chiefComplaint?: string;
  location?: string;
  onset?: string;
  severity?: string;
  trajectory?: 'improving' | 'worsening' | 'constant' | string;
  associatedSymptoms?: string[];
  currentMedications?: string[];
  allergies?: string[];
  surgeriesAndHospitalizations?: string[];
  medicalHistory?: string[];
  triageLevel?: 'routine' | 'urgent' | 'emergency';
  clinicalNotes?: string;
  lastUpdated?: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  text: string;
  timestamp: Date;
  isLiveTranscript?: boolean;
}

export type ConnectionState = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'error' 
  | 'disconnected';

export type AssistantAudioState = 
  | 'silent' 
  | 'listening' 
  | 'thinking' 
  | 'speaking';

export type Language = 'en' | 'hi';

export interface VoiceChatTurn {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  language?: Language;
}

export interface ConsultationSessionRecord {
  id: string;
  startedAt: string;
  endedAt?: string;
  language: Language;
  voice: string;
  turns: VoiceChatTurn[];
  chart?: IntakeChart;
  summaryNote?: string;
}

export interface PatientVoiceHistoryFile {
  recordMetadata: {
    title: string;
    description: string;
    version: string;
    created: string;
    lastUpdated: string;
    totalConsultations: number;
    totalSpokenTurns: number;
  };
  consultations: ConsultationSessionRecord[];
}
