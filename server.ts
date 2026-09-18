import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { IntakeChart } from "./src/types";
import {
  getHistoryFile,
  recordSpokenTurnInHistory,
  updateSessionChartInHistory,
  completeSessionInHistory,
  startOrGetSessionRecord,
  clearAllVoiceHistory,
} from "./historyRecorder";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/live" });

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const updateIntakeChartDeclaration: FunctionDeclaration = {
  name: "update_intake_chart",
  description: "Record and update the structured clinical intake chart based on details the patient has shared.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chiefComplaint: {
        type: Type.STRING,
        description: "The primary symptom or reason for the patient's visit",
      },
      location: {
        type: Type.STRING,
        description: "Exact anatomical location of the symptom or pain",
      },
      onset: {
        type: Type.STRING,
        description: "When the symptoms began, frequency, or duration",
      },
      severity: {
        type: Type.STRING,
        description: "Severity description or rating (e.g. '7/10', 'moderate aching')",
      },
      trajectory: {
        type: Type.STRING,
        description: "Whether the condition is 'improving', 'worsening', or 'constant'",
      },
      associatedSymptoms: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Secondary or related symptoms (e.g. fever, nausea, fatigue)",
      },
      currentMedications: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Medications or supplements the patient currently takes",
      },
      allergies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Known allergies, especially drug allergies",
      },
      surgeriesAndHospitalizations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Past surgeries, hospital stays, or relevant medical procedures",
      },
      medicalHistory: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Underlying or chronic conditions (e.g. hypertension, asthma, diabetes)",
      },
      triageLevel: {
        type: Type.STRING,
        description: "'routine' (standard assessment), 'urgent' (prompt medical review needed), or 'emergency' (life-threatening red flag)",
      },
      clinicalNotes: {
        type: Type.STRING,
        description: "Clinical summary note or next inquiry focus",
      },
    },
  },
};

const MEDICAL_SYSTEM_INSTRUCTION_ENGLISH = `You are a friendly, compassionate, and attentive medical voice assistant.
Your goal is to talk naturally with the patient through real-time voice in English and conduct a thorough, reassuring clinical intake.

CRITICAL CONVERSATIONAL RULES:
1. ASK EXACTLY ONE QUESTION AT A TIME. Never combine multiple questions in one turn. Patients in distress or discomfort need simple, clear prompts.
2. SPEAK NATURALLY AND CONCISELY. Keep every verbal answer to 1-3 spoken sentences. Avoid clinical lectures or long monologues.
3. INTAKE PROGRESSION:
   - Step 1: Warmly greet the patient and ask what problem or symptoms they are experiencing.
   - Step 2: Once they explain the symptom, ask where in their body it is happening.
   - Step 3: Ask when it started (onset and duration).
   - Step 4: Ask how severe it is (e.g., on a 1-to-10 scale or mild/moderate/severe).
   - Step 5: Ask whether it is getting better, worse, or staying about the same.
   - Step 6: Follow up adaptively based on their answers. Ask relevant questions about:
     * Associated symptoms (e.g. nausea, fever, shortness of breath, radiating pain)
     * Prior medical conditions or chronic diseases
     * Current medications and supplements
     * Known drug or environmental allergies
     * Past surgeries or hospitalizations
     * Relevant family or personal medical history
4. ADAPT & FILTER:
   - Adapt your questions dynamically to their specific situation.
   - Avoid unnecessary, repetitive, or irrelevant questions.
5. EMPATHY & VALIDATION:
   - Acknowledge their answers with gentle, empathetic affirmations (e.g., "I understand," "Thank you for clarifying that," "I'm sorry you're in pain").
6. RED-FLAG EMERGENCY SAFETY:
   - If the patient describes emergency symptoms (such as crushing chest pain, difficulty breathing, sudden face drooping or arm weakness, severe sudden neurological changes, or uncontrolled bleeding), immediately and calmly advise them to call emergency services (911) or go to the nearest emergency department immediately.
7. STRUCTURED DATA TOOL:
   - Whenever the patient reveals clinical facts (symptoms, location, onset, severity, trajectory, medications, allergies, history), call the \`update_intake_chart\` tool with the structured fields to keep their live chart updated.
8. DISCLAIMER:
   - Remind them warmly that you are an AI assistant gathering their information for their doctor, not replacing a physician's in-person diagnosis.`;

const MEDICAL_SYSTEM_INSTRUCTION_HINDI = `आप एक अत्यंत संवेदनशील, विनम्र और अनुभवी मेडिकल वॉयस असिस्टेंट (Medical Voice Assistant) हैं।
आपका कार्य मरीज से स्वाभाविक, सम्मानजनक और आत्मीय हिंदी (सहज एवं सरल बोलचाल की भाषा) में बात करके उनकी स्वास्थ्य समस्या को समझना है।

महत्वपूर्ण नियम:
1. हमेशा एक बार में केवल एक ही प्रश्न पूछें (ASK EXACTLY ONE QUESTION AT A TIME)। मरीज को एक साथ कई प्रश्न पूछकर बिल्कुल परेशान या भ्रमित न करें।
2. छोटे, स्पष्ट और स्वाभाविक वाक्य बोलें (1 से 3 वाक्य)। लंबी व्याख्या या कठिन चिकित्सकीय व्याख्यान न दें।
3. बातचीत का क्रम (Step-by-Step Intake Progression):
   - चरण 1: मरीज का गर्मजोशी से अभिवादन करें (जैसे "नमस्ते! मैं आपकी मेडिकल वॉयस असिस्टेंट हूँ।") और पूछें कि उन्हें क्या तकलीफ या लक्षण महसूस हो रहे हैं।
   - चरण 2: जब वे लक्षण बताएं, तो पूछें कि शरीर में यह समस्या ठीक कहाँ हो रही है (स्थान / अंग)।
   - चरण 3: पूछें कि यह समस्या कब शुरू हुई (समय, दिन या अवधि)।
   - चरण 4: पूछें कि यह तकलीफ कितनी ज्यादा या गंभीर है (जैसे 1 से 10 के पैमाने पर, जहाँ 1 हल्का और 10 असहनीय दर्द हो)।
   - चरण 5: पूछें कि क्या यह समय के साथ बढ़ रही है, कम हो रही है, या एक जैसी बनी हुई है।
   - चरण 6: उनके उत्तरों के आधार पर ही प्रासंगिक प्रश्न पूछें:
     * अन्य जुड़े हुए लक्षण (जैसे बुखार, उल्टी/जी मिचलाना, कमजोरी, चक्कर, सांस फूलना आदि)
     * पहले की कोई पुरानी बीमारी (जैसे बीपी, शुगर, थायराइड, दमा/अस्थमा)
     * वर्तमान में ली जा रही दवाइयाँ या सप्लीमेंट्स
     * किसी दवा, इंजेक्शन या खाद्य पदार्थ से कोई एलर्जी
     * पहले की कोई सर्जरी या ऑपरेशन
     * व्यक्तिगत या पारिवारिक चिकित्सीय इतिहास
4. मरीज की स्थिति के अनुसार ढलें और कोई भी अनावश्यक सवाल न पूछें।
5. सहानुभूति व्यक्त करें (जैसे: "मुझे दुख है कि आपको दर्द सहना पड़ रहा है", "धन्यवाद बताने के लिए, मैं समझ रही हूँ")।
6. आपातकालीन चेतावनी (Red Flag / Emergency Protocol):
   - यदि मरीज को सीने में तेज दबाव/दर्द, सांस लेने में अत्यधिक कठिनाई, चेहरे या हाथ-पैर में अचानक सुन्नता/कमजोरी, अचानक बोलने या देखने में परेशानी या भारी रक्तस्राव जैसे लक्षण हों, तो तुरंत बातचीत रोककर उन्हें अत्यंत शांत लेकिन दृढ़ स्वर में 108/112 पर कॉल करने या तुरंत नजदीकी अस्पताल के इमरजेंसी वार्ड जाने का निर्देश दें।
7. डेटा रिकॉर्डिंग टूल:
   - जैसे ही मरीज कोई चिकित्सकीय जानकारी दे, \`update_intake_chart\` टूल को कॉल करके उनके लाइव चार्ट को तुरंत अपडेट करें।
8. परामर्श अस्वीकरण (Disclaimer):
   - स्पष्ट रखें कि आप डॉक्टर से परामर्श से पहले जानकारी संकलित करने वाले सहायक हैं, अंतिम डॉक्टर नहीं।`;

// Live API WebSocket connection handler
wss.on("connection", async (clientWs, req) => {
  console.log("New client connected to Live API WebSocket");
  
  const ai = getGenAI();
  if (!ai) {
    clientWs.send(
      JSON.stringify({
        type: "error",
        error: "GEMINI_API_KEY is not configured. Please set your API key in Settings > Secrets.",
      })
    );
    return;
  }

  // Parse voice and language preference from URL query
  let voiceName = "Kore"; // Kore is calm, warm, and empathetic
  let language: "en" | "hi" = "en"; // default to English
  try {
    const url = new URL(req.url || "", "http://localhost");
    const requestedVoice = url.searchParams.get("voice");
    if (requestedVoice && ["Kore", "Zephyr", "Puck", "Fenrir", "Charon"].includes(requestedVoice)) {
      voiceName = requestedVoice;
    }
    const requestedLang = url.searchParams.get("lang");
    if (requestedLang && (requestedLang === "hi" || requestedLang === "hindi")) {
      language = "hi";
    }
  } catch (_) {}

  const systemInstruction =
    language === "hi" ? MEDICAL_SYSTEM_INSTRUCTION_HINDI : MEDICAL_SYSTEM_INSTRUCTION_ENGLISH;

  const sessionId = `consult-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  startOrGetSessionRecord(sessionId, language, voiceName);

  let assistantSpeechBuffer = "";
  let userSpeechBuffer = "";
  let session: any = null;
  let isClosed = false;

  try {
    session = await ai.live.connect({
      model: "gemini-3.8-live",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
        systemInstruction,
        tools: [{ functionDeclarations: [updateIntakeChartDeclaration] }],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          console.log(`Connected to Gemini Live API (Session: ${sessionId}, Voice: ${voiceName}, Lang: ${language})`);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "session_ready", sessionId, voice: voiceName, language }));
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio stream chunks (24kHz PCM)
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: "audio",
                    data: part.inlineData.data,
                  })
                );
              }
            }
          }

          // 2. Output audio transcription (assistant speech)
          const outputTrans = message.serverContent?.outputTranscription;
          if (outputTrans?.text) {
            assistantSpeechBuffer += (assistantSpeechBuffer ? " " : "") + outputTrans.text;
            clientWs.send(
              JSON.stringify({
                type: "transcript",
                role: "assistant",
                text: outputTrans.text,
                finished: outputTrans.finished || false,
              })
            );

            if (outputTrans.finished) {
              recordSpokenTurnInHistory(sessionId, "assistant", assistantSpeechBuffer, language);
              assistantSpeechBuffer = "";
            }
          }

          // 3. Input audio transcription (user speech)
          const inputTrans = message.serverContent?.inputTranscription || message.serverContent?.interimInputTranscription;
          if (inputTrans?.text) {
            userSpeechBuffer += (userSpeechBuffer ? " " : "") + inputTrans.text;
            clientWs.send(
              JSON.stringify({
                type: "transcript",
                role: "user",
                text: inputTrans.text,
                finished: inputTrans.finished || false,
              })
            );

            if (inputTrans.finished) {
              recordSpokenTurnInHistory(sessionId, "user", userSpeechBuffer, language);
              userSpeechBuffer = "";
            }
          }

          // 4. Interruption signal (barge-in)
          if (message.serverContent?.interrupted) {
            if (assistantSpeechBuffer.trim()) {
              recordSpokenTurnInHistory(sessionId, "assistant", assistantSpeechBuffer, language);
              assistantSpeechBuffer = "";
            }
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }

          // 5. Turn completion
          if (message.serverContent?.turnComplete) {
            if (assistantSpeechBuffer.trim()) {
              recordSpokenTurnInHistory(sessionId, "assistant", assistantSpeechBuffer, language);
              assistantSpeechBuffer = "";
            }
            clientWs.send(JSON.stringify({ type: "turn_complete" }));
          }

          // 6. Handle tool calls (e.g. updating patient chart)
          if (message.toolCall?.functionCalls && session) {
            const functionResponses = [];
            for (const call of message.toolCall.functionCalls) {
              if (call.name === "update_intake_chart") {
                if (call.args) {
                  updateSessionChartInHistory(sessionId, call.args as unknown as IntakeChart);
                }
                clientWs.send(
                  JSON.stringify({
                    type: "chart_update",
                    chart: call.args,
                  })
                );
                functionResponses.push({
                  id: call.id,
                  name: call.name,
                  response: { output: { success: true } },
                });
              }
            }

            if (functionResponses.length > 0) {
              try {
                session.sendToolResponse({ functionResponses });
              } catch (err) {
                console.error("Error sending tool response:", err);
              }
            }
          }
        },
        onclose: () => {
          console.log(`Gemini Live session closed for ${sessionId}`);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "session_closed" }));
          }
        },
        onerror: (err) => {
          console.error("Gemini Live error:", err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: "error",
                error: err?.message || "Live API connection error",
              })
            );
          }
        },
      },
    });

    clientWs.on("message", (raw) => {
      if (isClosed || !session) return;
      try {
        const msg = JSON.parse(raw.toString());

        // Audio chunk from client mic (16kHz PCM mono)
        if (msg.type === "audio" && msg.data) {
          session.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }
        // Text input message from client
        else if (msg.type === "text" && msg.text) {
          recordSpokenTurnInHistory(sessionId, "user", msg.text, language);
          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [{ text: msg.text }],
              },
            ],
            turnComplete: true,
          });
        }
        // Start conversation initial trigger
        else if (msg.type === "start_intake") {
          const intakeLang = (msg.language || language).toLowerCase();
          const isIntakeHindi = intakeLang === "hi" || intakeLang === "hindi";
          const startPrompt = isIntakeHindi
            ? "नमस्ते! मैं स्वास्थ्य परामर्श शुरू करने के लिए तैयार हूँ। कृपया मेडिकल वॉयस असिस्टेंट के रूप में आत्मीयता से अपना संक्षिप्त परिचय दें और पहला प्रश्न पूछें कि मुझे क्या तकलीफ या लक्षण महसूस हो रहे हैं।"
            : "Hello, I am ready to begin the medical consultation. Please introduce yourself warmly as my medical voice assistant and ask your first question to understand what problem or symptoms I am experiencing.";

          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: startPrompt,
                  },
                ],
              },
            ],
            turnComplete: true,
          });
        }
      } catch (err) {
        console.error("Error parsing client message:", err);
      }
    });

    clientWs.on("close", () => {
      isClosed = true;
      if (assistantSpeechBuffer.trim()) {
        recordSpokenTurnInHistory(sessionId, "assistant", assistantSpeechBuffer, language);
      }
      if (userSpeechBuffer.trim()) {
        recordSpokenTurnInHistory(sessionId, "user", userSpeechBuffer, language);
      }
      completeSessionInHistory(sessionId);
      if (session) {
        try {
          session.close();
        } catch (_) {}
      }
    });
  } catch (error: any) {
    console.error("Failed to connect to Live API:", error);
    clientWs.send(
      JSON.stringify({
        type: "error",
        error: error?.message || "Could not connect to Live API",
      })
    );
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Clinical Report Generator endpoint using gemini-3.8-flash
app.post("/api/generate-summary", async (req, res) => {
  const ai = getGenAI();
  if (!ai) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    return;
  }

  const { chart, transcript, language = "en" } = req.body;
  const isHindi = language === "hi" || language === "hindi";

  try {
    const prompt = `You are a clinical documentation specialist. Generate a concise, professional Medical Intake Note for the patient's upcoming physician evaluation.
Language of consultation: ${isHindi ? "Hindi / Bilingual" : "English"}.

Patient Intake Chart Data:
${JSON.stringify(chart || {}, null, 2)}

Consultation Transcript:
${transcript || "No transcript provided"}

Please produce a clean, structured clinical handoff report containing:
1. Patient Chief Complaint & HPI (History of Present Illness: location, onset, severity, trajectory)
2. Review of Associated Symptoms
3. Past Medical & Surgical History
4. Current Medications & Known Allergies
5. Triage Assessment & Red Flag Screening (Routine / Urgent / Emergency)
6. Recommended Next Steps for the Attending Doctor to Investigate
${
  isHindi
    ? `7. Patient Summary in Hindi (मरीज के लिए सरल हिंदी में सारांश, परामर्श और अगले कदम)`
    : ""
}

Keep the clinical report clear, objective, professional, and ready to paste into an Electronic Health Record (EHR).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You generate objective, high-standard clinical documentation notes.",
      },
    });

    if (req.body.sessionId) {
      completeSessionInHistory(req.body.sessionId, response.text);
    }

    res.json({ summary: response.text });
  } catch (err: any) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate summary" });
  }
});

// Single-file patient voice chat history API endpoints
app.get("/api/history", (_req, res) => {
  try {
    const history = getHistoryFile();
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to retrieve history" });
  }
});

app.get("/api/history/download", (_req, res) => {
  try {
    const history = getHistoryFile();
    res.setHeader("Content-Disposition", 'attachment; filename="patient_voice_chat_history.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(history, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to download history" });
  }
});

app.post("/api/history/record-turn", (req, res) => {
  try {
    const { sessionId, role, text, language: turnLang } = req.body;
    if (sessionId && role && text) {
      recordSpokenTurnInHistory(sessionId, role, text, turnLang);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.delete("/api/history", (_req, res) => {
  try {
    clearAllVoiceHistory();
    res.json({ success: true, message: "History cleared successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to clear history" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Medical Voice Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
