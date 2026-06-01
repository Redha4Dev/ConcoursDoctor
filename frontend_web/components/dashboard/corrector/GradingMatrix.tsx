"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Lock, Save } from "lucide-react";
import { api } from "@/lib/api";

// --- INTERFACES & TYPES ---
interface Paper {
  copyId: string;
  anonymousCode: string;
  status: "PENDING" | "ASSIGNED" | "GRADED" | "CORRECTED";
  draftGrade: number | null;
  isLocked: boolean;
  submittedGrade: number | null;
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

  // Saisie des notes et états de chargement par ligne
  const [draftGrades, setDraftGrades] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<string[]>([]);

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
      console.log("GradingMatrix response:", response.data);

      if (success && data) {
        setPapers(data.papers || []);
        setSubjectInfo({
          name: data.subjectName,
          max: data.maxGrade,
          min: data.minimumGrade,
        });

        const initialDrafts: Record<string, string> = {};
        data.papers.forEach((p) => {
          if (p.draftGrade !== null) {
            initialDrafts[p.copyId] = String(p.draftGrade);
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

  // --- FONCTION DE SAUVEGARDE DU BROUILLON (MODIFIÉE) ---
  const handleSaveDraft = async (copyId: string) => {
    const gradeStr = draftGrades[copyId];
    if (gradeStr === undefined || gradeStr === "") return;

    const gradeValue = Number(gradeStr);
    const max = subjectInfo?.max || 20;

    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > max) {
      alert(`Veuillez entrer une note valide entre 0 et ${max}.`);
      return;
    }

    try {
      setSavingIds((prev) => [...prev, copyId]);

      // 🌟 Modification ici : signature (url, body, config)
      await api.put('/api/v1/correction/drafts', 
        {
          copyId,
          grade: gradeValue,
          sessionId
        },
        {
          params: { sessionId }
        }
      );

      setPapers((prevPapers) => 
        prevPapers.map((p) => 
          p.copyId === copyId 
            ? { ...p, draftGrade: gradeValue, status: p.status === "ASSIGNED" ? "GRADED" : p.status } 
            : p
        )
      );

    } catch (err: any) {
      console.error("❌ [GradingMatrix] Error saving draft:", err);
      alert("Erreur lors de la sauvegarde de la note brouillon.");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== copyId));
    }
  };

  // --- EFFETS ---
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // --- RENDUS INTERMÉDIAIRES ---
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

      {/* Contenu Dynamique */}
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
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">Aucune copie n'a été trouvée pour cette épreuve.</p>
        </div>
      ) : (
        /* Tableau de notation */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Code Anonyme</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Note Brouillon</th>
                  <th className="px-6 py-4">Note Validée</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {papers.map((paper) => {
                  const isSaving = savingIds.includes(paper.copyId);
                  const maxDisplay = subjectInfo?.max ? ` / ${subjectInfo.max}` : "";

                  return (
                    <tr key={paper.copyId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">
                        {paper.anonymousCode}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          paper.status === "ASSIGNED" || paper.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}>
                          {paper.status === "ASSIGNED" || paper.status === "PENDING" ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              En attente
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Corrigé
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {paper.isLocked ? (
                          paper.draftGrade !== null ? `${paper.draftGrade}${maxDisplay}` : "--"
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={subjectInfo?.max || 20}
                              step={0.25}
                              value={draftGrades[paper.copyId] || ""}
                              onChange={(e) => setDraftGrades((prev) => ({ ...prev, [paper.copyId]: e.target.value }))}
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
                            onClick={() => handleSaveDraft(paper.copyId)}
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
      )}
    </div>
  );
}