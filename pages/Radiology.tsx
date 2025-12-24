
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Radiology: React.FC = () => {
  const { language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<'RADIOLOGY' | 'DERMATOLOGY'>('RADIOLOGY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const res = await analyzeImage(base64Data, type, language);
      setResult(res);
    } catch (e) {
      alert("Analisis citra gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full animate-fade-in">
      <div className="medical-card p-10 flex flex-col">
        <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tighter">AI Image Diagnostic</h2>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setType('RADIOLOGY')}
            className={`flex-1 py-4 rounded-xl font-bold text-[10px] tracking-widest transition-all border ${type === 'RADIOLOGY' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'border-slate-200 text-slate-400 hover:bg-slate-50 uppercase'}`}
          >
            RADIOLOGY SCAN
          </button>
          <button 
             onClick={() => setType('DERMATOLOGY')}
             className={`flex-1 py-4 rounded-xl font-bold text-[10px] tracking-widest transition-all border ${type === 'DERMATOLOGY' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'border-slate-200 text-slate-400 hover:bg-slate-50 uppercase'}`}
          >
            DERMATOLOGY SCAN
          </button>
        </div>

        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center justify-center p-12 relative overflow-hidden transition-all hover:border-blue-300 group">
          {image ? (
            <img src={image} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-2xl">📁</span>
              </div>
              <p className="font-bold text-slate-900 text-xs uppercase tracking-widest">Unggah Citra Klinis</p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">DICOM, JPEG, atau PNG didukung</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={!image || loading}
          className="mt-8 w-full btn-medical py-5 rounded-2xl text-sm shadow-xl disabled:opacity-50"
        >
          {loading ? 'MENGEVALUASI CITRA...' : 'MULAI PROSES ANALISIS'}
        </button>
      </div>

      <div className="medical-card p-12 flex flex-col justify-center min-h-[500px] border-blue-50">
        {result ? (
          <div className="space-y-10 animate-fade-in">
             <div className="flex items-center justify-between border-b border-slate-100 pb-8">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Hasil Analisis AI</h3>
               <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                 result.severity === 'CRITICAL' ? 'triage-1' : 
                 result.severity === 'HIGH' ? 'triage-2' : 
                 'triage-3'
               }`}>
                 {result.severity} SEVERITY
               </span>
             </div>
             
             <div className="space-y-3">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temuan Observasi</h4>
               <p className="text-xl leading-relaxed text-slate-700 font-medium">"{result.findings}"</p>
             </div>

             <div className="space-y-3">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis Probabilitas</h4>
               <p className="text-3xl font-black text-blue-700 bg-blue-50 p-6 rounded-2xl border border-blue-100 tracking-tight">{result.diagnosis}</p>
             </div>

             <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Rekomendasi Medis</h4>
               <p className="text-slate-800 font-bold leading-relaxed">{result.recommendations}</p>
             </div>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6 border border-slate-100">
               <span className="text-4xl">🔭</span>
            </div>
            <p className="text-xl font-black text-slate-300 uppercase tracking-[0.3em]">Status: Siaga</p>
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Belum ada citra untuk dianalisis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Radiology;
