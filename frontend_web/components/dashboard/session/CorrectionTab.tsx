"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Play, 
  Loader2, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  X,
  GanttChartSquare
} from "lucide-react";

// --- TypeScript Interfaces ---
interface SubjectProgress {
  subjectId: string;
  subjectLabel: string;
  totalCopies: number;
  ungraded: number;     
  round1Done: number;   
  round2Done: number;   
  validated: number;    
  discrepancy: number;  
}

interface DiscrepancyCopy {
  copyId: string;
  anonymousCode: string;
  subjectId: string;
  subjectLabel: string;
  grade1: number;
  grade2: number;
  gap: number;
}

interface EligibleCorrector {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  academicGrade: string;
}

export default function CorrectionTab() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Global Status States
  const [sessionStatus, setSessionStatus] = useState<string>("DRAFT"); 
  const [gatekeeperStats, setGatekeeperStats] = useState({ totalCopies: 0, totalCorrectors: 0 });

  // Data Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingEligible, setIsFetchingEligible] = useState(false);
  const [assigningThirdId, setAssigningThirdId] = useState<string | null>(null);
  
  // Modal Control States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [arbitrationModalCopy, setArbitrationModalCopy] = useState<DiscrepancyCopy | null>(null);
  const [selectedThirdCorrectorId, setSelectedThirdCorrectorId] = useState<string>("");

  // Core Feature Data States
  const [progressData, setProgressData] = useState<SubjectProgress[]>([]);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyCopy[]>([]);
  const [eligibleCorrectors, setEligibleCorrectors] = useState<EligibleCorrector[]>([]);

  // --- API Data Fetching Fetcher ---
  const fetchCorrectionDashboardData = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      
      const sessionRes = await api.get(`/api/v1/sessions/${sessionId}`);
      const currentStatus = sessionRes.data?.data?.status || "DRAFT";
      setSessionStatus(currentStatus);

      const progressRes = await api.get(`/api/v1/correction/${sessionId}/progress`);
      if (progressRes.data?.success) {
        setProgressData(progressRes.data.data?.subjects || []);
        setGatekeeperStats({
          totalCopies: progressRes.data.data?.totalCopies || 0,
          totalCorrectors: progressRes.data.data?.totalCorrectors || 0,
        });
      }

      const discrepanciesRes = await api.get(`/api/v1/correction/${sessionId}/discrepancies`);
      if (discrepanciesRes.data?.success) {
        const incomingData = discrepanciesRes.data.data;

        if (Array.isArray(incomingData)) {
          setDiscrepancies(incomingData);
        } else if (incomingData && Array.isArray(incomingData.discrepancies)) {
          setDiscrepancies(incomingData.discrepancies);
        } else if (incomingData && Array.isArray(incomingData.copies)) {
          setDiscrepancies(incomingData.copies);
        } else {
          setDiscrepancies([]); 
        }
      } else {
        setDiscrepancies([]);
      }

    } catch (error) {
      console.error("Error reading initial correction state layouts:", error);
      setDiscrepancies([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch Eligible Correctors for a specific Copy ---
  const fetchEligibleCorrectors = async (copyId: string) => {
    try {
      setIsFetchingEligible(true);
      setEligibleCorrectors([]); // Reset list during load
      const res = await api.get(`/api/v1/correction/${sessionId}/copies/${copyId}/eligible-correctors`);
      console.log(res)
      if (res.data?.success && res.data?.data?.eligibleCorrectors) {
        setEligibleCorrectors(res.data.data.eligibleCorrectors);
      }
    } catch (error) {
      console.error("Failed to fetch copy specific eligible correctors:", error);
    } finally {
      setIsFetchingEligible(false);
    }
  };

  useEffect(() => {
    fetchCorrectionDashboardData();
  }, [sessionId]);

  // --- Actions ---
  const handleOpenCorrectionGate = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post(`/api/v1/correction/${sessionId}/open`);
      if (response.data?.success) {
        setSessionStatus("CORRECTION_LIVE");
        setIsConfirmModalOpen(false);
        fetchCorrectionDashboardData();
      }
    } catch (error) {
      console.error("Could not unlock correction lifecycle stage:", error);
      alert("Une erreur est survenue lors de l'ouverture de la correction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignThirdCorrectorSubmit = async () => {
    if (!arbitrationModalCopy || !selectedThirdCorrectorId) return;
    const copyId = arbitrationModalCopy.copyId;
    
    try {
      setAssigningThirdId(copyId);
      const response = await api.post(`/api/v1/correction/${sessionId}/copies/${copyId}/assign-third`, {
        correctorId: selectedThirdCorrectorId
      });
      console.log(response);
      
      if (response.data?.success) {
        setDiscrepancies(prev => prev.filter(item => item.copyId !== copyId));
        setArbitrationModalCopy(null); 
        setSelectedThirdCorrectorId("");
        fetchCorrectionDashboardData();
      }
    } catch (error) {
      console.error("Failed assigning selected arbitrator profile:", error);
    } finally {
      setAssigningThirdId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full font-sans text-[#1E293B]">
      
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <Loader2 className="animate-spin text-[#3014B8]" size={40} />
        </div>
      )}

      {/* TOP REGION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[12px] font-bold text-[#3014B8] tracking-widest uppercase">
                Phase Opérationnelle
              </h3>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                sessionStatus === "ANONYMIZED" ? "bg-emerald-100 text-emerald-700" :
                sessionStatus === "CORRECTION_LIVE" ? "bg-indigo-100 text-[#3014B8] animate-pulse" :
                "bg-slate-100 text-slate-500"
              }`}>
                {sessionStatus === "ANONYMIZED" ? "Anonymat Prêt" : sessionStatus}
              </span>
            </div>
            
            <h2 className="text-[28px] font-bold text-[#1E293B] mb-2 leading-tight">
              Lancement Correction
            </h2>
            <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
              Distribuez les copies anonymisées de manière automatisée aux correcteurs assignés et ouvrez l'accès sur l'application mobile.
            </p>
          </div>

          <div>
            {sessionStatus !== "ANONYMIZED" && sessionStatus !== "CORRECTION_LIVE" ? (
              <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3 border border-amber-100 mb-4">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 font-medium">
                  Cette action requiert que le statut de l'examen soit explicitement verrouillé sur <span className="font-bold">ANONYMIZED</span>.
                </p>
              </div>
            ) : null}

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={sessionStatus !== "ANONYMIZED"}
              className="w-full bg-[#3014B8] hover:bg-[#250f96] disabled:bg-slate-100 disabled:text-slate-400 transition-all text-white py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 group disabled:cursor-not-allowed shadow-sm"
            >
              <Play size={16} fill="currentColor" />
              Démarrer la Correction
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-indigo-50 text-[#3014B8] rounded-xl flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Volume de copies</h4>
            <h2 className="text-[42px] font-black text-[#1E293B] tracking-tight my-1">
              {gatekeeperStats.totalCopies}
            </h2>
          </div>
          <p className="text-[12px] text-slate-400 border-t border-slate-50 pt-3">
            Nombre exact d'émargements uniques scannés et validés présents en base.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Membres du jury</h4>
            <h2 className="text-[42px] font-black text-[#1E293B] tracking-tight my-1">
              {gatekeeperStats.totalCorrectors}
            </h2>
          </div>
          <p className="text-[12px] text-slate-400 border-t border-slate-50 pt-3">
            Enseignants habilités rattachés aux spécialités de cette session.
          </p>
        </div>
      </div>

      {/* MID REGION */}
      <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1E293B]">Suivi d'avancement par Spécialité / Épreuve</h2>
              <p className="text-[13px] text-slate-400">Progression en temps réel de la double correction croisée</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-tight">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm inline-block" /> Non Noté</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" /> Correction 1</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block" /> Correction 2</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" /> Arbitrage (Écart)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" /> Validé</div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {!Array.isArray(progressData) || progressData.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[14px] italic">
              Aucune donnée de progression disponible. Démarrez la correction.
            </div>
          ) : (
            progressData.map((subject) => {
              const total = subject.totalCopies || 1;
              const pUngraded = (subject.ungraded / total) * 100;
              const pR1 = (subject.round1Done / total) * 100;
              const pR2 = (subject.round2Done / total) * 100;
              const pDisc = (subject.discrepancy / total) * 100;
              const pVal = (subject.validated / total) * 100;

              return (
                <div key={subject.subjectId} className="border-b border-slate-50 pb-5 last:border-none last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[14px] font-bold text-[#1E293B]">{subject.subjectLabel}</span>
                    <span className="text-[12px] font-medium text-slate-400">{subject.totalCopies} copies totales</span>
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden">
                    <div style={{ width: `${pUngraded}%` }} className="bg-slate-200 h-full transition-all" title={`Non noté: ${subject.ungraded}`} />
                    <div style={{ width: `${pR1}%` }} className="bg-amber-400 h-full transition-all" title={`Correction 1: ${subject.round1Done}`} />
                    <div style={{ width: `${pR2}%` }} className="bg-blue-500 h-full transition-all" title={`Correction 2: ${subject.round2Done}`} />
                    <div style={{ width: `${pDisc}%` }} className="bg-rose-500 h-full transition-all" title={`Litige: ${subject.discrepancy}`} />
                    <div style={{ width: `${pVal}%` }} className="bg-emerald-500 h-full transition-all" title={`Validé: ${subject.validated}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LOWER REGION */}
      <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#1E293B]">Cellule d'Arbitrage & Divergences</h2>
            <p className="text-[13px] text-slate-400">Copies dont l'écart de note dépasse le seuil configuré. Assignation d'un troisième correcteur.</p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">Code Anonyme</th>
                <th className="py-4 px-4">Épreuve</th>
                <th className="py-4 px-4 text-center">Note 1</th>
                <th className="py-4 px-4 text-center">Note 2</th>
                <th className="py-4 px-4 text-center">Écart (Gap)</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[14px]">
              {!Array.isArray(discrepancies) || discrepancies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    Aucun conflit ou divergence de notation détecté sur cette session actuellement.
                  </td>
                </tr>
              ) : (
                discrepancies.map((item) => {
                  return (
                    <tr key={item.copyId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-700">{item.anonymousCode}</td>
                      <td className="py-4 px-4 font-medium text-slate-600">{item.subjectLabel}</td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-500">
                        {typeof item.grade1 === "number" ? item.grade1.toFixed(2) : item.grade1}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-500">
                        {typeof item.grade2 === "number" ? item.grade2.toFixed(2) : item.grade2}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-rose-50 text-rose-600 font-bold px-2.5 py-1 rounded-md text-[13px] border border-rose-100">
                          {typeof item.gap === "number" ? item.gap.toFixed(2) : item.gap} pts
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setArbitrationModalCopy(item);
                            setSelectedThirdCorrectorId("");
                            fetchEligibleCorrectors(item.copyId); // Trigger precise fetching
                          }}
                          className="bg-slate-100 hover:bg-[#3014B8] hover:text-white transition-all text-slate-600 px-4 py-2 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          Arbitrer la copie
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONFIRMATION EXAM START MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <ShieldCheck size={28} />
              <h3 className="text-[20px] font-bold text-[#1E293B]">Confirmation d'Ouverture</h3>
            </div>
            
            <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
              Vous êtes sur le point de figer les listes d'anonymats et de lancer officiellement la phase d'évaluation. Assurez-vous que l'alignement des effectifs est correct :
            </p>

            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 mb-6 border border-slate-100">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-400 font-medium">Copies à traiter :</span>
                <span className="font-bold text-slate-700">{gatekeeperStats.totalCopies} exemplaires</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-400 font-medium">Correcteurs actifs :</span>
                <span className="font-bold text-slate-700">{gatekeeperStats.totalCorrectors} professeurs</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="text-[14px] font-bold text-slate-400 hover:text-slate-600 px-4 py-2 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleOpenCorrectionGate}
                disabled={isSubmitting}
                className="bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-5 py-3 rounded-xl text-[14px] font-bold flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Lancement..." : "Confirmer et Ouvrir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- THIRD CORRECTOR ARBITRATION POPUP MODAL --- */}
      {arbitrationModalCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 relative">
            
            <button 
              onClick={() => setArbitrationModalCopy(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <GanttChartSquare size={26} />
              <h3 className="text-[20px] font-bold text-[#1E293B]">Désignation du Troisième Correcteur</h3>
            </div>

            <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
              Sélectionnez un membre du jury qualifié pour trancher le litige de notation sur cette copie spécifique.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-slate-400 block mb-0.5">Code Anonyme :</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                  {arbitrationModalCopy.anonymousCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Épreuve / Matière :</span>
                <span className="font-bold text-slate-700">{arbitrationModalCopy.subjectLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Écart constaté :</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block">
                  {arbitrationModalCopy.gap} points
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Notes (R1 / R2) :</span>
                <span className="font-medium text-slate-600">{arbitrationModalCopy.grade1} / {arbitrationModalCopy.grade2}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-[12px] font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                Enseignants disponibles pour cette épreuve
                {isFetchingEligible && <Loader2 size={14} className="animate-spin text-[#3014B8]" />}
              </label>
              
              <div className="relative">
                <select
                  value={selectedThirdCorrectorId}
                  onChange={(e) => setSelectedThirdCorrectorId(e.target.value)}
                  disabled={isFetchingEligible}
                  className="w-full bg-[#F1F5F9] focus:bg-white border-2 border-transparent focus:border-[#3014B8]/20 rounded-xl py-3.5 px-4 text-[14px] font-semibold text-slate-700 appearance-none outline-none transition-all pr-10 disabled:opacity-60"
                >
                  {isFetchingEligible ? (
                    <option value="" disabled>Recherche des correcteurs éligibles...</option>
                  ) : (
                    <>
                      <option value="" disabled>Choisir un enseignant arbitre...</option>
                      {eligibleCorrectors.map((corr) => (
                        <option key={corr.userId} value={corr.userId}>
                          {`${corr.firstName} ${corr.lastName}`.trim()} ({corr.academicGrade || "Enseignant"}) — {corr.institution}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <UserPlus size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {!isFetchingEligible && eligibleCorrectors.length === 0 && (
                <p className="text-[12px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle size={14} /> Aucun correcteur éligible trouvé (tous les correcteurs restants ont déjà évalué cette copie ou ne font pas partie de cette matière).
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-5">
              <button
                onClick={() => setArbitrationModalCopy(null)}
                disabled={assigningThirdId === arbitrationModalCopy.copyId}
                className="text-[14px] font-bold text-slate-400 hover:text-slate-600 px-4 py-2 transition-colors disabled:opacity-50"
              >
                Fermer
              </button>
              <button
                onClick={handleAssignThirdCorrectorSubmit}
                disabled={!selectedThirdCorrectorId || assigningThirdId === arbitrationModalCopy.copyId || isFetchingEligible}
                className="bg-[#3014B8] hover:bg-[#250f96] disabled:bg-slate-100 disabled:text-slate-400 transition-colors text-white px-6 py-3.5 rounded-xl text-[14px] font-bold flex items-center gap-2 disabled:cursor-not-allowed shadow-sm"
              >
                {assigningThirdId === arbitrationModalCopy.copyId && <Loader2 size={16} className="animate-spin" />}
                {assigningThirdId === arbitrationModalCopy.copyId ? "Assignation..." : "Valider l'Assignation"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}