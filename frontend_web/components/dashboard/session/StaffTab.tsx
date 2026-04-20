"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface StaffCard {
  initials: string;
  name: string;
  role: string;
  availability?: string;
  specialty?: string;
  institution?: string;
  online?: boolean;
}

const StaffMemberCard = ({
  member,
  onRemove,
}: {
  member: StaffCard;
  onRemove?: () => void;
}) => (
  <div
    className="flex flex-row justify-between items-center p-5 rounded-[12px]"
    style={{ border: "1px solid rgba(48,20,184,0.1)" }}
  >
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 flex items-center justify-center rounded-[29px] text-[16px] font-semibold text-[#3014B8]"
        style={{
          background: "rgba(48,20,184,0.1)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {member.initials}
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className="text-[16px] font-bold text-[#0F172A]"
          style={{ fontFamily: "'Google Sans', sans-serif" }}
        >
          {member.name}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {member.availability && (
            <span
              className="text-[12px] text-[#059669]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              {member.availability}
            </span>
          )}
          {member.specialty && (
            <>
              <span className="text-[11px] text-[#64748B]">•</span>
              <span
                className="text-[12px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {member.specialty}
              </span>
            </>
          )}
          {member.institution && (
            <>
              <span className="text-[11px] text-[#64748B]">•</span>
              <span
                className="text-[12px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {member.institution}
              </span>
            </>
          )}
          {member.role && !member.availability && (
            <span
              className="text-[11px] text-[#64748B]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {member.role}
            </span>
          )}
        </div>
      </div>
    </div>
    <button
      className="p-1.5 rounded-[17px] hover:bg-red-50 transition-colors"
      onClick={onRemove}
    >
      <Trash2 size={16} className="text-[#BA1A1A]" />
    </button>
  </div>
);

const SectionCard = ({
  title,
  members,
  onAssign,
}: {
  title: string;
  members: StaffCard[];
  onAssign?: () => void;
}) => (
  <div
    className="flex flex-col gap-6 p-8 rounded-[20px] bg-white"
    style={{
      border: "1px solid rgba(48,20,184,0.1)",
      boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
      backdropFilter: "blur(7.6px)",
    }}
  >
    <div className="flex flex-row justify-between items-center">
      <h4
        className="text-[16px] font-bold text-[#0F172A]"
        style={{ fontFamily: "'Google Sans', sans-serif" }}
      >
        {title}
      </h4>
      <button
        onClick={onAssign}
        className="flex items-center gap-2 px-4 py-2 rounded-[32px] text-[14px] font-bold text-white"
        style={{
          background: "#3014B8",
          fontFamily: "'Google Sans', sans-serif",
        }}
      >
        <Plus size={8} className="text-white" />
        Assign
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {members.map((m, i) => (
        <StaffMemberCard key={i} member={m} />
      ))}
    </div>
  </div>
);

export default function StaffTab() {
  const coordinator: StaffCard = {
    initials: "MM",
    name: "Malki Mimoun",
    role: "ESI-SBA COORDINATOR",
  };

  const correctors: StaffCard[] = [
    {
      initials: "BA",
      name: "Benali Ahmed",
      role: "Corrector",
      availability: "Available",
      specialty: "Computer Science",
      institution: "USTHB",
    },
    {
      initials: "SM",
      name: "Sara Meziane",
      role: "Corrector",
      availability: "Available",
      specialty: "AI",
      institution: "ESI",
    },
  ];

  const jury: StaffCard[] = [
    {
      initials: "KN",
      name: "Kaci Nabil",
      role: "Professor, ESI-SBA",
    },
    {
      initials: "KM",
      name: "Kechar Mohamed",
      role: "Professor, ESI-SBA",
    },
  ];

  const proctors: StaffCard[] = [
    {
      initials: "KM",
      name: "Kaci Mohamed",
      role: "Professor, ESI-SBA",
    },
    {
      initials: "HL",
      name: "Hamdi Lina",
      role: "Professor, ESI-SBA",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Coordinator Section */}
      <div
        className="flex flex-col gap-6 p-8 rounded-[20px] bg-white"
        style={{
          border: "1px solid rgba(48,20,184,0.1)",
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        <div className="flex flex-row justify-between items-center">
          <h4
            className="text-[16px] font-bold text-[#0F172A]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Coordinator
          </h4>
          <button
            className="px-4 py-1.5 rounded-[32px] text-[12px] font-bold text-[#3014B8] border border-[rgba(48,20,184,0.1)]"
            style={{
              background: "rgba(48,20,184,0.1)",
              fontFamily: "'Google Sans', sans-serif",
            }}
          >
            Change
          </button>
        </div>

        {/* Large coordinator display */}
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 flex items-center justify-center rounded-[60px] text-[24px] font-bold text-[#3014B8]"
            style={{
              background: "rgba(48,20,184,0.1)",
              fontFamily: "'Google Sans', sans-serif",
            }}
          >
            MM
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[24px] font-bold text-[#0F172A]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Malki Mimoun
            </span>
            <span
              className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#64748B]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ESI-SBA COORDINATOR
            </span>
          </div>
        </div>
      </div>

      {/* Correctors */}
      <SectionCard title="Correctors" members={correctors} />

      {/* Jury */}
      <SectionCard title="Jury Members" members={jury} />

      {/* Proctors */}
      <SectionCard title="Proctors" members={proctors} />
    </div>
  );
}