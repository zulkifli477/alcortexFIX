
import React, { useEffect, useState } from 'react';
import { User, DiagnosisRecord } from '../types';
import { getRecordsByUser } from '../services/storageService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  // Fix: Added 'language' to destructuring from useLanguage to provide access for locale formatting
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    totalPatients: 0,
    urgentCases: 0,
    avgRisk: 0
  });
  const [recentRecords, setRecentRecords] = useState<DiagnosisRecord[]>([]);

  useEffect(() => {
    const records = getRecordsByUser(user.id);
    setRecentRecords(records.slice(0, 5));
    
    const urgent = records.filter(r => r.result.triageLevel <= 2).length;
    const risks = records.reduce((acc, curr) => acc + curr.result.risks.heartDisease, 0);
    
    setStats({
      totalPatients: records.length,
      urgentCases: urgent,
      avgRisk: records.length ? Math.round(risks / records.length) : 0
    });
  }, [user.id]);

  const riskData = [
    { name: t('Stabil') || 'Stabil', value: Math.max(0, stats.totalPatients - stats.urgentCases) },
    { name: t('Kritis') || 'Kritis', value: stats.urgentCases }
  ];
  const COLORS = ['#e2e8f0', '#0284c7'];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('welcome')}</h2>
          <p className="text-slate-500 font-medium mt-1">{t('overview')}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
           <span className="text-xs font-bold uppercase tracking-widest">{t('CORE_SYSTEM_ACTIVE') || 'System Active'}</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="medical-card p-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('total_analyzed')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalPatients}</p>
            <span className="text-sm font-bold text-slate-400">{t('patients')}</span>
          </div>
        </div>
        
        <div className="medical-card p-8 bg-red-50/30 border-red-100">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-4">{t('urgent_cases')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-red-600 tracking-tighter">{stats.urgentCases}</p>
            <span className="text-sm font-bold text-red-400">{t('alerts')}</span>
          </div>
        </div>

        <div className="medical-card p-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('avg_risk')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.avgRisk}%</p>
            <span className="text-sm font-bold text-slate-400">{t('avg_risk_label')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Navigation / Bento Box */}
        <div className="medical-card p-10 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">{t('quick_action')}</h3>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => onNavigate('diagnosis')}
              className="btn-medical p-6 rounded-2xl flex justify-between items-center group"
            >
              <div className="text-left">
                <p className="text-xl font-black uppercase tracking-tight">{t('new_diag')}</p>
                <p className="text-[10px] opacity-70 font-medium">Input anamnesa dan pemeriksaan fisik</p>
              </div>
              <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button 
              onClick={() => onNavigate('radiology')}
              className="p-6 bg-slate-50 text-slate-900 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition-all flex justify-between items-center group"
            >
              <div className="text-left">
                <p className="text-xl font-black uppercase tracking-tight">{t('img_analytics')}</p>
                <p className="text-[10px] text-slate-400 font-medium">Scan radiologi atau dermatologi AI</p>
              </div>
              <span className="text-2xl text-slate-300 transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        {/* Chart Card */}
        <div className="medical-card p-8 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{t('triage_dist')}</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="medical-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('recent_emr')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="py-5 px-8">Waktu</th>
                <th className="py-5 px-8">No. RM</th>
                <th className="py-5 px-8">Nama Pasien</th>
                <th className="py-5 px-8">Diagnosis Kerja</th>
                <th className="py-5 px-8">Triase</th>
                <th className="py-5 px-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map((rec) => (
                <tr key={rec.id} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="py-6 px-8 text-slate-500 font-mono text-xs">{new Date(rec.timestamp).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-6 px-8 text-slate-400 font-mono text-xs tracking-widest">{rec.patientData.mrn.toUpperCase() || '-'}</td>
                  <td className="py-6 px-8 text-slate-900 font-bold uppercase">{rec.patientData.patientName}</td>
                  <td className="py-6 px-8 font-semibold text-blue-700">{rec.result.primaryDiagnosis}</td>
                  <td className="py-6 px-8">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block
                      ${rec.result.triageLevel === 1 ? 'triage-1' : 
                        rec.result.triageLevel === 2 ? 'triage-2' :
                        rec.result.triageLevel === 3 ? 'triage-3' : 
                        'triage-4'}`}>
                      Lvl {rec.result.triageLevel}
                    </span>
                  </td>
                  <td className="py-6 px-8">
                    <button 
                      onClick={() => onNavigate('history')}
                      className="text-slate-900 font-bold text-[10px] uppercase tracking-widest border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                    >
                      Buka EMR
                    </button>
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 italic">Belum ada catatan aktivitas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
