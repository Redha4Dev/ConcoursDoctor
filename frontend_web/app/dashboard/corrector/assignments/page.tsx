"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ClipboardList, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import {
  AssignmentCard,
  type Assignment,
} from "@/components/dashboard/corrector/AssignmentCard";

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
  const { user } = useAuth();
  console.log("🚀 ~ file: page.tsx:32 ~ AssignmentsPage ~ user:", user);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌟 Extraire les sessions uniques où la fonction est "CORRECTOR"
  const correctorSessions = user?.sessionStaff
    ? user.sessionStaff.filter((item: any) => item.function === "CORRECTOR")
    : [];

  const uniqueSessions = Array.from(
    new Map(correctorSessions.map((s: any) => [s.session.id, s.session])).values()
  ) as any[];

  // Initialiser l'onglet actif sur la première session disponible
  useEffect(() => {
    if (uniqueSessions.length > 0 && !activeSessionId) {
      setActiveSessionId(uniqueSessions[0].id);
    }
  }, [user, uniqueSessions, activeSessionId]);

  // 🌟 Récupération des données filtrées par l'onglet actif
  const fetchAssignments = async () => {
    if (!activeSessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Envoi du sessionId actif dans la Query String
      const res = await api.get("/api/v1/correction/my-assignments", {
        params: { sessionId: activeSessionId }
      });
      
      const data = res.data?.data ?? res.data;
      
      if (data && Array.isArray(data.sessions)) {
        const flattenedList: Assignment[] = [];

        data.sessions.forEach((session: ApiSession) => {
          // Double sécurité : On ne garde que la session active demandée
          if (session.sessionId === activeSessionId && Array.isArray(session.subjects)) {
            session.subjects.forEach((subj: ApiSubject) => {
              flattenedList.push({
                id: `${session.sessionId}-${subj.subjectId}`,
                subjectId: subj.subjectId,
                subjectName: subj.subjectName,
                sessionTitle: session.sessionLabel,
                totalCopies: subj.totalAssigned || 0,
                gradedCopies: subj.graded || 0,
                isLocked: subj.locked || false,
              } as unknown as Assignment); 
            });
          }
        });

        setAssignments(flattenedList);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);
      setError("Impossible de charger les affectations de cette session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [activeSessionId]);

  // 🌟 Redirection vers la nouvelle structure dynamique /[sessionId]/[subjectId]
  const handleCardClick = (subjectId: string) => {
    router.push(`/dashboard/corrector/assignments/${activeSessionId}/${subjectId}`);
  };

  return (
    <main
      className="flex flex-col items-start p-0 isolate w-full min-h-screen bg-[#F8F9FA]"
      style={{ fontFamily: "'Inter', 'Google Sans', sans-serif" }}
    >
      <div className="flex flex-col items-start p-8 gap-8 w-full max-w-[1280px] mx-auto">
        
        {/* En-tête */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight">
            Mes Affectations
          </h1>
          <p className="text-[15px] text-[#64748B]">
            Sélectionnez une session puis choisissez l'épreuve à évaluer.
          </p>
        </div>

        {/* 🌟 Barre d'onglets (Sessions) */}
        {uniqueSessions.length > 0 && (
          <div className="flex items-center gap-2 border-b border-slate-200 w-full overflow-x-auto pb-px">
            {uniqueSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`px-4 py-2.5 font-semibold text-[14px] whitespace-nowrap border-b-2 transition-all transition-colors ${
                  activeSessionId === session.id
                    ? "border-[#3014B8] text-[#3014B8]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {session.label}
              </button>
            ))}
          </div>
        )}

        {/* Compteurs de statistiques globaux pour la session active */}
        {!loading && !error && assignments.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <ClipboardList size={16} className="text-[#3014B8]" />
              <span className="text-[13px] font-semibold text-[#475569]">
                {assignments.length} épreuve{assignments.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[13px] font-semibold text-[#475569]">
                {assignments.filter((a) => a.gradedCopies === a.totalCopies).length} terminée{assignments.filter((a) => a.gradedCopies === a.totalCopies).length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Affichage des états de chargement / erreur / grilles */}
        {loading ? (
          <div className="flex items-center justify-center w-full min-h-[40vh]">
            <Loader2 size={32} className="animate-spin text-[#3014B8]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 w-full min-h-[40vh]">
            <AlertTriangle size={36} className="text-red-400" />
            <p className="text-[#64748B] text-[15px]">{error}</p>
            <button
              onClick={fetchAssignments}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: "linear-gradient(103deg,#1C0087,#3014B8)" }}
            >
              Réessayer
            </button>
          </div>
        ) : assignments.length > 0 ? (
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
          <div className="flex flex-col items-center justify-center w-full py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <ClipboardList size={48} className="text-[#CBD5E1] mb-4" />
            <h3 className="text-[18px] font-bold text-[#0F172A]">Aucune affectation</h3>
            <p className="text-[14px] text-[#94A3B8] mt-2 text-center max-w-sm">
              Aucune épreuve n'est assignée à votre compte pour cette session.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}