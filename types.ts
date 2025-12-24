
export enum UserRole {
  DOCTOR = 'Dokter',
  NURSE = 'Perawat',
  LAB_ANALYST = 'Tenaga Analis Laboratorium'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  licenseId: string;
  preferredLanguage: 'en' | 'id' | 'ru';
  passwordHash: string;
  createdAt: string;
}

export interface PatientVitals {
  systolic: number;
  diastolic: number;
  heartRate: number;
  respRate: number;
  temperature: number;
  spo2: number;
  weight?: number;
  height?: number;
}

export interface LabResults {
  [key: string]: string | undefined;
}

export interface PatientInput {
  patientId: string;
  patientName: string;
  mrn: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  smokingStatus: 'Never' | 'Former' | 'Current';
  alcoholConsumption: 'None' | 'Social' | 'Heavy';
  physicalActivity: 'Sedentary' | 'Moderate' | 'Active';
  complaint: string;
  history: string;
  currentMeds: string;
  allergies: string;
  vitals: PatientVitals;
  labResults: LabResults;
  inputType: 'MANUAL' | 'VOICE';
}

export interface DiagnosisResult {
  primaryDiagnosis: string;
  icd10Code: string;
  differentialDiagnoses: string[];
  clinicalReasoning: string;
  triageLevel: 1 | 2 | 3 | 4;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  affectedSystems: string[];
  patientEducation: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    contraindications: string;
    sideEffects: string;
    interactionWarning?: string;
  }>;
  actions: {
    tests: string[];
    nonPharma: string[];
    referral: string | null;
  };
  risks: {
    heartDisease: number;
    stroke: number;
    kidneyFailure: number;
    cancer: number;
    diabetes: number;
    predictionText: string;
  };
  timestamp: string;
}

export interface DiagnosisRecord {
  id: string;
  userId: string;
  patientData: PatientInput;
  result: DiagnosisResult;
  timestamp: string;
}

export interface AnalysisResult {
  modality: 'RADIOLOGY' | 'DERMATOLOGY';
  findings: string;
  diagnosis: string;
  recommendations: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}
