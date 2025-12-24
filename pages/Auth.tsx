
import React, { useState } from 'react';
import { UserRole } from '../types';
import { register, login, resetPassword } from '../services/authService';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'RESET'>('LOGIN');
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [language, setLanguage] = useState<'en' | 'id' | 'ru'>('id');
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'LOGIN') {
        await login(email, password);
        onLogin();
      } else if (view === 'REGISTER') {
        await register(name, email, role, password, licenseId, language);
        onLogin();
      } else {
        await resetPassword(email);
        setView('LOGIN');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 selection:bg-blue-100">
      <div className="w-full max-w-xl">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl mb-6">A</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">AlCortex<span className="text-blue-600">Pro</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Clinical Decision Support System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">
            {view === 'LOGIN' ? 'Masuk ke Portal' : view === 'REGISTER' ? 'Registrasi Baru' : 'Pulihkan Akun'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'REGISTER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                  <input required type="text" className="input-medical" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">No. STR / SIP</label>
                  <input required type="text" className="input-medical font-mono uppercase" value={licenseId} onChange={e => setLicenseId(e.target.value)} placeholder="SIP-2024-XXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Peran Profesi</label>
                  <select className="input-medical cursor-pointer" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                    <option value={UserRole.DOCTOR}>Dokter / Medis</option>
                    <option value={UserRole.NURSE}>Perawat / Klinisi</option>
                    <option value={UserRole.LAB_ANALYST}>Analis Laboratorium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bahasa Sistem</label>
                  <select className="input-medical cursor-pointer" value={language} onChange={e => setLanguage(e.target.value as any)}>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (Global)</option>
                    <option value="ru">Русский (Russian)</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Institusi</label>
              <input required type="email" className="input-medical" value={email} onChange={e => setEmail(e.target.value)} placeholder="prakrisi@hospital.com" />
            </div>

            {view !== 'RESET' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kata Sandi</label>
                <input required type="password" className="input-medical" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-medical py-5 rounded-2xl text-lg uppercase shadow-xl disabled:opacity-50 mt-4"
            >
              {loading ? "MEMVALIDASI..." : view === 'LOGIN' ? 'Masuk Portal' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-4 text-center">
            {view === 'LOGIN' ? (
              <>
                <button onClick={() => setView('REGISTER')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Baru di sini? Buat Akun Praktisi</button>
                <button onClick={() => setView('RESET')} className="text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-widest">Lupa Kredensial?</button>
              </>
            ) : (
              <button onClick={() => setView('LOGIN')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Kembali ke Login</button>
            )}
          </div>
        </div>
        <p className="mt-10 text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.5em] opacity-60">Penggunaan Institusi Medis Terdaftar • HIPAA Verified</p>
      </div>
    </div>
  );
};

export default Auth;
