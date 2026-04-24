"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus, MoreVertical, Loader2, X } from "lucide-react";
import EditFormationModal from "@/components/dashboard/EditFormationModal";
import NewSessionModal from "@/components/dashboard/NewSessionModal";
import { api } from "@/lib/api";

type SessionStatus = "draft" | "archive";

interface Session {
  id: string;
  year: string;
  status: SessionStatus;
  candidates: number;
  examDate: string;
  rooms: number;
  academicYear: string;
}

interface StaffMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  online?: boolean;
}

interface ProgramData {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  sessions: Session[];
  staff?: StaffMember[];
  _count: {
    sessions: number;
    staff: number;
  };
}

// Added interface for fetching users from the API
interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

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
  const programId = params?.formationId as string;

  const [program, setProgram] = useState<ProgramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);

  // --- Assign Staff State ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<SystemUser[]>([]);
  const [staffRole, setStaffRole] = useState("CORRECTOR");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Extracted fetch function so it can be called again on success
  const fetchProgramData = useCallback(async () => {
    if (!programId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/formations/${programId}`);
      console.log(response.data);
      if (response.data && response.data.success) {
        setProgram(response.data.data);
      } else {
        setError(response.data.message || "Failed to load program data");
      }
    } catch (err) {
      setError("An error occurred while fetching the data.");
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData]);

  // --- Fetch Users for Assign Modal ---
  useEffect(() => {
    if (!showAssignModal) return;

    const fetchUsers = async () => {
      try {
        setIsFetchingUsers(true);
        setSelectedUserId(""); // Reset selection when role changes
        const response = await api.get(`/api/v1/users?role=${staffRole}`);
        
        // Handle common response structures
        const data = response.data?.data.users || response.data?.users || response.data || [];
        setAvailableUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setAvailableUsers([]);
      } finally {
        setIsFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [showAssignModal, staffRole]);

  // --- Handle Assign Submit ---
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setIsAssigning(true);
      await api.post(`/api/v1/formations/${programId}/staff`, {
        userId: selectedUserId,
        role: staffRole,
      });
      
      setShowAssignModal(false);
      setSelectedUserId("");
      setStaffRole("CORRECTOR");
      fetchProgramData(); // Instantly refresh UI
    } catch (err) {
      console.error("Failed to assign staff:", err);
      alert("Action failed. Please check your connection or permissions.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3014B8]" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-4">
        <p className="text-red-500 font-medium">
          {error || "Program not found"}
        </p>
        <button
          onClick={() => router.push("/dashboard/programs")}
          className="text-[#3014B8] underline"
        >
          Return to Programs
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6 p-8 w-full bg-[#F8F9FA] min-h-screen relative"
      style={{ paddingBottom: 55 }}
    >
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/dashboard/programs")}
        className="flex items-center gap-2 text-[16px] font-bold text-[#0F172A] hover:opacity-70 transition-opacity"
        style={{ fontFamily: "'Google Sans', sans-serif" }}
      >
        <ArrowLeft size={12} />
        Programs
      </button>

      {/* Header Section */}
      <div className="flex flex-row justify-between items-end w-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                program.isActive
                  ? "bg-[#D1FAE5] text-[#047857]"
                  : "bg-red-100 text-red-700"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {program.isActive ? "Active" : "Inactive"}
            </span>
            <span
              className="text-[16px] font-bold text-[#3014B8]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              {program.department}
            </span>
          </div>
          <h1
            className="text-[36px] font-bold text-[#0F172A] leading-[45px]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            {program.name}
          </h1>
          <p
            className="text-[14px] text-[#0F172A]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Department: {program.department} • Code: {program.code}
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
          Edit
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
                  SESSIONS ({program._count.sessions})
                </h3>
                <p
                  className="text-[14px] text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  History and cohort planning
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
                New Session
              </button>
            </div>

            {/* Sessions Table */}
            <div className="flex flex-col w-full">
              {/* Table header */}
              <div className="flex flex-row w-full pb-4 border-b border-[#F1F5F9]">
                {["Year", "Status", "Candidates", "Exam Date", "Rooms"].map(
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
                  ),
                )}
                <div className="w-[72px]" />
              </div>

              {/* Rows */}
              {program.sessions && program.sessions.length > 0 ? (
                program.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-row items-center w-full cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                    style={{ height: 83 }}
                    onClick={() =>
                      router.push(
                        `/dashboard/programs/${program.id}/${session.id}`,
                      )
                    }
                  >
                    <div className="flex-1 px-4">
                      <span
                        className="text-[16px] font-bold text-[#0F172A]"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {session.academicYear}
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
                ))
              ) : (
                <div className="py-8 text-center text-[#64748B]">
                  No sessions found. Create one to get started.
                </div>
              )}
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
                Success Rate
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
                Allocated Budget
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
                ECTS Credits: 180
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
                ASSIGNED STAFF ({program._count.staff})
              </h3>
              <p
                className="text-[12px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Educational team management
              </p>
            </div>

            {/* Staff List */}
            <div className="flex flex-col gap-6 pb-7">
              {program.staff && program.staff.length > 0 ? (
                program.staff.map((member) => (
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
                        {member.user.firstName + " " + member.user.lastName}
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
                ))
              ) : (
                <div className="text-center text-[#64748B] text-sm py-4">
                  No staff members assigned yet.
                </div>
              )}
            </div>

            {/* Divider + Add button */}
            <div className="pt-6 border-t border-[rgba(200,196,215,0.1)] mt-auto">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] text-[14px] font-bold text-[#0F172A] hover:bg-gray-200 transition-colors"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              >
                <Plus size={16} />
                Assign new member
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFormationModal onClose={() => setShowEditModal(false)} />
      )}
      
      {showNewSession && program && (
        <NewSessionModal 
          formationId={program.id}
          programName={program.name}
          onClose={() => setShowNewSession(false)} 
          onSuccess={() => {
            setShowNewSession(false);
            fetchProgramData(); // Refreshes your UI instantly
          }}
        />
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[500px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans relative">
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedUserId("");
              }}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px]">
                Formation Staff
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Assign New Member
              </h2>
            </div>

            <form onSubmit={handleAssignStaff} className="flex flex-col gap-5">
              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Filter By Role
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  disabled={isAssigning}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="COORDINATOR">COORDINATOR</option>
                  <option value="SURVEILLANT">SURVEILLANT</option>
                  <option value="CORRECTOR">CORRECTOR</option>
                  <option value="JURY_MEMBER">JURY_MEMBER</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>

              {/* User Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Select User
                </label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isFetchingUsers || isAssigning}
                >
                  <option value="" disabled>
                    {isFetchingUsers ? "Loading users..." : "Choose a staff member"}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                {!isFetchingUsers && availableUsers.length === 0 && (
                  <p className="text-xs text-rose-500 ml-1 mt-1 font-medium">
                    No users found with this role.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-4 mt-4 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isAssigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedUserId}
                  className="bg-[#3014B8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isAssigning && <Loader2 size={16} className="animate-spin" />}
                  Assign Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}