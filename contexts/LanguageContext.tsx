
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'diagnosis': 'AI Diagnostic',
    'radiology': 'AI Radiology/Derm',
    'history': 'EMR History',
    'settings': 'Settings',
    'logout': 'Logout Session',
    'welcome': 'Clinical Control Center',
    'overview': 'Real-time data for authorized personnel.',
    'total_analyzed': 'Total Analyzed',
    'urgent_cases': 'Critical Cases',
    'avg_risk': 'Avg Heart Risk',
    'quick_action': 'Quick Actions',
    'new_diag': 'New Diagnostic',
    'img_analytics': 'Imaging Analytics',
    'triage_dist': 'Patient Triage Status',
    'recent_emr': 'Recent EMR Activity Log',
    'save_config': 'Save Configuration',
    'practitioner_id': 'Practitioner Identity',
    'system_lang': 'System Language',
    'security_notif': 'Security & Notifications',
    'email_reports': 'Email Reports',
    'dark_mode': 'Dark Mode (BETA)',
    'patients': 'Patients',
    'alerts': 'Alerts',
    'avg_risk_label': 'Risk Average',
  },
  id: {
    'dashboard': 'Dashboard',
    'diagnosis': 'Diagnosis AI',
    'radiology': 'Radiologi AI',
    'history': 'Riwayat EMR',
    'settings': 'Konfigurasi',
    'logout': 'Keluar Sesi',
    'welcome': 'Pusat Kendali Klinis',
    'overview': 'Data real-time untuk personel berwenang.',
    'total_analyzed': 'Total Analisis',
    'urgent_cases': 'Kasus Kritis',
    'avg_risk': 'Rata Risiko Jantung',
    'quick_action': 'Aksi Cepat',
    'new_diag': 'Diagnostik Baru',
    'img_analytics': 'Analisis Citra',
    'triage_dist': 'Status Triase Pasien',
    'recent_emr': 'Log Aktivitas EMR Terkini',
    'save_config': 'Simpan Konfigurasi',
    'practitioner_id': 'Identitas Praktisi',
    'system_lang': 'Bahasa Sistem',
    'security_notif': 'Keamanan & Notifikasi',
    'email_reports': 'Laporan Email',
    'dark_mode': 'Mode Gelap (BETA)',
    'patients': 'Pasien',
    'alerts': 'Peringatan',
    'avg_risk_label': 'Rata Risiko',
  },
  ru: {
    'dashboard': 'Панель управления',
    'diagnosis': 'ИИ Диагностика',
    'radiology': 'ИИ Радиология',
    'history': 'История ЭМК',
    'settings': 'Настройки',
    'logout': 'Завершить сеанс',
    'welcome': 'Клинический центр управления',
    'overview': 'Данные в реальном времени для персонала.',
    'total_analyzed': 'Всего анализов',
    'urgent_cases': 'Критические случаи',
    'avg_risk': 'Средний риск сердца',
    'quick_action': 'Быстрые действия',
    'new_diag': 'Новая диагностика',
    'img_analytics': 'Анализ изображений',
    'triage_dist': 'Статус триажа пациентов',
    'recent_emr': 'Журнал активности ЭМК',
    'save_config': 'Сохранить настройки',
    'practitioner_id': 'Личность врача',
    'system_lang': 'Язык системы',
    'security_notif': 'Безопасность и уведомления',
    'email_reports': 'Отчеты по почте',
    'dark_mode': 'Темный режим (БЕТА)',
    'patients': 'Пациенты',
    'alerts': 'Предупреждения',
    'avg_risk_label': 'Средний риск',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'en' || saved === 'id' || saved === 'ru')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
    // Reload to apply language change globally to UI and AI service
    window.location.reload();
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
