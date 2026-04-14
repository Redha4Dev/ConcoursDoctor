"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus, MoreVertical, Trash2 } from "lucide-react";
import EditFormationModal from "@/components/dashboard/EditFormationModal";
import NewSessionModal from "@/components/dashboard/NewSessionModal";

type SessionStatus = "draft" | "archive";

interface Session {
  id: string;
  year: string;
  status: SessionStatus;
  candidates: number;
  examDate: string;
  rooms: number;
}

interface StaffMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  online?: boolean;
}

const SESSIONS: Session[] = [
  {
    id: "s1",
    year: "2025/2026",
    status: "draft",
    candidates: 45,
    examDate: "14/04/2026",
    rooms: 2,
  },
  {
    id: "s2",
    year: "2024/2025",
    status: "archive",
    candidates: 38,
    examDate: "10/05/2025",
    rooms: 3,
  },
];

const STAFF: StaffMember[] = [
  { id: "1", initials: "MM", name: "Malki Mimoun", role: "COORDINATEUR" },
  {
    id: "2",
    initials: "BA",
    name: "Benali Ahmed",
    role: "CORRECTEUR",
    online: true,
  },
  { id: "3", initials: "SM", name: "Sara Meziane", role: "JURY" },
  { id: "4", initials: "KM", name: "Kaci Mohamed", role: "SURVEILLANT" },
];

const SessionStatusBadge = ({ status }: { status: SessionStatus }) => {
  if (status === "archive") {
    return (
      <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[12px] font-bold text-[#047857]">
        Archive
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-[#F6F6F8] text-[12px] font-bold text-[#64748B]">
      DRAFT
    </span>
  );
};

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params?.id as string;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);

  return (
    <div
      className="flex flex-col gap-6 p-8 w-full bg-[#F8F9FA] min-h-screen"
      style={{ paddingBottom: 55 }}
    >
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/dashboard/programs")}
        className="flex items-center gap-2 text-[16px] font-bold text-[#0F172A] hover:opacity-70 transition-opacity"
        style={{ fontFamily: "'Google Sans', sans-serif" }}
      >
        <ArrowLeft size={12} />
        Formations
      </button>

      {/* Header Section */}
      <div className="flex flex-row justify-between items-end w-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[10px] font-bold uppercase tracking-wide text-[#047857]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Actif
            </span>
            <span
              className="text-[16px] font-bold text-[#3014B8]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Informatique
            </span>
          </div>
          <h1
            className="text-[36px] font-bold text-[#0F172A] leading-[45px]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Doctorat en Informatique — INFO-2026
          </h1>
          <p
            className="text-[14px] text-[#0F172A]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Département: Informatique • Code: INF-DRT-2026
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-[32px] text-white text-[14px] font-bold"
          style={{
            background: "linear-gradient(111.37deg, #1C0087 0%, #3014B8 100%)",
            fontFamily: "'Google Sans', sans-serif",
          }}
        >
          <Pencil size={14} />
          Modifier
        </button>
      </div>

      {/* Main Content - Two columns */}
      <div className="relative w-full" style={{ minHeight: 567 }}>
        {/* Left Column */}
        <div
          className="absolute flex flex-col gap-8"
          style={{ left: 0, right: 330, top: 16 }}
        >
          {/* Sessions Section */}
          <div
            className="flex flex-col p-8 gap-8 rounded-[20px] bg-white"
            style={{
              border: "1px solid rgba(48,20,184,0.1)",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
              backdropFilter: "blur(7.6px)",
            }}
          >
            {/* Section Header */}
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-col gap-1">
                <h3
                  className="text-[18px] font-bold text-[#191C1E]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  SESSIONS
                </h3>
                <p
                  className="text-[14px] text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Historique et planification des cohortes
                </p>
              </div>
              <button
                onClick={() => setShowNewSession(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-[32px] text-[14px] font-bold text-[#1C0087]"
                style={{
                  background: "rgba(48,20,184,0.1)",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              >
                <Plus size={14} className="text-[#1C0087]" />
                Nouvelle
              </button>
            </div>

            {/* Sessions Table */}
            <div className="flex flex-col w-full">
              {/* Table header */}
              <div className="flex flex-row w-full pb-4 border-b border-[#F1F5F9]">
                {["Année", "Statut", "Candidats", "Date examen", "Salles"].map(
                  (h, i) => (
                    <div
                      key={h}
                      className={`flex-1 px-4 pb-1 ${i === 2 || i === 4 ? "text-center" : ""}`}
                    >
                      <span
                        className="text-[14px] font-bold text-[#64748B]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {h}
                      </span>
                    </div>
                  )
                )}
                <div className="w-[72px]" />
              </div>

              {/* Rows */}
              {SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-row items-center w-full cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                  style={{ height: 83 }}
                  onClick={() =>
                    router.push(
                      `/dashboard/programs/${programId}/${session.id}`
                    )
                  }
                >
                  <div className="flex-1 px-4">
                    <span
                      className="text-[16px] font-bold text-[#0F172A]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {session.year}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <SessionStatusBadge status={session.status} />
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                      <span
                        className="text-[16px] font-bold text-[#0F172A]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {session.candidates}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 px-4 pl-8">
                    <span
                      className="text-[16px] text-[#64748B]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {session.examDate}
                    </span>
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white"
                      style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                    >
                      <span
                        className="text-[16px] font-bold text-[#0F172A]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {session.rooms}
                      </span>
                    </div>
                  </div>
                  <div className="w-[72px] flex justify-end pr-4">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-[#94A3B8]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Teaser Cards */}
          <div className="relative w-full" style={{ height: 128 }}>
            {/* Success Rate */}
            <div
              className="absolute flex flex-col gap-1 p-6 rounded-[12px]"
              style={{
                left: 0,
                right: "66.67%",
                top: 0,
                height: 125,
                background: "#3014B8",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
                backdropFilter: "blur(7.6px)",
              }}
            >
              <span
                className="text-[14px] text-white opacity-70"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Taux de succès
              </span>
              <span
                className="text-[24px] font-bold text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                84%
              </span>
              <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: "84%" }}
                />
              </div>
            </div>

            {/* Budget */}
            <div
              className="absolute flex flex-col gap-1 p-6 rounded-[12px] bg-white"
              style={{
                left: "33.33%",
                right: "33.33%",
                top: 0,
                height: 125,
                border: "1px solid rgba(48,20,184,0.1)",
                boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
                backdropFilter: "blur(7.6px)",
              }}
            >
              <span
                className="text-[14px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Budget Alloué
              </span>
              <span
                className="text-[24px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                12k€
              </span>
              <span
                className="text-[10px] font-semibold text-[#059669] pt-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                +4% vs 2024
              </span>
            </div>

            {/* Modules */}
            <div
              className="absolute flex flex-col gap-1 p-6 rounded-[12px] bg-white"
              style={{
                left: "66.67%",
                right: 0,
                top: 0,
                height: 125,
                border: "1px solid rgba(48,20,184,0.1)",
                boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
                backdropFilter: "blur(7.6px)",
              }}
            >
              <span
                className="text-[14px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Modules
              </span>
              <span
                className="text-[24px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                12
              </span>
              <span
                className="text-[10px] text-[#474555] pt-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Crédits ECTS: 180
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Staff */}
        <div
          className="absolute flex flex-col"
          style={{ left: "calc(100% - 298px)", right: 0, top: 16 }}
        >
          <div
            className="flex flex-col p-8 rounded-[12px] bg-white"
            style={{
              border: "1px solid rgba(48,20,184,0.1)",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
              backdropFilter: "blur(7.6px)",
              width: 298,
              minHeight: 547,
            }}
          >
            {/* Header */}
            <div className="flex flex-col gap-1 pb-8">
              <h3
                className="text-[18px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                STAFF ASSIGNÉ
              </h3>
              <p
                className="text-[12px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Gestion de l'équipe pédagogique
              </p>
            </div>

            {/* Staff List */}
            <div className="flex flex-col gap-6 pb-7">
              {STAFF.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-row items-center gap-4 w-full"
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-[45px] text-[16px] font-semibold text-[#3014B8]"
                      style={{
                        background: "rgba(48,20,184,0.1)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {member.initials}
                    </div>
                    {member.online && (
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white"
                        style={{ right: -4, bottom: -4 }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span
                      className="text-[14px] font-bold text-[#0F172A] leading-[18px]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {member.name}
                    </span>
                    <span
                      className="text-[12px] font-bold text-[#64748B] leading-[15px]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {member.role}
                    </span>
                  </div>
                  <button className="p-1.5 rounded-[6px] hover:bg-gray-100">
                    <MoreVertical size={14} className="text-[#474555]" />
                  </button>
                </div>
              ))}
            </div>

            {/* Divider + Add button */}
            <div className="pt-6 border-t border-[rgba(200,196,215,0.1)]">
              <button
                className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] text-[14px] font-bold text-[#0F172A]"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              >
                <Plus size={16} />
                Assigner nouveau membre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div
        className="flex flex-col gap-4 p-6 rounded-[12px] mt-6"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(48,20,184,0.1)",
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        <h4
          className="text-[18px] font-bold text-[#0F172A]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Journal d'activité récent
        </h4>
        <div className="flex flex-col gap-4">
          {[
            {
              text: "Session 2025/2026 créée",
              time: "Il y a 2 heures",
              accent: "#3014B8",
            },
            {
              text: "Malki Mimoun assigné comme Coordinateur",
              time: "Il y a 5 heures",
              accent: "#64748B",
            },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-1 self-stretch rounded-full mt-0.5"
                style={{ background: log.accent, minHeight: 30 }}
              />
              <div className="flex flex-col">
                <span
                  className="text-[12px] font-bold text-[#0F172A]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  {log.text}
                </span>
                <span
                  className="text-[10px] text-[#64748B]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {log.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFormationModal onClose={() => setShowEditModal(false)} />
      )}
      {showNewSession && (
        <NewSessionModal onClose={() => setShowNewSession(false)} />
      )}
    </div>
  );
}