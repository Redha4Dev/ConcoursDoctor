"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  FileCheck,
  ClipboardList,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

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

// --- Flattened Local State Interface ---
interface AssignmentSummary {
  id: string;
  subjectId: string;
  sessionId: string;
  subjectName: string;
  sessionTitle: string;
  totalCopies: number;
  gradedCopies: number;
  isLocked: boolean;
}

export default function CorrectorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // 🌟 1. Extraction of unique sessions where the user is assigned as "CORRECTOR"
  const correctorStaffEntries = user?.sessionStaff
    ? user.sessionStaff.filter((item: any) => item.function === "CORRECTOR")
    : [];

  const uniqueSessions = Array.from(
    new Map(
      correctorStaffEntries
        .filter((entry: any) => entry.session)
        .map((entry: any) => [entry.session.id, entry.session])
    ).values()
  ) as any[];

  // 🌟 2. Automatic initialization of the active tab to the first found session
  useEffect(() => {
    if (uniqueSessions.length > 0 && !activeSessionId) {
      setActiveSessionId(uniqueSessions[0].id);
    }
  }, [user, uniqueSessions, activeSessionId]);

  // 🌟 3. Data fetching (Without useCallback) with sessionId as Query Parameter
  const fetchAssignments = async () => {
    if (!activeSessionId) return;

    try {
      setLoading(true);
      
      const res = await api.get("/api/v1/correction/my-assignments", {
        params: { sessionId: activeSessionId } // Always send sessionId as query parameter
      });
      
      const data = res.data?.data ?? res.data;
      
      if (data && Array.isArray(data.sessions)) {
        const flattenedList: AssignmentSummary[] = [];

        data.sessions.forEach((session: any) => {
          // Defensive client-side filtering to ensure only the selected session is loaded
          if (session.sessionId === activeSessionId && Array.isArray(session.subjects)) {
            session.subjects.forEach((subj: any) => {
              flattenedList.push({
                id: `${session.sessionId}-${subj.subjectId}`,
                subjectId: subj.subjectId,
                sessionId: session.sessionId,
                subjectName: subj.subjectName,
                sessionTitle: session.sessionLabel,
                totalCopies: subj.totalAssigned || 0,
                gradedCopies: subj.graded || 0,
                isLocked: subj.locked || false,
              });
            });
          }
        });

        setAssignments(flattenedList);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to fetch corrector summary updates:", error);
      setAssignments([]); 
    } finally {
      setLoading(false);
    }
  };

  // Automatic re-fetch when switching tabs
  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

  // --- Derived Metrics ---
  const pendingCount = assignments.filter((a) => a.gradedCopies < a.totalCopies).length;
  const completedCount = assignments.filter((a) => a.gradedCopies === a.totalCopies && a.totalCopies > 0).length;
  const totalCopies = assignments.reduce((s, a) => s + a.totalCopies, 0);
  const gradedCopies = assignments.reduce((s, a) => s + a.gradedCopies, 0);

  return (
    <main
      className="flex flex-col items-start p-0 isolate w-full min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', 'Google Sans', sans-serif" }}
    >
      <div className="flex flex-col items-start p-8 gap-8 w-full max-w-[1280px] mx-auto">
        
        {/* ── Welcome Header ──────────────────────────────────── */}
        <section className="flex flex-row justify-between items-end w-full">
          <header className="flex flex-col items-start gap-1">
            <p className="font-normal text-[15px] leading-5 text-[#64748B]">
              {formattedDate}
            </p>
            <h1 className="font-bold text-[36px] leading-[45px] text-[#0F172A]">
              Welcome, {user?.firstName || "Corrector"}
            </h1>
          </header>
          <button
            onClick={() => router.push("/dashboard/corrector/assignments")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-[14px] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3014B8]/20"
            style={{
              background: "linear-gradient(103deg, #1C0087 0%, #3014B8 100%)",
            }}
          >
            <ClipboardList size={16} />
            My Assignments
          </button>
        </section>

        {/* 🌟 4. Navigation tabs for assigned sessions */}
        {uniqueSessions.length > 0 && (
          <div className="flex items-center gap-2 border-b border-slate-200 w-full overflow-x-auto pb-px">
            {uniqueSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`px-4 py-2.5 font-semibold text-[14px] whitespace-nowrap border-b-2 transition-colors ${
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

        {/* ── Stats Cards Grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Pending Card */}
          <div className="flex items-center gap-4 bg-white border border-[#3014B8]/[0.06] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
            <div className="p-3.5 rounded-xl bg-amber-50">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
                Pending
              </p>
              <h2 className="text-[28px] font-bold text-[#0F172A] leading-tight">
                {loading ? "—" : pendingCount}
              </h2>
            </div>
          </div>

          {/* Completed Card */}
          <div className="flex items-center gap-4 bg-white border border-[#3014B8]/[0.06] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
            <div className="p-3.5 rounded-xl bg-emerald-50">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
                Completed
              </p>
              <h2 className="text-[28px] font-bold text-[#0F172A] leading-tight">
                {loading ? "—" : completedCount}
              </h2>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="flex items-center gap-4 bg-white border border-[#3014B8]/[0.06] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
            <div className="p-3.5 rounded-xl bg-[#EDE9FF]">
              <FileCheck className="w-6 h-6 text-[#3014B8]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
                Graded Copies
              </p>
              <h2 className="text-[28px] font-bold text-[#0F172A] leading-tight">
                {loading ? "—" : `${gradedCopies} / ${totalCopies}`}
              </h2>
            </div>
          </div>
        </div>

        {/* ── Core Display Component Render Matrix ────────────── */}
        <section className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#0F172A]">
              Active session exams
            </h2>
            <button
              onClick={() => router.push("/dashboard/corrector/assignments")}
              className="text-[13px] font-semibold text-[#3014B8] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#3014B8]" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {assignments.slice(0, 5).map((a) => {
                const progress =
                  a.totalCopies > 0
                    ? Math.round((a.gradedCopies / a.totalCopies) * 100)
                    : 0;
                const isComplete =
                  a.gradedCopies === a.totalCopies && a.totalCopies > 0;

                return (
                  <button
                    key={a.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/corrector/assignments/${activeSessionId}/${a.subjectId}`
                      )
                    }
                    className="flex items-center gap-5 w-full bg-white rounded-xl border border-slate-100 px-6 py-4 hover:shadow-md hover:border-[#3014B8]/10 transition-all group text-left"
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[14px] font-bold text-[#0F172A] truncate">
                        {a.subjectName}
                      </span>
                      <span className="text-[12px] text-[#94A3B8] truncate">
                        {a.sessionTitle}
                      </span>
                    </div>

                    {/* Progress Slider Layout */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-32 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            background: isComplete ? "#22C55E" : "#3014B8",
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-semibold text-[#475569] tabular-nums w-16 text-right">
                        {a.gradedCopies}/{a.totalCopies}
                      </span>
                    </div>

                    {a.isLocked && (
                      <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-bold text-[#15803D] uppercase tracking-wider shrink-0">
                        Validated
                      </span>
                    )}

                    <ChevronRight
                      size={16}
                      className="text-[#CBD5E1] group-hover:text-[#3014B8] transition-colors shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#3014B8]/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
              <ClipboardList size={44} className="text-[#CBD5E1] mb-4" />
              <h3 className="text-[17px] font-bold text-[#0F172A]">
                No assignments
              </h3>
              <p className="text-[14px] text-[#94A3B8] max-w-sm mt-2">
                You have no assigned exams for this session. New assignments will
                appear here automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}