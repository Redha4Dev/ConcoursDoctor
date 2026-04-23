"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  formationId: string;
  programName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewSessionModal({ formationId, programName, onClose, onSuccess }: Props) {
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [label, setLabel] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examRoom, setExamRoom] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill the label based on the program name and year
  useEffect(() => {
    setLabel(`Concours Doctorat ${programName} ${academicYear}`);
  }, [programName, academicYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!academicYear || !label || !examDate) {
      alert("Veuillez remplir les champs obligatoires (*).");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        formationId: formationId,
        academicYear: academicYear,
        label: label,
        availableSlots: availableSlots ? parseInt(availableSlots, 10) : 0,
        // Convert to standard ISO string format for the backend
        examDate: new Date(examDate).toISOString(), 
        examRoom: examRoom || "À définir"
      };

      await api.post("/api/v1/sessions", payload);
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Erreur lors de la création de la session. Veuillez vérifier la console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative flex flex-col rounded-[24px]"
        style={{
          width: 576,
          maxWidth: 576,
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        {/* Modal Header */}
        <div className="flex flex-col p-8 border-b border-[rgba(200,196,215,0.1)]">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-[24px] font-bold text-[#0F172A] leading-[30px]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Nouvelle session
              </h2>
              <p className="text-[14px] text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Configurez les paramètres du concours pour {programName}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8">
          
          {/* Label (Full Width) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Intitulé de la session
              </label>
              <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
            </div>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
              style={{ background: "#F6F6F8", fontFamily: "'Google Sans', sans-serif" }}
            />
          </div>

          {/* Year + Slots row */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Année académique
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025/2026"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{ background: "#F6F6F8", fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Places disponibles
              </label>
              <input
                type="number"
                min="0"
                value={availableSlots}
                onChange={(e) => setAvailableSlots(e.target.value)}
                placeholder="20"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{ background: "#F6F6F8", fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Exam Date + Room row */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Date d'examen
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input
                type="datetime-local"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{ background: "#F6F6F8", fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Salle d'examen
              </label>
              <input
                type="text"
                value={examRoom}
                onChange={(e) => setExamRoom(e.target.value)}
                placeholder="Ex: Amphi A"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{ background: "#F6F6F8", fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-row justify-end items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-[#475569] disabled:opacity-50"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-[8px] text-[14px] font-semibold text-white disabled:opacity-70 transition-all"
              style={{ background: "#3014B8", fontFamily: "'Inter', sans-serif" }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}