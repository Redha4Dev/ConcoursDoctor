"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ChevronDown, 
  ArrowRight, 
  Settings2, 
  Clock, 
  Loader2 
} from "lucide-react";

export default function ExamSettings() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Form State
  const [threshold, setThreshold] = useState<number | string>("");
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- API Handlers ---

  const fetchGradingConfig = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/v1/sessions/${sessionId}/grading-config`);
      
      if (data?.data?.discrepancyThreshold !== undefined) {
        setThreshold(data.data.discrepancyThreshold);
      }
    } catch (error) {
      console.error("Error fetching grading config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!sessionId || threshold === "") return;
    
    try {
      setIsSaving(true);
      const payload = {
        discrepancyThreshold: Number(threshold)
      };

      const { data } = await api.patch(
        `/api/v1/sessions/${sessionId}/grading-config`, 
        payload
      );

      if (data.success && data.data) {
        // Update state with the confirmed saved value
        setThreshold(data.data.discrepancyThreshold);
      }
    } catch (error) {
      console.error("Error saving grading config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Re-fetch to reset to the database's current state
    fetchGradingConfig();
  };

  // Fetch data on mount
  useEffect(() => {
    fetchGradingConfig();
  }, [sessionId]);

  return (
    <div className="flex flex-row gap-6 w-full font-sans items-start">
      
      {/* Left Column */}
      <div className="flex flex-col gap-6 w-[400px]">
        
        {/* Life Cycle Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[12px] font-bold text-[#3014B8] tracking-widest uppercase">
              Statut Actuel
            </h3>
            <span className="bg-[#FCE8E0] text-[#934834] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Draft
            </span>
          </div>

          <h2 className="text-[36px] font-bold text-[#1E293B] mb-2 leading-tight">
            Cycle de vie
          </h2>
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
            Déterminez l'état de visibilité et d'interaction pour cette session d'examen.
          </p>

          <div className="relative mb-6">
            <select className="w-full bg-[#F1F5F9] border-none rounded-xl py-4 px-5 text-[15px] font-bold text-[#1E293B] appearance-none outline-none focus:ring-2 focus:ring-[#3014B8]/20 transition-all">
              <option>Brouillon (Draft)</option>
              <option>Publié</option>
              <option>Clôturé</option>
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <button className="w-full bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 group">
            Mettre à jour le statut
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Activity Journal Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h2 className="text-[20px] font-bold text-[#1E293B] mb-6">
            Journal d'activité récent
          </h2>
          
          <div className="flex flex-col gap-6">
            {/* Log Item 1 */}
            <div className="relative pl-6 border-l-4 border-[#3014B8]">
              <h4 className="text-[14px] font-bold text-[#1E293B]">
                SEUIL DE DIVERGENCE changé
              </h4>
              <p className="text-[12px] text-slate-400 mt-0.5 uppercase tracking-tight font-medium">
                Par Admin le 24/04/2026
              </p>
            </div>

            {/* Log Item 2 */}
            <div className="relative pl-6 border-l-4 border-slate-400">
              <h4 className="text-[14px] font-bold text-[#1E293B]">
                Malki Mimoun assigné comme Coordinateur
              </h4>
              <p className="text-[12px] text-slate-400 mt-0.5 uppercase tracking-tight font-medium">
                Par Admin le 20/10/2024
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Grading Config */}
      <div className="bg-white rounded-2xl p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex-1 h-fit relative">
        
        {/* Loading Overlay for initial fetch */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-[#3014B8]" size={32} />
          </div>
        )}

        <div className="flex items-start gap-5 mb-10">
          <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center text-[#3014B8]">
            <Settings2 size={28} />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-[#1E293B] leading-tight">
              Paramètres de Notation (GradingConfig)
            </h2>
            <p className="text-[15px] text-slate-400 mt-1">
              Règles algorithmiques de résolution des écarts de notation.
            </p>
          </div>
        </div>

        {/* Threshold Setting */}
        <div className="mb-10">
          <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Seuil de divergence
          </label>
          <div className="relative">
            <input 
              type="number"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-[#F1F5F9] border-none rounded-xl py-5 px-6 text-[22px] font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3014B8]/20 transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[15px] font-bold text-slate-400">
              pts
            </span>
          </div>
          <p className="text-[13px] text-slate-400 mt-3">
            Écart maximal autorisé entre deux correcteurs avant arbitrage.
          </p>
        </div>

        {/* Date Setting */}
        <div className="mb-14">
          <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Date limite résultats
          </label>
          <div className="relative">
            <input 
              type="text" 
              defaultValue="15 Juin 2026" 
              disabled
              className="w-full bg-[#F1F5F9] border-none rounded-xl py-5 px-6 text-[18px] font-bold text-[#3014B8] outline-none opacity-80 cursor-not-allowed"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-[#E0E7FF] text-[#3014B8] px-3 py-1 rounded-lg">
              <Clock size={14} />
              <span className="text-[11px] font-bold tracking-tighter uppercase">J + 5</span>
            </div>
          </div>
          <p className="text-[13px] text-slate-400 mt-3">
            Calculé automatiquement selon la date d'examen (+5 jours).
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-8 pt-6 border-t border-slate-100">
          <button 
            onClick={handleReset}
            disabled={isSaving}
            className="text-[16px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            Réinitialiser
          </button>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading || threshold === ""}
            className="bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-10 py-4 rounded-xl text-[16px] font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            {isSaving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </button>
        </div>
      </div>

    </div>
  );
}