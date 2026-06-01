"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ClipboardList, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import {
  AssignmentCard,
  type Assignment,
} from "@/components/dashboard/corrector/AssignmentCard";

// --- API Shape Interfaces ---
interface ApiSubject {
  subjectId: string;
  subjectName: string;
  totalAssigned: number;
  graded: number;
  pending: number;
  locked: boolean;
}

interface ApiSession {
  sessionId: string;
  sessionLabel: string;
  subjects: ApiSubject[];
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/v1/correction/my-assignments");
      const data = res.data?.data ?? res.data;
      
      // Defensively parse and flatten nested sessions -> subjects
      if (data && Array.isArray(data.sessions)) {
        const flattenedList: Assignment[] = [];

        data.sessions.forEach((session: ApiSession) => {
          if (Array.isArray(session.subjects)) {
            session.subjects.forEach((subj: ApiSubject) => {
              // Map into the Assignment format expected by AssignmentCard
              flattenedList.push({
                id: `${session.sessionId}-${subj.subjectId}`,
                subjectId: subj.subjectId,
                subjectName: subj.subjectName,
                sessionTitle: session.sessionLabel,
                totalCopies: subj.totalAssigned || 0,
                gradedCopies: subj.graded || 0,
                isLocked: subj.locked || false,
              } as unknown as Assignment); 
              // Using typecast placeholder block to easily match local component import interfaces
            });
          }
        });

        setAssignments(flattenedList);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);
      setError("Impossible de charger vos affectations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCardClick = (subjectId: string) => {
    router.push(`/dashboard/corrector/assignments/${subjectId}`);
  };

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#3014B8]" />
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full min-h-[60vh]">
        <AlertTriangle size={36} className="text-red-400" />
        <p className="text-[#64748B] text-[15px]">{error}</p>
        <button
          onClick={fetchAssignments}
          className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(103deg,#1C0087,#3014B8)" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <main
      className="flex flex-col items-start p-0 isolate w-full min-h-screen bg-[#F8F9FA]"
      style={{ fontFamily: "'Inter', 'Google Sans', sans-serif" }}
    >
      <div className="flex flex-col items-start p-8 gap-8 w-full max-w-[1280px] mx-auto">
        
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight">
            Mes Affectations
          </h1>
          <p className="text-[15px] text-[#64748B]">
            Sélectionnez une épreuve pour commencer ou continuer la notation.
          </p>
        </div>

        {/* ── Stats Summary Counter Pills ──────────────────────── */}
        {assignments.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-[0px_2px_8px_rgba(0,0,0,0.03)]">
              <ClipboardList size={16} className="text-[#3014B8]" />
              <span className="text-[13px] font-semibold text-[#475569]">
                {assignments.length} épreuve{assignments.length > 1 ? "s" : ""}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-[0px_2px_8px_rgba(0,0,0,0.03)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[13px] font-semibold text-[#475569]">
                {assignments.filter((a) => a.gradedCopies === a.totalCopies && a.totalCopies > 0).length} terminée{assignments.filter((a) => a.gradedCopies === a.totalCopies && a.totalCopies > 0).length > 1 ? "s" : ""}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-[0px_2px_8px_rgba(0,0,0,0.03)]">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[13px] font-semibold text-[#475569]">
                {assignments.filter((a) => a.gradedCopies < a.totalCopies).length} en cours
              </span>
            </div>
          </div>
        )}

        {/* ── Assignment Grid / Empty View Layout ─────────────── */}
        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-20 bg-white rounded-2xl border border-[#3014B8]/[0.06] shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
            <ClipboardList size={48} className="text-[#CBD5E1] mb-4" />
            <h3 className="text-[18px] font-bold text-[#0F172A]">
              Aucune affectation
            </h3>
            <p className="text-[14px] text-[#94A3B8] mt-2 max-w-sm text-center">
              Vous n'avez aucune épreuve assignée pour le moment. Les nouvelles
              affectations apparaîtront ici automatiquement.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}