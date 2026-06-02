"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Calculator, 
  Lock, 
  Download, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Loader2
} from "lucide-react";

// --- Types & Enums ---
enum AdmissionResult {
  ADMIS = "Admis(e)",
  WAITLIST = "En liste d'attente",
  AJOURNE = "Ajourné(e)",
}

interface SubjectGrade {
  subjectName: string;
  grade: number;
  coefficient: number;
  anonymousCode: string;
}

interface RankedCandidate {
  rank: number;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  weightedAverage: number;
  result: AdmissionResult;
  subjectGrades: SubjectGrade[];
  anonymousCodes?: Record<string, string>;
}

interface WarningCandidate {
  registrationNumber: string;
  name: string;
  weightedAverage: number;
  gapToThreshold: number;
}

interface DeliberationStats {
  specializationId: string;
  specializationName: string;
  total: number;
  admitted: number;
  waitlisted: number;
  rejected: number;
  warningCandidates: WarningCandidate[];
  admittedQuota?: number; 
}

interface SpecializationRanking {
  stats: DeliberationStats;
  candidates: RankedCandidate[];
}

export default function DeliberationTab({ sessionId, initialStatus }: { sessionId: string, initialStatus?: string }) {
  // Global State
  const [sessionStatus, setSessionStatus] = useState<string>(initialStatus || "DRAFT");
  const [rankingsData, setRankingsData] = useState<Record<string, SpecializationRanking>>({});
  const [activeSpecId, setActiveSpecId] = useState<string>("");
  
  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Modals
  const [confirmComputeOpen, setConfirmComputeOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  
  // Action Results
  const [computeResult, setComputeResult] = useState<{ emailSent?: boolean } | null>(null);

  // --- Fetch Initial Data ---
  const fetchRankings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/v1/deliberation/${sessionId}/ranking`);
      
      const specializationsArray = res.data?.data?.specializations || [];
      const transformedData: Record<string, SpecializationRanking> = {};
      
      specializationsArray.forEach((spec: any) => {
        const candidates = spec.rankedCandidates || [];
        
        let admitted = 0, waitlisted = 0, rejected = 0;
        const warningCandidates: WarningCandidate[] = [];

        candidates.forEach((c: any) => {
          if (c.result === AdmissionResult.ADMIS) admitted++;
          else if (c.result === AdmissionResult.WAITLIST) waitlisted++;
          else rejected++;

          if (c.weightedAverage >= 9.5 && c.weightedAverage < 10.0) {
            warningCandidates.push({
              registrationNumber: c.registrationNumber,
              name: `${c.lastName} ${c.firstName}`,
              weightedAverage: c.weightedAverage,
              gapToThreshold: 10 - c.weightedAverage
            });
          }
        });

        transformedData[spec.specializationId] = {
          stats: {
            specializationId: spec.specializationId,
            specializationName: spec.specializationName || "Spécialité",
            total: candidates.length,
            admitted,
            waitlisted,
            rejected,
            warningCandidates,
            admittedQuota: spec.availableSlots
          },
          candidates: candidates
        };
      });

      setRankingsData(transformedData);
      
      if (specializationsArray.length > 0 && !activeSpecId) {
        setActiveSpecId(specializationsArray[0].specializationId);
      }
      
    } catch (error) {
      console.error("Failed to fetch deliberation rankings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchRankings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);


  // --- Actions ---
  const handleCompute = async () => {
    try {
      setIsActionLoading(true);
      const res = await api.post(`/api/v1/deliberation/${sessionId}/compute`);
      
      if (res.data?.success || res.status === 200) {
        const payloadData = res.data?.data;
        
        setComputeResult({
          emailSent: payloadData?.emailSent
        });
        
        setConfirmComputeOpen(false);
        await fetchRankings(); 
      }
    } catch (error) {
      console.error("Computation failed:", error);
      alert("Une erreur est survenue lors du calcul.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCloseDeliberation = async () => {
    try {
      setIsActionLoading(true);
      const res = await api.post(`/api/v1/deliberation/${sessionId}/close`);
      
      if (res.data?.success || res.status === 200) {
        setSessionStatus("CLOSED");
        setConfirmCloseOpen(false);
        alert(`Délibération clôturée avec succès. ${res.data?.data?.emailsSentCount || 0} emails envoyés.`);
      }
    } catch (error) {
      console.error("Closing deliberation failed:", error);
      alert("Une erreur est survenue lors de la clôture.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Document download handlers for Word PV documents
  const downloadPV = async (type: 'anonymat' | 'nominatif') => {
    try {
      const res = await api.get(`/api/v1/deliberation/${sessionId}/pv/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PV_${type}_${sessionId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to download PV ${type}:`, error);
      alert("Erreur lors du téléchargement du document.");
    }
  };

  // --- Helpers ---
  const toggleRow = (regNum: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(regNum)) next.delete(regNum);
      else next.add(regNum);
      return next;
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case AdmissionResult.ADMIS: return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case AdmissionResult.WAITLIST: return "bg-amber-100 text-amber-700 border-amber-200";
      case AdmissionResult.AJOURNE: return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case AdmissionResult.ADMIS: return <CheckCircle2 size={14} className="mr-1" />;
      case AdmissionResult.WAITLIST: return <Clock size={14} className="mr-1" />;
      case AdmissionResult.AJOURNE: return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const activeData = activeSpecId ? rankingsData[activeSpecId] : null;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      
      {/* ── TOP ACTION BAR ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F172A]">Panneau de Délibération</h2>
          <p className="text-[14px] text-slate-500 mt-1">
            Calculez les moyennes, analysez les quotas et générez les PV finaux.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {computeResult?.emailSent && (
            <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl text-[13px] font-medium border border-emerald-100">
              <Mail size={16} /> Notification envoyée
            </span>
          )}

          {/* Word Document PVs */}
          {activeData && (
            <>
              <button 
                onClick={() => downloadPV('anonymat')}
                className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-[#3014B8] hover:text-[#3014B8] transition-all text-slate-600 px-4 py-2.5 rounded-xl text-[14px] font-bold shadow-sm"
              >
                <Download size={16} /> PV Anonymat
              </button>
              <button 
                onClick={() => downloadPV('nominatif')}
                className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-[#3014B8] hover:text-[#3014B8] transition-all text-slate-600 px-4 py-2.5 rounded-xl text-[14px] font-bold shadow-sm"
              >
                <Download size={16} /> PV Nominatif
              </button>
            </>
          )}

          {sessionStatus !== "CLOSED" && (
            <>
              <button
                onClick={() => setConfirmComputeOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 transition-colors text-white px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 shadow-sm"
              >
                <Calculator size={16} /> 
                Calculer la Délibération
              </button>
              
              <button
                onClick={() => setConfirmCloseOpen(true)}
                disabled={!activeData}
                className="bg-[#3014B8] hover:bg-[#250f96] disabled:bg-slate-300 transition-colors text-white px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
              >
                <Lock size={16} /> 
                Clôturer la Session
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#3014B8]" />
        </div>
      ) : !activeData ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Calculator size={48} className="text-slate-300 mb-4" />
          <h3 className="text-[18px] font-bold text-slate-700">Aucun résultat calculé</h3>
          <p className="text-[14px] text-slate-500 mt-2 max-w-md">
            Cliquez sur le bouton "Calculer la Délibération" pour générer les moyennes pondérées et les classements.
          </p>
        </div>
      ) : (
        <>
          {/* ── SPECIALIZATION TABS ────────────────────────────────── */}
          <div className="flex items-center gap-2 border-b border-slate-200 w-full overflow-x-auto pb-px">
            {Object.entries(rankingsData).map(([id, spec]) => (
              <button
                key={id}
                onClick={() => setActiveSpecId(id)}
                className={`px-5 py-3 font-semibold text-[14px] whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeSpecId === id
                    ? "border-[#3014B8] text-[#3014B8]"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl"
                }`}
              >
                {spec?.stats?.specializationName || "Spécialité"}
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px]">
                  {spec?.stats?.total || 0}
                </span>
              </button>
            ))}
          </div>

          {/* ── STATS DASHBOARD ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Candidats</p>
              <h3 className="text-[32px] font-black text-[#0F172A]">{activeData.stats.total}</h3>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[12px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Admis</p>
                  <h3 className="text-[32px] font-black text-emerald-700">{activeData.stats.admitted}</h3>
                </div>
                {activeData.stats.admittedQuota && (
                  <span className="bg-emerald-200/50 text-emerald-800 text-[11px] font-bold px-2 py-1 rounded-md">
                    Quota: {activeData.stats.admittedQuota}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm">
              <p className="text-[12px] font-bold text-amber-600/70 uppercase tracking-wider mb-1">Liste d'attente</p>
              <h3 className="text-[32px] font-black text-amber-700">{activeData.stats.waitlisted}</h3>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
              <p className="text-[12px] font-bold text-rose-600/70 uppercase tracking-wider mb-1">Ajournés</p>
              <h3 className="text-[32px] font-black text-rose-700">{activeData.stats.rejected}</h3>
            </div>
          </div>

          {/* ── WARNING CANDIDATES ─────────────────────────────────── */}
          {activeData.stats.warningCandidates && activeData.stats.warningCandidates.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-orange-800 mb-1">
                  Attention requise : Candidats à la limite du seuil
                </h4>
                <p className="text-[13px] text-orange-700/80 mb-3">
                  Les candidats suivants sont extrêmement proches de la moyenne d'admission (9.5 - 9.99).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeData.stats.warningCandidates.map((warn, idx) => (
                    <div key={idx} className="bg-white/60 border border-orange-200/60 rounded-lg p-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-orange-900 truncate mr-2">{warn.name}</span>
                      <div className="text-right shrink-0">
                        <span className="block text-[12px] font-bold text-orange-800">{warn.weightedAverage?.toFixed(2)}</span>
                        <span className="block text-[10px] text-orange-600/80">Gap: {warn.gapToThreshold?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RANKING TABLE ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 w-16 text-center">Rang</th>
                    <th className="py-4 px-6">Matricule</th>
                    <th className="py-4 px-6">Nom Complet</th>
                    <th className="py-4 px-6 text-right">Moyenne Générale</th>
                    <th className="py-4 px-6">Décision</th>
                    <th className="py-4 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {(activeData.candidates || []).map((cand) => {
                    const isExpanded = expandedRows.has(cand.registrationNumber);
                    return (
                      <React.Fragment key={cand.registrationNumber}>
                        <tr 
                          onClick={() => toggleRow(cand.registrationNumber)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''}`}
                        >
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                              cand.rank <= 3 ? 'bg-indigo-100 text-[#3014B8]' : 'text-slate-500 bg-slate-100'
                            }`}>
                              {cand.rank}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-500 text-[13px]">{cand.registrationNumber}</td>
                          <td className="py-4 px-6 font-bold text-[#0F172A] capitalize">
                            {cand.lastName} {cand.firstName}
                          </td>
                          <td className="py-4 px-6 text-right font-black text-[#0F172A] text-[15px]">
                            {cand.weightedAverage?.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold border ${getResultColor(cand.result)}`}>
                              {getResultIcon(cand.result)}
                              {cand.result}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-slate-400">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </td>
                        </tr>
                        
                        {/* Expanded Sub-row: Subject Grades */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50 border-t-0">
                            <td colSpan={6} className="py-4 px-8 pb-6">
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <th className="py-2.5 px-4">Épreuve / Matière</th>
                                      <th className="py-2.5 px-4 text-center">Code Anonymat</th>
                                      <th className="py-2.5 px-4 text-center">Coefficient</th>
                                      <th className="py-2.5 px-4 text-right">Note</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(cand.subjectGrades || []).map((sg, idx) => (
                                      <tr key={idx}>
                                        <td className="py-3 px-4 font-semibold text-slate-700 text-[13px]">
                                          {sg.subjectName}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                            {sg.anonymousCode}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500 text-[13px]">
                                          {sg.coefficient}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-[#3014B8] text-[13px]">
                                          {sg.grade?.toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {confirmComputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#3014B8] mb-4">
              <Calculator size={28} />
              <h3 className="text-[20px] font-bold text-[#0F172A]">Lancer le Calcul</h3>
            </div>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              Vous êtes sur le point de calculer les moyennes générales, d'établir le classement final, et d'exporter les grilles Excel de délibération.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setConfirmComputeOpen(false)}
                disabled={isActionLoading}
                className="px-4 py-2.5 text-[14px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleCompute}
                disabled={isActionLoading}
                className="px-5 py-2.5 bg-[#3014B8] hover:bg-[#250f96] text-white rounded-xl text-[14px] font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCloseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertTriangle size={28} />
              <h3 className="text-[20px] font-bold text-[#0F172A]">Clôturer la Délibération</h3>
            </div>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              <strong className="text-rose-600 block mb-2">Attention : Cette action est irréversible.</strong>
              La session passera en statut <strong>CLOSED</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setConfirmCloseOpen(false)}
                disabled={isActionLoading}
                className="px-4 py-2.5 text-[14px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleCloseDeliberation}
                disabled={isActionLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[14px] font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                Clôturer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}