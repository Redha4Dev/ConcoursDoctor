"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Lock, Save, Layers, AlertTriangle, Send } from "lucide-react";
import { api } from "@/lib/api";

// --- INTERFACES & TYPES ---
interface Paper {
  copyId: string;
  anonymousCode: string;
  status: 
    | "PENDING"
    | "ASSIGNED"
    | "FIRST_DONE"
    | "SECOND_DONE"
    | "DISCREPANCY"
    | "THIRD_DONE"
    | "VALIDATED";
  draftGrade: number | null;
  isLocked: boolean;
  submittedGrade: number | null;
  round: number; 
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    papers: Paper[];
    subjectName: string;
    maxGrade: number;
    minimumGrade: number;
  };
}

interface GradingMatrixProps {
  subjectId: string;
  sessionId: string;
  onBack: () => void;
}

export function GradingMatrix({ subjectId, sessionId, onBack }: GradingMatrixProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<{ name: string; max: number; min: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion des onglets de correction (Rounds)
  const [activeRound, setActiveRound] = useState<number>(1);

  // Saisie des notes, états de chargement individuels et soumission globale
  const [draftGrades, setDraftGrades] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isParamsReady =
    subjectId &&
    subjectId !== "undefined" &&
    sessionId &&
    sessionId !== "undefined";

  // --- FONCTION DE RÉCUPÉRATION ---
  const fetchPapers = useCallback(async () => {
    if (!isParamsReady) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse>(
        `/api/v1/correction/subjects/${subjectId}/papers`,
        { params: { sessionId } }
      );

      const { success, data, message } = response.data;
      console.log("📝 [GradingMatrix] Response:", response.data);

      if (success && data) {
        setPapers(data.papers || []);
        setSubjectInfo({
          name: data.subjectName,
          max: data.maxGrade,
          min: data.minimumGrade,
        });

        // Initialisation avec clé composite unique pour isoler les rounds
        const initialDrafts: Record<string, string> = {};
        data.papers.forEach((p) => {
          if (p.draftGrade !== null) {
            initialDrafts[`${p.copyId}-${p.round}`] = String(p.draftGrade);
          }
        });
        setDraftGrades(initialDrafts);
      } else {
        setError(message || "Impossible de charger les copies.");
      }
    } catch (err: any) {
      console.error("❌ [GradingMatrix] Error fetching papers:", err);
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Une erreur est survenue lors de la communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  }, [subjectId, sessionId, isParamsReady]);

  // --- FONCTION DE SAUVEGARDE DU BROUILLON ---
  const handleSaveDraft = async (copyId: string, round: number) => {
    const uniqueKey = `${copyId}-${round}`;
    const gradeStr = draftGrades[uniqueKey];
    if (gradeStr === undefined || gradeStr === "") return;

    const gradeValue = Number(gradeStr);
    const max = subjectInfo?.max || 20;

    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > max) {
      alert(`Veuillez entrer une note valide entre 0 et ${max}.`);
      return;
    }

    try {
      setSavingIds((prev) => [...prev, uniqueKey]);

      await api.put(
        "/api/v1/correction/drafts",
        {
          copyId,
          grade: gradeValue,
          sessionId, 
          round,
        },
        {
          params: { sessionId },
        }
      );

      setPapers((prevPapers) =>
        prevPapers.map((p) =>
          p.copyId === copyId && p.round === round
            ? {
                ...p,
                draftGrade: gradeValue,
              }
            : p
        )
      );
    } catch (err: any) {
      console.error("❌ [GradingMatrix] Error saving draft:", err);
      alert("Erreur lors de la sauvegarde de la note brouillon.");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== uniqueKey));
    }
  };

  // --- FONCTION DE SOUMISSION DU ROUND ACTIF ---
  const handleSubmitRound = async (round: number) => {
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir soumettre et clôturer définitivement les notes du Tour ${round} ? Cette action verrouillera vos saisies.`
    );
    if (!confirmation) return;

    try {
      setSubmitting(true);

      // 🚀 POST avec sessionId dans le body ET dans la query string
      await api.post(
        `/api/v1/correction/subjects/${subjectId}/submit`,
        { 
          sessionId,
          round // Inclus pour identifier le contexte du round de l'onglet
        },
        { 
          params: { sessionId } 
        }
      );

      alert(`Le Tour ${round} a été soumis et validé avec succès !`);
      await fetchPapers(); // Actualise les statuts et les verrous (isLocked) depuis le serveur
    } catch (err: any) {
      console.error("❌ [GradingMatrix] Error submitting round:", err);
      const backendMessage = err.response?.data?.message;
      alert(backendMessage || "Une erreur est survenue lors de la validation du tour.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- EFFETS ---
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // --- CALCUL DES TOURS ET FILTRAGE ---
  const hasRound3 = papers.some((p) => p.round === 3);
  const availableRounds = hasRound3 ? [1, 2, 3] : [1, 2];
  const filteredPapers = papers.filter((p) => p.round === activeRound);

  // --- COMPOSANT INTERNE : BADGE DE STATUT ---
  const StatusBadge = ({ status }: { status: Paper["status"] }) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Non assigné
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            En attente de note
          </span>
        );
      case "FIRST_DONE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            Correction 1 OK
          </span>
        );
      case "SECOND_DONE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            Correction 2 OK
          </span>
        );
      case "DISCREPANCY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Litige / Écart
          </span>
        );
      case "THIRD_DONE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            Arbitrage OK
          </span>
        );
      case "VALIDATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Validé
          </span>
        );
      default:
        return null;
    }
  };

  if (!isParamsReady) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-7xl mx-auto m-6">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-3">Initialisation des identifiants...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Barre d'actions supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux affectations
        </button>

        <button
          onClick={fetchPapers}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* En-tête de la matière */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3014B8]">Épreuve d'évaluation</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {subjectInfo?.name || "Chargement de la matière..."}
          </h1>
        </div>
        {subjectInfo && (
          <div className="flex gap-4 text-sm">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block">Note Maximale</span>
              <span className="font-bold text-slate-700">/{subjectInfo.max}</span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block">Seuil d'admission</span>
              <span className="font-bold text-slate-700">{subjectInfo.min}</span>
            </div>
          </div>
        )}
      </div>

      {/* Barre des Onglets (Tabs) */}
      {!loading && !error && papers.length > 0 && (
        <div className="flex border-b border-slate-200 gap-2">
          {availableRounds.map((round) => {
            const count = papers.filter((p) => p.round === round).length;
            const isSelected = activeRound === round;
            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all relative ${
                  isSelected
                    ? "border-[#3014B8] text-[#3014B8]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{round === 3 ? "Correction 3 (Arbitrage)" : `Correction ${round}`}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                    isSelected ? "bg-[#3014B8]/10 text-[#3014B8]" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Zone de Contenu Dynamique */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-[#3014B8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 animate-pulse">Récupération des copies anonymes depuis le serveur...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 text-sm">Erreur de chargement</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchPapers}
              className="mt-3 text-xs font-bold text-red-700 underline underline-offset-2 hover:text-red-900"
            >
              Réessayer la requête
            </button>
          </div>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">Aucune copie n'est assignée pour ce tour de correction.</p>
        </div>
      ) : (
        /* Conteneur de l'onglet actif : Actions globales + Tableau */
        <div className="space-y-4">
          {/* Barre d'action spécifique à l'onglet en cours */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">
              Une fois toutes les notes saisies, soumettez ce tour pour permettre le calcul des écarts ou la validation finale.
            </p>
            <button
              onClick={() => handleSubmitRound(activeRound)}
              disabled={submitting || loading}
              className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Soumettre le Tour {activeRound}
            </button>
          </div>

          {/* Tableau unique alimenté dynamiquement par l'onglet actif */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Code Anonyme</th>
                    <th className="px-6 py-4">Statut actuel</th>
                    <th className="px-6 py-4">Note Brouillon</th>
                    <th className="px-6 py-4">Note Validée</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredPapers.map((paper) => {
                    const currentInputKey = `${paper.copyId}-${paper.round}`;
                    const isSaving = savingIds.includes(currentInputKey);
                    const maxDisplay = subjectInfo?.max ? ` / ${subjectInfo.max}` : "";

                    return (
                      <tr key={currentInputKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">
                          {paper.anonymousCode}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={paper.status} />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {paper.isLocked ? (
                            paper.draftGrade !== null ? (
                              `${paper.draftGrade}${maxDisplay}`
                            ) : (
                              "--"
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={subjectInfo?.max || 20}
                                step={0.25}
                                value={draftGrades[currentInputKey] || ""}
                                onChange={(e) =>
                                  setDraftGrades((prev) => ({
                                    ...prev,
                                    [currentInputKey]: e.target.value,
                                  }))
                                }
                                placeholder="Ex: 14"
                                className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3014B8] focus:border-transparent transition-all"
                              />
                              <span className="text-slate-400 text-xs">{maxDisplay}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {paper.submittedGrade !== null ? `${paper.submittedGrade}${maxDisplay}` : "--"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {paper.isLocked ? (
                            <div className="flex items-center justify-end gap-1 text-xs text-slate-400 font-medium">
                              <Lock className="w-3.5 h-3.5" />
                              Verrouillé
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSaveDraft(paper.copyId, paper.round)}
                              disabled={isSaving}
                              className="flex items-center justify-center gap-1.5 ml-auto text-xs font-bold text-white bg-[#3014B8] px-4 py-2 rounded-xl hover:bg-[#250f96] active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Enregistrer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}