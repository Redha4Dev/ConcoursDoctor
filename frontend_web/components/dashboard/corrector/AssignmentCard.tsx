"use client";

import React from "react";
import { FileText, ChevronRight } from "lucide-react";

export interface Assignment {
  id: string;
  subjectId: string;
  subjectName: string;
  sessionTitle: string;
  sessionDate: string;
  formationName: string;
  totalCopies: number;
  gradedCopies: number;
  maxGrade: number;
  isLocked: boolean;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onClick: (subjectId: string) => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const progress =
    assignment.totalCopies > 0
      ? Math.round((assignment.gradedCopies / assignment.totalCopies) * 100)
      : 0;

  const isComplete = assignment.gradedCopies === assignment.totalCopies && assignment.totalCopies > 0;

  return (
    <button
      onClick={() => onClick(assignment.subjectId)}
      className="group relative flex flex-col gap-4 w-full text-left bg-white rounded-2xl border border-[#3014B8]/[0.08] p-6 transition-all duration-200 hover:shadow-[0px_8px_30px_rgba(48,20,184,0.10)] hover:border-[#3014B8]/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#3014B8]/30"
      style={{ fontFamily: "'Inter', 'Google Sans', sans-serif" }}
    >
      {/* Locked badge */}
      {assignment.isLocked && (
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D]">
            Validé
          </span>
        </div>
      )}

      {/* Top row: icon + subject */}
      <div className="flex items-start gap-3.5">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors duration-200 group-hover:bg-[#EDE9FF]"
          style={{ background: "rgba(238,235,255,0.76)" }}
        >
          <FileText size={18} className="text-[#3014B8]" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[15px] font-bold text-[#0F172A] leading-tight truncate">
            {assignment.subjectName}
          </span>
          <span className="text-[12px] text-[#64748B] leading-tight">
            {assignment.formationName}
          </span>
        </div>
      </div>

      {/* Session info */}
      <div className="flex items-center gap-2 text-[12px] text-[#94A3B8]">
        <span className="font-medium text-[#64748B]">{assignment.sessionTitle}</span>
        <span>•</span>
        <span>{assignment.sessionDate}</span>
      </div>

      {/* Progress section */}
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#475569]">
            {assignment.gradedCopies}{" "}
            <span className="text-[#94A3B8] font-normal">/ {assignment.totalCopies} copies notées</span>
          </span>
          <span
            className={`text-[11px] font-bold ${
              isComplete ? "text-[#15803D]" : "text-[#3014B8]"
            }`}
          >
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[6px] rounded-full bg-[#F1F5F9] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? "linear-gradient(90deg, #22C55E, #16A34A)"
                : "linear-gradient(90deg, #3014B8, #6D5DD3)",
            }}
          />
        </div>
      </div>

      {/* Bottom action hint */}
      <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
        <span className="text-[11px] font-medium text-[#94A3B8]">
          Note max: {assignment.maxGrade}
        </span>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#3014B8] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {assignment.isLocked ? "Voir les notes" : "Commencer la notation"}
          <ChevronRight size={14} />
        </div>
      </div>
    </button>
  );
}
