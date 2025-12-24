
import React, { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = getCurrentUser();
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'diagnosis', label: 'Diagnosis AI' },
    { id: 'radiology', label: 'Radiology Scan' },
    { id: 'history', label: 'Riwayat EMR' },
    { id: 'settings', label: 'Konfigurasi' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-row">
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs font-bold text-slate-900">{isOpen ? 'Tutup' : 'Menu'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">A</div>
             <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AlCortex<span className="text-blue-600">Pro</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Suite</p>
             </div>
          </div>
        </div>

        <nav className="p-6 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setIsOpen(false); }}
              className={`w-full text-left px-5 py-3.5 rounded-xl transition-all text-sm font-semibold tracking-tight ${
                activePage === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="mb-6 px-2">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full text-red-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
        <div className="p-6 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
