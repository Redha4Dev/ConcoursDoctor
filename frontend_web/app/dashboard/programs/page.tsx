"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, HelpCircle, Download } from "lucide-react";
import CreateFormationModal from "@/components/dashboard/CreateFormationModal";

type FilterType = "Toutes" | "Active" | "Inactive";
type StatusType = "active" | "inactive";

interface Program {
  id: string;
  name: string;
  subtitle: string;
  code: string;
  department: string;
  sessions: number;
  status: StatusType;
}

const PROGRAMS: Program[] = [
  {
    id: "1",
    name: "Doctorat Informatique",
    subtitle: "Systèmes Distribués & IA",
    code: "INFO-2026",
    department: "Informatique",
    sessions: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Doctorat Mathématiques",
    subtitle: "Analyse Complexe & Algèbre",
    code: "MATH-2026",
    department: "Mathématiques",
    sessions: 1,
    status: "active",
  },
  {
    id: "3",
    name: "Doctorat Physique",
    subtitle: "Physique Quantique",
    code: "PHYS-2026",
    department: "Physique",
    sessions: 0,
    status: "inactive",
  },
];

const StatusBadge = ({ status }: { status: StatusType }) => {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#D1FAE5]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#047857]">
          Actif
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F6F8] border border-[#F6F6F8]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
      <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
        Inactif
      </span>
    </span>
  );
};

export default function ProgramsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("Toutes");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeCount = PROGRAMS.filter((p) => p.status === "active").length;
  const inactiveCount = PROGRAMS.filter((p) => p.status === "inactive").length;

  const filtered = PROGRAMS.filter((p) => {
    if (filter === "Active") return p.status === "active";
    if (filter === "Inactive") return p.status === "inactive";
    return true;
  });

  return (
    <div className="flex flex-col items-start gap-10 p-8 w-full min-h-screen bg-[#F8F9FA]">
      {/* Page Header */}
      <div className="flex flex-row justify-between items-end w-full">
        <div className="flex flex-col gap-2">
          <h1
            className="text-[36px] font-bold leading-[45px] text-[#0F172A]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Formations doctorales
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-[32px] text-white font-bold text-[16px]"
          style={{
            background: "linear-gradient(103.23deg, #1C0087 0%, #3014B8 100%)",
            boxShadow:
              "0px 10px 15px -3px rgba(99,102,241,0.2), 0px 4px 6px -4px rgba(99,102,241,0.2)",
            fontFamily: "'Google Sans', sans-serif",
          }}
        >
          <Plus size={14} className="text-white" />
          Nouvelle formation
        </button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col w-full gap-0 relative">
        {/* Filters & Stats */}
        <div className="flex flex-row justify-between items-center pb-2 w-full">
          {/* Filter Pills */}
          <div
            className="flex flex-row items-center p-1 rounded-[22px] border border-[rgba(48,20,184,0.1)]"
            style={{
              background: "#FFFFFF",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
              backdropFilter: "blur(7.6px)",
            }}
          >
            {(["Toutes", "Active", "Inactive"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-[35px] text-[14px] transition-all ${
                  filter === f
                    ? "bg-[#F6F6F8] font-bold text-[#1C0087]"
                    : "font-normal text-[#474555]"
                }`}
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-row items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span
                className="text-[12px] font-bold text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {activeCount} Actives
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              <span
                className="text-[12px] font-bold text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {inactiveCount} Inactives
              </span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div
          className="flex flex-col w-full rounded-[20px] overflow-hidden"
          style={{
            border: "1px solid rgba(48,20,184,0.1)",
            filter: "drop-shadow(6px 6px 24px rgba(0,0,0,0.16))",
            backdropFilter: "blur(7.6px)",
          }}
        >
          {/* Table */}
          <div className="flex flex-col w-full bg-white">
            {/* Header */}
            <div className="flex flex-row items-center w-full bg-white">
              <div className="flex-[3] px-8 py-5">
                <span
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Formation
                </span>
              </div>
              <div className="flex-[1.3] px-6 py-5 text-center">
                <span
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Code
                </span>
              </div>
              <div className="flex-[1.5] px-6 py-5">
                <span
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Département
                </span>
              </div>
              <div className="flex-[1.1] px-6 py-5 text-center">
                <span
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Sessions
                </span>
              </div>
              <div className="flex-[1.3] px-6 py-5">
                <span
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Statut
                </span>
              </div>
              <div className="w-[108px]" />
            </div>

            {/* Body */}
            <div className="flex flex-col w-full">
              {filtered.map((program, i) => (
                <div
                  key={program.id}
                  className={`flex flex-row items-center w-full cursor-pointer hover:bg-[#F8F9FA] transition-colors ${
                    i > 0 ? "border-t border-[#F8FAFC]" : ""
                  }`}
                  style={{ height: 88 }}
                  onClick={() =>
                    router.push(`/dashboard/programs/${program.id}`)
                  }
                >
                  {/* Name + icon */}
                  <div className="flex-[3] px-8 flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-[16px]"
                      style={{ background: "rgba(238,242,255,0.76)" }}
                    >
                      <BookOpen size={16} className="text-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-[14px] font-bold text-[#0F172A] leading-[18px]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {program.name}
                      </span>
                      <span
                        className="text-[12px] font-normal text-[#64748B] leading-[15px]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {program.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="flex-[1.3] px-6 flex justify-center">
                    <span
                      className="px-2 py-0.5 rounded-[8px] text-[12px] text-[#64748B] bg-[#F6F6F8]"
                      style={{ fontFamily: "'Liberation Mono', monospace" }}
                    >
                      {program.code}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="flex-[1.5] px-6">
                    <span
                      className="text-[14px] text-[#0F172A]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {program.department}
                    </span>
                  </div>

                  {/* Sessions */}
                  <div className="flex-[1.1] px-6 flex justify-center">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full"
                      style={{
                        background:
                          program.sessions > 0
                            ? "#EAE7F7"
                            : "rgba(48,20,184,0.1)",
                      }}
                    >
                      <span
                        className="text-[12px] font-bold text-[#3014B8]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {program.sessions}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-[1.3] px-6">
                    <StatusBadge status={program.status} />
                  </div>

                  {/* Actions */}
                  <div className="w-[108px] px-8 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center justify-center w-5 h-8 hover:bg-gray-100 rounded"
                    >
                      <span className="text-[#64748B] text-lg leading-none">
                        ···
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Footer */}
          <div className="flex flex-row justify-between items-center px-8 py-4 w-full bg-white border-t border-[#F8FAFC]">
            <span
              className="text-[14px] text-[#64748B]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Affichage de 1 à {filtered.length} sur {PROGRAMS.length}{" "}
              formations
            </span>
            <div className="flex gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[rgba(48,20,184,0.1)] opacity-50"
                disabled
              >
                <span className="text-[#64748B] text-xs">‹</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[rgba(48,20,184,0.1)]">
                <span className="text-[#64748B] text-xs">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="flex flex-row flex-wrap gap-6 pt-4 w-full">
          {/* Guide de session card - purple */}
          <div
            className="flex-1 min-w-[280px] flex flex-col p-6 rounded-[20px] relative overflow-hidden"
            style={{
              background: "#3014B8",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
              minHeight: 224,
            }}
          >
            <div
              className="absolute right-2 bottom-1 w-24 h-24 rounded-[16px] opacity-10"
              style={{
                background: "#FFFFFF",
                transform: "rotate(12deg)",
              }}
            />
            <div className="relative z-10 flex flex-col gap-1">
              <h3
                className="text-[18px] font-bold text-white leading-[22px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Guide de session
              </h3>
              <p
                className="text-[14px] text-[#EAE7F7] mt-1"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Préparez les calendriers d'admission pour le semestre d'automne
                2026.
              </p>
              <button
                className="mt-3 px-4 py-2 rounded-[16px] text-[12px] font-bold text-white self-start"
                style={{ background: "rgba(255,255,255,0.5)" }}
              >
                Voir le calendrier
              </button>
            </div>
          </div>

          {/* Aide rapide card - white */}
          <div
            className="flex-1 min-w-[280px] flex flex-col p-6 rounded-[20px] relative overflow-hidden border border-[rgba(48,20,184,0.1)]"
            style={{
              background: "#FFFFFF",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
              minHeight: 222,
            }}
          >
            <div
              className="absolute right-1 bottom-1 w-28 h-28 rounded-[16px]"
              style={{
                background: "#F6F6F8",
                transform: "rotate(-12deg)",
              }}
            />
            <div className="relative z-10 flex flex-col gap-1">
              <h3
                className="text-[18px] font-bold text-[#3014B8] leading-[22px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Aide rapide
              </h3>
              <p
                className="text-[14px] text-[#64748B] mt-1"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Comment désactiver une formation doctorale existante ?
              </p>
              <button
                className="mt-3 text-[12px] font-bold text-[#1C0087] self-start"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Voir la documentation
              </button>
            </div>
          </div>

          {/* Rapport card - lavender */}
          <div
            className="flex-1 min-w-[280px] flex flex-col items-center justify-center p-6 rounded-[20px]"
            style={{
              background: "#EAE7F7",
              border: "1px solid rgba(255,255,255,0.5)",
              filter: "drop-shadow(6px 6px 24px rgba(0,0,0,0.16))",
              minHeight: 223,
            }}
          >
            <div
              className="w-[52px] h-[52px] flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)]"
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Download size={20} className="text-[#1C0087]" />
            </div>
            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <span
                className="text-[16px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Rapport Semestriel
              </span>
              <span
                className="text-[12px] text-[#64748B] px-4"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Le rapport de performance académique est maintenant disponible.
              </span>
            </div>
            <button
              className="mt-4 w-full py-3 rounded-[16px] text-[12px] font-bold text-[#0F172A] text-center"
              style={{
                background: "#FFFFFF",
                boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateFormationModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}