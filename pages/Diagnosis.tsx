
import React, { useState, useEffect } from 'react';
import { PatientInput, DiagnosisResult } from '../types';
import { analyzePatient } from '../services/geminiService';
import { saveRecord } from '../services/storageService';
import { getCurrentUser } from '../services/authService';
import { TRIAGE_COLORS, LAB_PANELS } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../contexts/LanguageContext';

const Diagnosis: React.FC = () => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'MANUAL' | 'VOICE'>('MANUAL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [showPatientEd, setShowPatientEd] = useState(false);
  const [activeLabPanel, setActiveLabPanel] = useState('HEMATOLOGY');
  const user = getCurrentUser();
  
  const [formData, setFormData] = useState<PatientInput>({
    patientId: crypto.randomUUID(),
    patientName: '',
    mrn: '',
    dob: '',
    age: 0,
    gender: 'Male',
    bloodType: 'Unknown',
    smokingStatus: 'Never',
    alcoholConsumption: 'None',
    physicalActivity: 'Moderate',
    complaint: '',
    history: '',
    currentMeds: '',
    allergies: '',
    vitals: { systolic: 120, diastolic: 80, heartRate: 72, respRate: 16, temperature: 36.5, spo2: 98, weight: 70, height: 170 },
    labResults: {},
    inputType: 'MANUAL'
  });

  useEffect(() => {
    if (formData.dob) {
      const birth = new Date(formData.dob);
      const age = new Date().getFullYear() - birth.getFullYear();
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.dob]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, [name]: Number(value) } }));
  };

  const handleLabChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, labResults: { ...prev.labResults, [key]: value } }));
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Solid Emerald Green header (Emerald-600)
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("AlCortex Pro", margin, 20);
    doc.setFontSize(10);
    doc.text("Electronic Medical Record | Clinical Intelligence Suite", margin, 28);
    doc.text(`Ref: ${formData.mrn.toUpperCase()}`, pageWidth - margin - 40, 20);

    // 1. Subject Demographics
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("1. DATA PASIEN", margin, 55);
    autoTable(doc, {
      startY: 60,
      head: [['Field Identitas', 'Informasi Terverifikasi']],
      body: [
        ['Nama Lengkap Pasien', formData.patientName],
        ['Nomor Rekam Medis (MRN)', formData.mrn],
        ['Umur / Jenis Kelamin', `${formData.age} Tahun / ${formData.gender}`],
        ['Golongan Darah', formData.bloodType],
        ['Pemeriksa / Dokter', user?.name || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] }
    });

    // 2. Clinical Vitals
    doc.text("2. TANDA VITAL & BIOMETRIK", margin, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Metrik', 'Hasil', 'Metrik', 'Hasil']],
      body: [
        ['TD Sistolik', `${formData.vitals.systolic} mmHg`, 'TD Diastolik', `${formData.vitals.diastolic} mmHg`],
        ['Detak Jantung', `${formData.vitals.heartRate} bpm`, 'Saturasi O2', `${formData.vitals.spo2} %`],
        ['Suhu Tubuh', `${formData.vitals.temperature} C`, 'Laju Napas', `${formData.vitals.respRate} /m`],
        ['Berat Badan', `${formData.vitals.weight} kg`, 'Tinggi Badan', `${formData.vitals.height} cm`],
      ],
      theme: 'plain',
      styles: { cellPadding: 2, fontSize: 9 }
    });

    // 3. Lab Results
    if (Object.keys(formData.labResults).length > 0) {
      doc.text("3. HASIL LABORATORIUM", margin, (doc as any).lastAutoTable.finalY + 15);
      const labBody = Object.entries(formData.labResults)
        .filter(([_, v]) => v)
        .map(([key, val]) => [key.toUpperCase(), val || '-']);
      
      if (labBody.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Pemeriksaan', 'Hasil Pengukuran']],
          body: labBody,
          theme: 'striped',
          headStyles: { fillColor: [15, 23, 42] }
        });
      }
    }

    // 4. AI Analysis
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("4. ANALISIS DIAGNOSTIK AI", margin, 25);
    
    doc.setFontSize(10);
    doc.text("Diagnosis Utama:", margin, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${result.primaryDiagnosis} [ICD-10: ${result.icd10Code}]`, margin + 35, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Clinical Reasoning:", margin, 45);
    doc.setFont('helvetica', 'normal');
    const splitReasoning = doc.splitTextToSize(result.clinicalReasoning, pageWidth - margin * 2);
    doc.text(splitReasoning, margin, 52);

    // 5. Treatment Plan
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Rencana Terapi & Manajemen", margin, (doc as any).lastAutoTable ? Math.max(100, (doc as any).lastAutoTable.finalY + 50) : 100);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable ? Math.max(105, (doc as any).lastAutoTable.finalY + 55) : 105,
      head: [['Obat', 'Dosis', 'Frekuensi', 'Durasi', 'Peringatan']],
      body: result.medications.map(m => [m.name, m.dosage, m.frequency, m.duration, m.interactionWarning || 'Aman']),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });

    // Final Post-processing for Footers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Page numbers for all pages
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // Signature Section ONLY on the last page
      if (i === totalPages) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("best regards of development", margin, pageHeight - 30);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text("Muhammad Alwi Zulkifli", margin, pageHeight - 25);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Dokumen ini dihasilkan secara otomatis oleh sistem AlCortex Pro.", pageWidth - margin, pageHeight - 25, { align: 'right' });
      }
    }

    doc.save(`ALCORTEX_EMR_${formData.mrn.toUpperCase()}_${Date.now()}.pdf`);
  };

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.mrn) {
      alert("Error: Nama Pasien dan No. RM wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const diagnosis = await analyzePatient({ ...formData, inputType: mode }, language);
      setResult(diagnosis);
      if (user) {
        saveRecord({
          id: crypto.randomUUID(),
          userId: user.id,
          patientData: formData,
          result: diagnosis,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      alert(`Analisis Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-slide pb-20">
        <div className="medical-card p-6 sticky top-4 z-50 flex flex-col md:flex-row justify-between items-center gap-6 border-blue-100 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-6">
             <div className={`px-5 py-3 rounded-2xl text-white font-black shadow-lg ${TRIAGE_COLORS[result.triageLevel as keyof typeof TRIAGE_COLORS]}`}>
                TRIAGE-{result.triageLevel}
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.patientName}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score: {result.confidence}%</p>
             </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPatientEd(!showPatientEd)} className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              {showPatientEd ? 'Tampilan Klinis' : 'Edukasi Pasien'}
            </button>
            <button onClick={generatePDF} className="btn-medical px-6 py-3 rounded-xl font-bold text-xs shadow-lg">
              Ekspor Laporan PDF
            </button>
            <button onClick={() => setResult(null)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs">
              Mulai Ulang
            </button>
          </div>
        </div>

        {!showPatientEd ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <div className="medical-card p-12">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Diagnosis Kerja</h4>
                       <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{result.primaryDiagnosis}</p>
                       <p className="mt-4 inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded font-bold font-mono text-xs">{result.icd10Code}</p>
                     </div>
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10">
                     <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dasar Klinis (Reasoning)</h5>
                     <p className="text-xl text-slate-700 font-medium leading-relaxed italic">"{result.clinicalReasoning}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis Banding</h5>
                        <div className="space-y-2">
                           {result.differentialDiagnoses.map((dx, i) => (
                             <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm">{dx}</div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rencana Investigasi</h5>
                        <div className="space-y-2">
                           {result.actions.tests.map((t, i) => (
                             <div key={i} className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold text-blue-700 shadow-sm">{t}</div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="medical-card p-10">
                  <h4 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Regimen Terapi & Farmakoterapi</h4>
                  <div className="space-y-4">
                     {result.medications.map((m, i) => (
                       <div key={i} className={`p-6 rounded-3xl border ${m.interactionWarning ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div className="flex justify-between">
                             <div>
                                <p className="text-xl font-black text-slate-900">{m.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-mono">{m.dosage} // {m.frequency} // {m.duration}</p>
                             </div>
                             {m.interactionWarning && <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black h-fit">DDI ALERT</span>}
                          </div>
                          {m.interactionWarning && <p className="mt-4 p-4 bg-white/60 rounded-xl text-xs text-red-700 font-bold border border-red-100">{m.interactionWarning}</p>}
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="medical-card p-8 text-center bg-slate-50/30">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Matriks Risiko Pasien</h4>
                  <div className="space-y-6">
                    {Object.entries(result.risks).filter(([k]) => k !== 'predictionText').map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                          <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span>{val}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-[2s] ${Number(val) > 70 ? 'bg-red-500' : Number(val) > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="medical-card p-16 max-w-4xl mx-auto animate-fade-in text-center">
             <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Informasi Kesehatan Anda</h3>
             <div className="bg-slate-50 p-12 rounded-[2.5rem] border border-slate-100 mb-10">
                <p className="text-3xl text-slate-800 leading-tight font-medium italic tracking-tight">"{result.patientEducation}"</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                   <h4 className="font-bold text-emerald-800 uppercase mb-4 tracking-widest text-xs">Hal yang perlu dilakukan:</h4>
                   <ul className="space-y-3">
                     {result.actions.nonPharma.map((a, i) => <li key={i} className="flex gap-3 text-slate-700 font-bold"><span className="text-emerald-500">✔</span> {a}</li>)}
                   </ul>
                </div>
                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
                   <h4 className="font-bold text-blue-800 uppercase mb-4 tracking-widest text-xs">Catatan Dokter:</h4>
                   <p className="text-slate-600 font-bold text-sm leading-relaxed">Patuhi pengobatan dan periksa kembali jika gejala tidak mereda dalam 3 hari.</p>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">ALCORTEX<br/><span className="text-blue-600">AI v1</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-6">Sistem Diagnostik Bantuan AI v5.0</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <button onClick={() => setMode('MANUAL')} className={`px-8 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'MANUAL' ? 'btn-medical shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>INPUT MANUAL</button>
           <button onClick={() => setMode('VOICE')} className={`px-8 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'VOICE' ? 'btn-medical shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>BIO-VOICE IN</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="medical-card p-10 space-y-10">
             <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">01_Identifikasi Pasien</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap Sesuai Identitas</label>
                   <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} className="input-medical text-lg font-bold" placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">No. Rekam Medis (RM)</label>
                    <input type="text" name="mrn" value={formData.mrn} onChange={handleInputChange} className="input-medical font-mono text-sm uppercase tracking-widest" placeholder="RM-XXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="input-medical" />
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                   <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} onClick={() => setFormData(p => ({...p, gender: g as any}))} className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all ${formData.gender === g ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{g === 'Male' ? 'LAKU-LAKI' : g === 'Female' ? 'PEREMPUAN' : 'LAINNYA'}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Golongan Darah</label>
                   <select name="bloodType" value={formData.bloodType} onChange={handleInputChange} className="input-medical font-bold uppercase">
                      {['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-100">
                {['systolic', 'diastolic', 'heartRate', 'respRate', 'temperature', 'spo2', 'weight', 'height'].map(v => (
                  <div key={v} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-500 transition-all">
                     <label className="block text-[8px] font-bold text-slate-400 uppercase mb-3 text-center tracking-widest">{v.replace(/([A-Z])/g, '_$1')}</label>
                     <input type="number" name={v} value={(formData.vitals as any)[v]} onChange={handleVitalChange} className="w-full bg-transparent text-center font-black text-slate-900 outline-none text-xl font-mono tracking-tighter" />
                  </div>
                ))}
             </div>
          </section>

          <section className="medical-card p-10 space-y-10">
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] border-b border-slate-100 pb-8">02_Gaya Hidup & Sosial</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Merokok</label>
                   <select name="smokingStatus" value={formData.smokingStatus} onChange={handleInputChange} className="input-medical text-[11px] font-bold">
                      <option value="Never">TIDAK MEROKOK</option>
                      <option value="Former">MANTAN PEROKOK</option>
                      <option value="Current">PEROKOK AKTIF</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Konsumsi Alkohol</label>
                   <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleInputChange} className="input-medical text-[11px] font-bold">
                      <option value="None">TIDAK PERNAH</option>
                      <option value="Social">SOSIAL / TERKONTROL</option>
                      <option value="Heavy">KRONIS / SERING</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivitas Fisik</label>
                   <select name="physicalActivity" value={formData.physicalActivity} onChange={handleInputChange} className="input-medical text-[11px] font-bold">
                      <option value="Sedentary">PASIF (KURANG GERAK)</option>
                      <option value="Moderate">MODERAT (1-3X/MINGGU)</option>
                      <option value="Active">AKTIF (SETIAP HARI)</option>
                   </select>
                </div>
             </div>
          </section>

          <section className="medical-card p-10 space-y-10">
             <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">03_Parameter Laboratorium</h3>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                   {Object.keys(LAB_PANELS).map(panel => (
                     <button key={panel} onClick={() => setActiveLabPanel(panel)} className={`px-5 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${activeLabPanel === panel ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{panel}</button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                {LAB_PANELS[activeLabPanel].map(f => (
                  <div key={f.key} className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={formData.labResults[f.key] || ''} onChange={(e) => handleLabChange(f.key, e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase text-slate-900 outline-none focus:border-blue-500 transition-all">
                        <option value="">-</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <div className="relative">
                        <input type="number" value={formData.labResults[f.key] || ''} onChange={(e) => handleLabChange(f.key, e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-mono font-bold text-slate-900 outline-none focus:border-blue-500 transition-all" placeholder="-" />
                        {f.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 font-bold uppercase">{f.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="medical-card p-10 shadow-xl sticky top-10 border-blue-50">
              <div className="space-y-10">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block mb-4 ml-1">Deskripsi Keluhan (Anamnesa)</label>
                    <textarea name="complaint" value={formData.complaint} onChange={handleInputChange} className="input-medical min-h-[250px] text-sm p-6 resize-none font-medium leading-relaxed" placeholder="Gunakan terminologi medis jika diperlukan..." />
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Riwayat Medis Masa Lalu</label>
                       <input type="text" name="history" value={formData.history} onChange={handleInputChange} className="input-medical py-3 text-xs font-bold uppercase tracking-widest" placeholder="Hipertensi, Asma, dll..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alergi Obat/Makanan</label>
                       <input type="text" name="allergies" value={formData.allergies} onChange={handleInputChange} className="input-medical py-3 text-xs font-bold uppercase tracking-widest border-red-100" placeholder="Penisilin, dll..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Obat Rutin Saat Ini</label>
                       <input type="text" name="currentMeds" value={formData.currentMeds} onChange={handleInputChange} className="input-medical py-3 text-xs font-bold uppercase tracking-widest border-blue-100" placeholder="Metformin, Aspirin, dll..." />
                    </div>
                 </div>

                 <button 
                   onClick={handleSubmit} 
                   disabled={loading}
                   className="w-full btn-medical py-8 rounded-[2rem] text-xl uppercase shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-4"
                 >
                   {loading ? "PROSES ANALISIS..." : "MULAI DIAGNOSA AI"}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;
