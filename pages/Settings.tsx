
import React, { useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const user = getCurrentUser();
  const { language, setLanguage, t } = useLanguage();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{t('settings')}</h2>
           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">{t('settings_desc')}</p>
        </div>
        {isSaved && (
            <div className="px-6 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-bounce">
                {t('save_config')} OK
            </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <div className="medical-card p-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10 pb-4 border-b border-slate-50">{t('practitioner_id')}</h3>
          <div className="flex flex-col md:flex-row gap-10">
             <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner">👨‍⚕️</div>
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                   <p className="text-xl font-black text-slate-900">{user?.name}</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Terdaftar</label>
                   <p className="text-lg font-bold text-slate-500">{user?.email}</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lisensi (STR/SIP)</label>
                   <p className="text-lg font-mono font-bold text-blue-600 uppercase">{user?.licenseId || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peran Sistem</label>
                   <p className="text-lg font-bold text-slate-500 uppercase">{user?.role}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="medical-card p-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t('system_lang')}</h3>
              <div className="space-y-6">
                 <div className="relative">
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="input-medical text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="id">BAHASA INDONESIA</option>
                        <option value="en">ENGLISH (US/INTL)</option>
                        <option value="ru">РУССКИЙ (RUSSIAN)</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">▼</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium italic">Mempengaruhi label antarmuka dan output diagnosa AI.</p>
              </div>
           </div>

           <div className="medical-card p-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t('security_notif')}</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t('email_reports')}</span>
                    <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${notifications ? 'bg-blue-600' : 'bg-slate-300'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t('dark_mode')}</span>
                    <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-10">
         <button onClick={handleSave} className="btn-medical px-12 py-5 rounded-2xl text-lg uppercase shadow-2xl">
            {t('save_config')}
         </button>
      </div>
    </div>
  );
};

export default Settings;
