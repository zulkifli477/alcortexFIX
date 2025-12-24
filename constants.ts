
export const APP_NAME = "AlCortex";

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mf9gtvo',
  TEMPLATE_ID: 'template_lw8efqp',
  PUBLIC_KEY: '8kQjk9JZZk3vLHdMR'
};

export const TRIAGE_COLORS = {
  1: 'bg-red-600 text-white shadow-red-200 animate-pulse',
  2: 'bg-orange-500 text-white shadow-orange-200',
  3: 'bg-blue-600 text-white shadow-blue-200',
  4: 'bg-emerald-600 text-white shadow-emerald-200'
};

export interface LabField {
  key: string;
  label: string;
  unit?: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

export const LAB_PANELS: Record<string, LabField[]> = {
  HEMATOLOGY: [
    { key: 'hb', label: 'Hemoglobin (Hb)', unit: 'g/dL', type: 'number' },
    { key: 'leukocyte', label: 'Leukocytes (WBC)', unit: '/uL', type: 'number' },
    { key: 'erythrocyte', label: 'Erythrocytes (RBC)', unit: '10^6/uL', type: 'number' },
    { key: 'hematocrit', label: 'Hematocrit (Hct)', unit: '%', type: 'number' },
    { key: 'thrombocyte', label: 'Thrombocytes (PLT)', unit: '/uL', type: 'number' },
    { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', type: 'number' },
    { key: 'mcv', label: 'MCV', unit: 'fL', type: 'number' },
    { key: 'hba1c', label: 'HbA1c', unit: '%', type: 'number' }
  ],
  URINALYSIS: [
    { key: 'urineColor', label: 'Warna (Color)', type: 'select', options: ['Kuning Muda', 'Kuning', 'Kuning Tua', 'Kemerahan', 'Cokelat'] },
    { key: 'urineClarity', label: 'Kejernihan (Clarity)', type: 'select', options: ['Jernih', 'Agak Keruh', 'Keruh', 'Sangat Keruh'] },
    { key: 'urinePh', label: 'pH', type: 'number' },
    { key: 'urineProtein', label: 'Protein', type: 'select', options: ['Negatif', 'Trace', '1+', '2+', '3+', '4+'] },
    { key: 'urineGlucose', label: 'Glukosa', type: 'select', options: ['Negatif', 'Normal', 'Trace', '1+', '2+', '3+', '4+'] },
    { key: 'urineNitrite', label: 'Nitrit', type: 'select', options: ['Negatif', 'Positif'] },
    { key: 'urineWbc', label: 'Sedimen WBC', unit: '/lpb', type: 'number' }
  ],
  SPUTUM: [
    { key: 'sputumColor', label: 'Warna Dahak', type: 'select', options: ['Bening', 'Putih', 'Kuning', 'Hijau', 'Kemerahan'] },
    { key: 'sputumBta', label: 'BTA (Acid Fast)', type: 'select', options: ['Negatif', 'Scanty', '1+', '2+', '3+'] },
    { key: 'sputumConsistency', label: 'Konsistensi', type: 'select', options: ['Encer', 'Mukoid', 'Purulen', 'Bercampur Darah'] }
  ]
};
