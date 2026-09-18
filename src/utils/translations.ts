import { Language } from "../types";

export interface Translations {
  emergencyNoticeTitle: string;
  emergencyNoticeBody: string;
  appTitle: string;
  appBadge: string;
  appSubtitle: string;
  voiceLabel: string;
  languageLabel: string;
  micMuted: string;
  micActive: string;
  statusAssistantSpeaking: string;
  statusListening: string;
  statusProcessing: string;
  statusActive: string;
  statusReady: string;
  statusConnecting: string;
  statusError: string;
  startConsultation: string;
  connectingSession: string;
  endConsultation: string;
  reset: string;
  unmuteMic: string;
  muteMic: string;
  tapToSpeakNotice: string;
  subtitlesAwaiting: string;
  youPrefix: string;
  progressionProtocol: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  liveChartTitle: string;
  liveChartSubtitle: string;
  copy: string;
  copied: string;
  chiefComplaint: string;
  chiefComplaintAwaiting: string;
  locationSite: string;
  locationNotSpecified: string;
  onsetDuration: string;
  onsetPending: string;
  trajectory: string;
  improving: string;
  worsening: string;
  constant: string;
  severityRating: string;
  severityUnrated: string;
  mild: string;
  moderate: string;
  severe: string;
  associatedSymptoms: string;
  noAssociatedSymptoms: string;
  currentMedications: string;
  noMedications: string;
  knownAllergies: string;
  noAllergies: string;
  medicalHistoryAndSurgeries: string;
  conditions: string;
  surgeries: string;
  noHistory: string;
  triageCategory: string;
  generateDoctorNote: string;
  generatingDoctorNote: string;
  transcriptTitle: string;
  transcriptSubtitle: string;
  exchanges: string;
  emptyTranscriptTitle: string;
  emptyTranscriptDesc: string;
  youPatient: string;
  medicalAssistant: string;
  youAreSaying: string;
  assistantSpeaking: string;
  inputPlaceholder: string;
  inputDisabledPlaceholder: string;
  modalTitle: string;
  modalSubtitle: string;
  modalDisclaimer: string;
  print: string;
  copyNote: string;
  voiceHistoryTitle: string;
  voiceHistorySubtitle: string;
  viewHistory: string;
  downloadHistoryFile: string;
  clearHistory: string;
  totalSessions: string;
  totalTurns: string;
  historyEmpty: string;
  recordedFileNotice: string;
  sessionRecordBadge: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    emergencyNoticeTitle: "Emergency Notice:",
    emergencyNoticeBody:
      "If you are experiencing chest pain, severe shortness of breath, sudden numbness, or life-threatening symptoms, call 911 or go to the nearest emergency room immediately.",
    appTitle: "Medical Voice Assistant",
    appBadge: "Live Consultation",
    appSubtitle: "Natural spoken clinical intake • One question at a time",
    voiceLabel: "Voice",
    languageLabel: "Language",
    micMuted: "Mic Muted",
    micActive: "Mic Active",
    statusAssistantSpeaking: "Assistant Speaking",
    statusListening: "Listening to You",
    statusProcessing: "Processing...",
    statusActive: "Active Consultation",
    statusReady: "Ready to begin",
    statusConnecting: "Connecting...",
    statusError: "Connection Error",
    startConsultation: "Start Voice Consultation",
    connectingSession: "Connecting Voice Session...",
    endConsultation: "End Consultation",
    reset: "Reset",
    unmuteMic: "Unmute Mic",
    muteMic: "Mute Mic",
    tapToSpeakNotice: "Tap 'Start Voice Consultation' to speak live with the assistant. It will gently ask you about your symptoms and medical history.",
    subtitlesAwaiting: "The assistant will ask questions one at a time. Speak whenever you are ready.",
    youPrefix: "You:",
    progressionProtocol: "Intake Progression Protocol",
    step1Title: "Problem & Location",
    step1Desc: "Symptoms & body site",
    step2Title: "Onset & Duration",
    step2Desc: "When it started",
    step3Title: "Severity & Trajectory",
    step3Desc: "Scale 1-10 & better/worse",
    step4Title: "History & Meds",
    step4Desc: "Surgeries, allergies, conditions",
    liveChartTitle: "Live Clinical Intake Chart",
    liveChartSubtitle: "Auto-populated in real time from conversation",
    copy: "Copy",
    copied: "Copied",
    chiefComplaint: "Chief Complaint",
    chiefComplaintAwaiting: "Awaiting symptom description...",
    locationSite: "Location / Site",
    locationNotSpecified: "Not specified yet",
    onsetDuration: "Onset & Duration",
    onsetPending: "Not recorded yet",
    trajectory: "Trajectory",
    improving: "Improving",
    worsening: "Worsening",
    constant: "Constant",
    severityRating: "Severity Rating",
    severityUnrated: "Unrated",
    mild: "Mild (1-3)",
    moderate: "Moderate (4-6)",
    severe: "Severe (7-10)",
    associatedSymptoms: "Associated Symptoms",
    noAssociatedSymptoms: "No secondary symptoms recorded yet",
    currentMedications: "Current Medications",
    noMedications: "None reported or not asked",
    knownAllergies: "Known Allergies",
    noAllergies: "No known drug allergies reported",
    medicalHistoryAndSurgeries: "Medical History & Past Surgeries",
    conditions: "Conditions:",
    surgeries: "Surgeries:",
    noHistory: "No significant history noted",
    triageCategory: "Triage Category",
    generateDoctorNote: "Generate Doctor Intake Note",
    generatingDoctorNote: "Synthesizing Clinical Note...",
    transcriptTitle: "Spoken Dialogue Transcript",
    transcriptSubtitle: "Live captions of patient & assistant speech",
    exchanges: "exchanges",
    emptyTranscriptTitle: "Conversation will appear here",
    emptyTranscriptDesc: "Once you start the consultation, your verbal dialogue and answers will be transcribed in real time.",
    youPatient: "You (Patient)",
    medicalAssistant: "Medical Assistant",
    youAreSaying: "You are saying...",
    assistantSpeaking: "Dr. Assistant speaking...",
    inputPlaceholder: "Type an answer or medication name...",
    inputDisabledPlaceholder: "Connect to send text messages",
    modalTitle: "Medical Provider Intake Note",
    modalSubtitle: "Clinical assessment note ready for Electronic Health Record (EHR)",
    modalDisclaimer: "Confidential Medical Intake Document",
    print: "Print",
    copyNote: "Copy Clinical Note",
    voiceHistoryTitle: "Patient Voice Chat History",
    voiceHistorySubtitle: "Recorded in patient_voice_chat_history.json",
    viewHistory: "Voice History",
    downloadHistoryFile: "Download History File (.json)",
    clearHistory: "Clear History",
    totalSessions: "Consultations Recorded",
    totalTurns: "Spoken Exchanges",
    historyEmpty: "No voice consultations recorded yet. Start a consultation to begin recording.",
    recordedFileNotice: "All voice chats with AI are automatically recorded in a single file: patient_voice_chat_history.json",
    sessionRecordBadge: "Recorded in History File",
  },
  hi: {
    emergencyNoticeTitle: "आपातकालीन सूचना:",
    emergencyNoticeBody:
      "यदि आपको सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ, अचानक सुन्नता या जानलेवा लक्षण महसूस हो रहे हैं, तो तुरंत 108/112 पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।",
    appTitle: "मेडिकल वॉयस असिस्टेंट",
    appBadge: "लाइव वॉयस परामर्श",
    appSubtitle: "स्वाभाविक मौखिक स्वास्थ्य परामर्श • एक बार में एक प्रश्न",
    voiceLabel: "आवाज",
    languageLabel: "भाषा",
    micMuted: "माइक बंद है",
    micActive: "माइक चालू है",
    statusAssistantSpeaking: "सहायक बोल रहे हैं",
    statusListening: "आपकी बात सुन रहे हैं",
    statusProcessing: "समझ रहे हैं...",
    statusActive: "सक्रिय परामर्श",
    statusReady: "शुरू करने के लिए तैयार",
    statusConnecting: "कनेक्ट हो रहा है...",
    statusError: "कनेक्शन त्रुटि",
    startConsultation: "आवाज परामर्श शुरू करें (हिंदी)",
    connectingSession: "वॉयस सेशन कनेक्ट हो रहा है...",
    endConsultation: "परामर्श समाप्त करें",
    reset: "रीसेट करें",
    unmuteMic: "माइक खोलें",
    muteMic: "माइक म्यूट करें",
    tapToSpeakNotice: "'आवाज परामर्श शुरू करें' पर टैप करें। मेडिकल सहायक आपसे आपकी भाषा में एक-एक करके स्वास्थ्य समस्या और लक्षण पूछेगी।",
    subtitlesAwaiting: "सहायक एक बार में केवल एक प्रश्न पूछेंगे। जब आप तैयार हों, स्वाभाविक रूप से बोलें।",
    youPrefix: "आप:",
    progressionProtocol: "परामर्श प्रक्रिया क्रम",
    step1Title: "समस्या व स्थान",
    step1Desc: "लक्षण व शरीर का हिस्सा",
    step2Title: "शुरुआत व समय",
    step2Desc: "यह कब से शुरू हुआ",
    step3Title: "गंभीरता व प्रभाव",
    step3Desc: "1-10 पैमाना व घट/बढ़",
    step4Title: "दवाइयाँ व इतिहास",
    step4Desc: "बीमारियाँ, सर्जरी व एलर्जी",
    liveChartTitle: "लाइव मेडिकल चार्ट",
    liveChartSubtitle: "बातचीत के आधार पर अपने आप तैयार होता डेटा",
    copy: "कॉपी करें",
    copied: "कॉपी हो गया",
    chiefComplaint: "मुख्य समस्या / लक्षण",
    chiefComplaintAwaiting: "लक्षणों का विवरण प्रतीक्षारत...",
    locationSite: "दर्द / समस्या का स्थान",
    locationNotSpecified: "अभी दर्ज नहीं हुआ",
    onsetDuration: "शुरुआत व समय अवधि",
    onsetPending: "अभी दर्ज नहीं हुआ",
    trajectory: "बदलाव (Trajectory)",
    improving: "सुधार हो रहा है",
    worsening: "बढ़ रहा है",
    constant: "समान है",
    severityRating: "तकलीफ की तीव्रता (Severity)",
    severityUnrated: "निर्धारित नहीं",
    mild: "हल्की (1-3)",
    moderate: "मध्यम (4-6)",
    severe: "गंभीर (7-10)",
    associatedSymptoms: "अन्य जुड़े लक्षण",
    noAssociatedSymptoms: "अन्य कोई लक्षण दर्ज नहीं हुआ",
    currentMedications: "वर्तमान दवाइयाँ",
    noMedications: "कोई दवा नहीं बताई गई",
    knownAllergies: "ज्ञात एलर्जी",
    noAllergies: "कोई दवा एलर्जी दर्ज नहीं",
    medicalHistoryAndSurgeries: "पुरानी बीमारियाँ व पिछली सर्जरी",
    conditions: "बीमारियाँ:",
    surgeries: "सर्जरी:",
    noHistory: "कोई विशेष इतिहास दर्ज नहीं",
    triageCategory: "ट्राइएज श्रेणी (Triage)",
    generateDoctorNote: "डॉक्टर के लिए क्लिनिकल नोट बनाएं",
    generatingDoctorNote: "क्लिनिकल रिपोर्ट तैयार हो रही है...",
    transcriptTitle: "बातचीत का लिखित ट्रांसक्रिप्ट",
    transcriptSubtitle: "मरीज और सहायक की बातचीत के लाइव सबटाइटल्स",
    exchanges: "संवाद",
    emptyTranscriptTitle: "बातचीत यहाँ दिखाई देगी",
    emptyTranscriptDesc: "परामर्श शुरू होने के बाद, आपका और सहायक का वार्तालाप यहाँ रीयल-टाइम में लिखा जाएगा।",
    youPatient: "आप (मरीज)",
    medicalAssistant: "मेडिकल सहायक",
    youAreSaying: "आप बोल रहे हैं...",
    assistantSpeaking: "सहायक बोल रही हैं...",
    inputPlaceholder: "उत्तर या दवा का नाम टाइप करें...",
    inputDisabledPlaceholder: "मैसेज भेजने के लिए पहले कनेक्ट करें",
    modalTitle: "डॉक्टर परामर्श रिपोर्ट (Medical Note)",
    modalSubtitle: "इलेक्ट्रॉनिक हेल्थ रिकॉर्ड (EHR) हेतु क्लिनिकल सारांश",
    modalDisclaimer: "गोपनीय चिकित्सीय दस्तावेज (Confidential)",
    print: "प्रिंट करें",
    copyNote: "रिपोर्ट कॉपी करें",
    voiceHistoryTitle: "मरीज की वॉयस चैट हिस्ट्री",
    voiceHistorySubtitle: "patient_voice_chat_history.json में संकलित",
    viewHistory: "वॉयस हिस्ट्री",
    downloadHistoryFile: "इतिहास फ़ाइल डाउनलोड करें (.json)",
    clearHistory: "इतिहास मिटाएं",
    totalSessions: "दर्ज परामर्श",
    totalTurns: "बोले गए संवाद",
    historyEmpty: "अभी तक कोई वॉयस परामर्श रिकॉर्ड नहीं हुआ है। इतिहास रिकॉर्ड करने के लिए परामर्श शुरू करें।",
    recordedFileNotice: "मरीज और AI के बीच के सभी वार्तालाप एक ही स्थान पर patient_voice_chat_history.json फ़ाइल में रिकॉर्ड होते हैं",
    sessionRecordBadge: "इतिहास फ़ाइल में रिकॉर्डेड",
  },
};
