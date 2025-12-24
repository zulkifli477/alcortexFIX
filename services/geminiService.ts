
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, PatientInput, AnalysisResult } from "../types";

const getLanguageName = (langCode: string) => {
    switch(langCode) {
        case 'id': return 'Indonesian (Bahasa Indonesia)';
        case 'ru': return 'Russian (Русский)';
        default: return 'English';
    }
}

export const analyzePatient = async (data: PatientInput, language: string = 'en'): Promise<DiagnosisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(language);

  const systemInstruction = `You are a professional medical diagnostic AI assistant. 
Output must be in ${langName}. 
Evaluate risks based on Social History: Smoking (${data.smokingStatus}), Alcohol (${data.alcoholConsumption}), Activity (${data.physicalActivity}).
Cross-check 'currentMeds' for potential interactions.`;

  const prompt = `Perform a comprehensive clinical analysis:
    - Patient: ${data.patientName}, Age: ${data.age}, Gender: ${data.gender}, Blood: ${data.bloodType}
    - History: ${data.history}
    - Complaint: ${data.complaint}
    - Meds: ${data.currentMeds}
    - Vitals: ${JSON.stringify(data.vitals)}
    - Labs: ${JSON.stringify(data.labResults)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryDiagnosis: { type: Type.STRING },
            icd10Code: { type: Type.STRING },
            differentialDiagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
            clinicalReasoning: { type: Type.STRING },
            triageLevel: { type: Type.INTEGER, description: "1 (Critical) to 4 (Non-Urgent)" },
            severity: { type: Type.STRING, description: "LOW, MODERATE, HIGH, CRITICAL" },
            confidence: { type: Type.NUMBER },
            affectedSystems: { type: Type.ARRAY, items: { type: Type.STRING } },
            patientEducation: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  contraindications: { type: Type.STRING },
                  sideEffects: { type: Type.STRING },
                  interactionWarning: { type: Type.STRING }
                },
                required: ["name", "dosage", "frequency"]
              }
            },
            actions: {
              type: Type.OBJECT,
              properties: {
                tests: { type: Type.ARRAY, items: { type: Type.STRING } },
                nonPharma: { type: Type.ARRAY, items: { type: Type.STRING } },
                referral: { type: Type.STRING }
              }
            },
            risks: {
              type: Type.OBJECT,
              properties: {
                heartDisease: { type: Type.NUMBER },
                stroke: { type: Type.NUMBER },
                kidneyFailure: { type: Type.NUMBER },
                cancer: { type: Type.NUMBER },
                diabetes: { type: Type.NUMBER },
                predictionText: { type: Type.STRING }
              }
            },
            timestamp: { type: Type.STRING }
          },
          required: ["primaryDiagnosis", "icd10Code", "triageLevel", "severity", "confidence", "risks"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    return JSON.parse(text) as DiagnosisResult;
  } catch (error) {
    console.error("Gemini Diagnosis Error:", error);
    throw error;
  }
};

export const analyzeImage = async (base64Data: string, modality: 'RADIOLOGY' | 'DERMATOLOGY', language: string = 'en'): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(language);

  const prompt = `Analyze this ${modality} medical image. Provide clinical findings, likely diagnosis, and recommendations. Language: ${langName}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modality: { type: Type.STRING },
            findings: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            recommendations: { type: Type.STRING },
            severity: { type: Type.STRING, description: "LOW, MODERATE, HIGH, CRITICAL" }
          },
          required: ["findings", "diagnosis", "severity"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};
