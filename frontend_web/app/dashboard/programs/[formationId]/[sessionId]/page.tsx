"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CandidatesTab from "@/components/dashboard/session/CandidatesTab";
import StaffTab from "@/components/dashboard/session/StaffTab";
import SubjectsPage from "@/components/dashboard/session/SubjectTab";
import RoomDirectory from "@/components/dashboard/session/RoomsTab";
import ExamSettings from "@/components/dashboard/session/SettingsTab";

// Tab type translations
type TabType = "Candidates" | "Subjects" | "Staff" | "Rooms" | "Settings";

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params?.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("Candidates");

  const TABS: TabType[] = [
    "Candidates",
    "Subjects",
    "Staff",
    "Rooms",
    "Settings",
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
            Computer Science PhD Entrance Exam 2025/2026
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
        {activeTab === "Candidates" && <CandidatesTab />}
        {activeTab === "Staff" && <StaffTab />}
        {activeTab === "Subjects" && <SubjectsPage />} 
          {activeTab === "Rooms" && <RoomDirectory />} 
          {activeTab === "Settings" && <ExamSettings />}
          {/* {(activeTab === "Settings") && (
          <div className="flex items-center justify-center h-64 bg-white rounded-[20px] border border-[rgba(48,20,184,0.1)]">
            <p className="text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              {activeTab} Section — coming soon
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
}