"use client";
import React, { useState } from "react";
import { UserPlus } from "lucide-react";

interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLES = [
  { value: "corrector", label: "CORRECTOR" },
  { value: "Coordinator", label: "COORDINATOR" },
  { value: "Surveillant", label: "SURVEILLANT" },
  { value: "Auditor", label: "AUDITOR" },
  { value: "Jury Member", label: "JURY MEMBER" },
];

const SECTION_LABELS: Record<string, string> = {
  "corrector": "CORRECTOR PROFILE",
  "Jury Member": "JURY PROFILE",
  "Surveillant": "SURVEILLANT PROFILE",
  "Auditor": "AUDITOR PROFILE",
  "Coordinator": "COORDINATOR PROFILE",
};

const GRADES = ["Professor", "Associate Professor", "Doctor", "Lecturer"];

const inputClass =
  "w-full h-[46px] bg-white border border-[rgba(200,196,215,0.25)] rounded-lg px-4 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#3014B8]/40 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

const selectClass =
  "w-full h-12 bg-white border border-[rgba(200,196,215,0.25)] rounded-lg px-4 pr-10 text-[14px] font-bold text-[#0F172A] appearance-none cursor-pointer focus:outline-none focus:border-[#3014B8]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

const ChevronDown = () => (
  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#64748B" strokeWidth="2"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const NewUserModal: React.FC<NewUserModalProps> = ({ open, onClose }) => {
  // 1. Initialized to empty string so nothing is selected by default
  const [role, setRole] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-[672px] mx-4 rounded-xl overflow-hidden font-['Google_Sans']"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          boxShadow: "6px 6px 24px rgba(0, 0, 0, 0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        <div className="absolute right-4 top-6 pointer-events-none select-none z-0 text-[#0F172A] opacity-[0.05]">
          <UserPlus size={130} strokeWidth={1.25} />
        </div>

        <div className="relative z-10 flex flex-col px-8 pt-8 pb-5 border-b border-white/50">
          <h2 className="font-bold text-[30px] leading-[38px] text-[#0F172A]">
            Create new user
          </h2>
          <p className="text-[12px] text-[#64748B] mt-1">
            Add a new member to the ConcoursDoctor academic team.
          </p>
        </div>

        <div className="relative z-10 px-8 pt-6 pb-6 flex flex-col gap-6">
          {/* Row 1: Always visible */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1 font-bold text-[13px] text-[#64748B] mb-1.5">
                Full name
                <span className="text-[#BA1A1A] text-[11px] font-semibold font-['Inter'] tracking-[0.5px]">*</span>
              </label>
              <input type="text" placeholder="ex: Dr. Robert Saly" className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1 font-bold text-[13px] text-[#64748B] mb-1.5">
                Email address
                <span className="text-[#BA1A1A] text-[11px] font-semibold font-['Inter'] tracking-[0.5px]">*</span>
              </label>
              <input type="email" placeholder="robert.saly@institution.com" className={inputClass} />
            </div>
          </div>

          {/* Role: Always visible */}
          <div>
            <label className="flex items-center gap-1 font-bold text-[13px] text-[#64748B] mb-1.5">
              Role
              <span className="text-[#BA1A1A] text-[11px] font-semibold font-['Inter'] tracking-[0.5px]">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Select a role...</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>

          {/* Conditional Rendering: Only shows if a role is selected */}
          {role && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Section divider */}
              <div className="relative flex items-center justify-center h-[24px]">
                <div className="absolute inset-x-0 top-1/2 h-[3px] bg-white/70 rounded-[13px]" />
                <span className="relative z-10 bg-white/70 rounded-[32px] px-4 py-[3px] text-[13px] font-bold text-[#3014B8]">
                  {SECTION_LABELS[role] ?? "PROFILE"}
                </span>
              </div>

              {/* Specialization */}
              <div>
                <label className="block font-bold text-[13px] text-[#64748B] mb-1.5">Specialization</label>
                <input
                  type="text"
                  placeholder="ex: Internal Medicine, Applied Mathematics"
                  className={inputClass}
                />
              </div>

              {/* Row 2: Grade + Institution */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-[13px] text-[#64748B] mb-1.5">Academic grade</label>
                  <div className="relative">
                    <select className={selectClass}>
                      {GRADES.map((g) => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-[13px] text-[#64748B] mb-1.5">Home institution</label>
                  <input type="text" placeholder="ex: University of Paris" className={inputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 flex justify-end items-center gap-4 px-8 pb-7 pt-2">
          <button
            onClick={onClose}
            className="h-10 px-6 rounded-lg font-bold text-[16px] text-[#64748B] hover:bg-white/60 transition-colors"
          >
            Cancel
          </button>
          <button 
             disabled={!role} // Optional: Disable button until role is selected
             className={`h-10 px-8 rounded-lg font-bold text-[16px] text-white transition-colors shadow-[0_2px_8px_rgba(48,20,184,0.25)] ${!role ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3014B8] hover:bg-[#2610A0]'}`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};