
import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Diagnosis from './pages/Diagnosis.tsx';
import Radiology from './pages/Radiology.tsx';
import Settings from './pages/Settings.tsx';
import Layout from './components/Layout.tsx';
import { getCurrentUser } from './services/authService.ts';
import { User } from './types.ts';
import { getAllRecords } from './services/storageService.ts';
import { LanguageProvider } from './contexts/LanguageContext.tsx';

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl animate-bounce">A</div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            AlCortex<span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-4">
            Initializing Clinical Suite
          </p>
        </div>
      </div>
      <div className="absolute bottom-24 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 animate-[loading-bar_2s_infinite_ease-in-out]"></div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (loading) return null;

  if (!user) {
    return <Auth onLogin={() => setUser(getCurrentUser())} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setActivePage} />;
      case 'diagnosis':
        return <Diagnosis />;
      case 'radiology':
        return <Radiology />;
      case 'settings':
        return <Settings />;
      case 'history':
        const records = getAllRecords();
        return (
            <div className="medical-card p-10">
                <h2 className="text-3xl font-black mb-10 text-slate-900 tracking-tight uppercase">Arsip Rekam Medis Elektronik</h2>
                {records.length > 0 ? (
                  <div className="space-y-4">
                      {records.map(r => (
                          <div key={r.id} className="border border-slate-100 p-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm bg-white flex justify-between items-center group">
                              <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${r.result.triageLevel === 1 ? 'triage-1' : 'bg-slate-100 text-slate-400'}`}>
                                  {r.result.triageLevel}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase">{r.patientData.patientName}</div>
                                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">{r.result.primaryDiagnosis} • {new Date(r.timestamp).toLocaleString('id-ID')}</div>
                                </div>
                              </div>
                              <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all">Lihat Detail</button>
                          </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Belum ada data historis dalam repositori ini.</div>
                )}
            </div>
        );
      default:
        return <Dashboard user={user} onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
