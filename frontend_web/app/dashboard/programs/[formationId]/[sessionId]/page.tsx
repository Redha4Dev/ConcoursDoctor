"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Filter, Download, AlertCircle, MoreHorizontal } from "lucide-react";
import CandidatesTab from "@/components/dashboard/session/CandidatesTab";
import StaffTab from "@/components/dashboard/session/StaffTab";

type TabType = "Candidats" | "Matières" | "Staff" | "Salles" | "Configuration";

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params?.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("Candidats");

  const TABS: TabType[] = [
    "Candidats",
    "Matières",
    "Staff",
    "Salles",
    "Configuration",
  ];

  return (
    <div className="flex flex-col gap-4 p-8 w-full bg-[#F8F9FA] min-h-screen">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push(`/dashboard/programs/${programId}`)}
        className="flex items-center gap-2 text-[18px] font-bold text-[#0F172A] hover:opacity-70 transition-opacity"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={12} />
        Session
      </button>

      {/* Page Header */}
      <div className="flex flex-row justify-between items-end w-full">
        <div className="flex flex-col">
          <h1
            className="text-[36px] font-bold text-[#0F172A] leading-[45px]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Concours Doctorat Informatique 2025/2026
          </h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-row items-center">
        <div
          className="flex flex-row items-center p-1 rounded-[22px]"
          style={{
            background: "#FFFFFF",
            boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
            backdropFilter: "blur(7.6px)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-[35px] text-[16px] transition-all ${
                activeTab === tab
                  ? "bg-[#F6F6F8] font-normal text-[#3014B8]"
                  : "font-normal text-[#64748B]"
              }`}
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "Candidats" && <CandidatesTab />}
        {activeTab === "Staff" && <StaffTab />}
        {(activeTab === "Matières" ||
          activeTab === "Salles" ||
          activeTab === "Configuration") && (
          <div className="flex items-center justify-center h-64 bg-white rounded-[20px] border border-[rgba(48,20,184,0.1)]">
            <p className="text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              Section {activeTab} — à venir
            </p>
          </div>
        )}
      </div>
    </div>
  );
}