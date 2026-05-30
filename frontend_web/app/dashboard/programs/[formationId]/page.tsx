"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Save, CirclePlus, MoreVertical, Loader2, X, List, Pencil as EditIcon, Trash2 } from "lucide-react";
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

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// NEW
interface Specialization {
  id: string;
  formationId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
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

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<SystemUser[]>([]);
  const [staffRole, setStaffRole] = useState("CORRECTOR");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [isLoading2, setIsLoading2] = useState(false);
  const [specializationName, setSpecializationName] = useState("");
  const [specializationCode, setSpecializationCode] = useState("");

  // NEW
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);

  const [showEditSpecModal, setShowEditSpecModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specialization | null>(null);
  const [editSpecName, setEditSpecName] = useState("");
  const [editSpecIsActive, setEditSpecIsActive] = useState(true);
  const [isUpdatingSpec, setIsUpdatingSpec] = useState(false);
  const [isDeletingSpecId, setIsDeletingSpecId] = useState<string | null>(null);


  const updateSpecialization = async () => {
    if (!editingSpec) return;
    try {
      setIsUpdatingSpec(true);
      const response = await api.patch(
        `/api/v1/formations/${programId}/specializations/${editingSpec.id}`,
        { name: editSpecName, isActive: editSpecIsActive }
      );
      if (response.data?.success) {
        setShowEditSpecModal(false);
        setEditingSpec(null);
        fetchSpecializations();
      }
    } catch (error) {
      console.error("Failed to update specialization:", error);
    } finally {
      setIsUpdatingSpec(false);
    }
  };

  const deleteSpecialization = async (specId: string) => {
    try {
      setIsDeletingSpecId(specId);
      const response = await api.delete(
        `/api/v1/formations/${programId}/specializations/${specId}`
      );
      if (response.data?.success) {
        fetchSpecializations();
      }
    } catch (error) {
      console.error("Failed to delete specialization:", error);
    } finally {
      setIsDeletingSpecId(null);
    }
  };
  // NEW
  const fetchSpecializations = useCallback(async () => {
    if (!programId) return;
    try {
      setIsLoadingSpecs(true);
      const response = await api.get(`/api/v1/formations/${programId}/specializations`);
      if (response.data?.success) {
        setSpecializations(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch specializations:", err);
    } finally {
      setIsLoadingSpecs(false);
    }
  }, [programId]);

  const addSpecialization = async () => {
    try {
      setIsLoading2(true);
      const response = await api.post(`/api/v1/formations/${programId}/specializations`, {
        name: specializationName,
        code: specializationCode,
      });
      if (response.data && response.data.success) {
        setSpecializationName("");
        setSpecializationCode("");
        fetchSpecializations(); // NEW — refresh list immediately
      }
    } catch (error) {
      console.error("Failed to add specialization:", error);
    } finally {
      setIsLoading2(false);
    }
  };

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
    fetchSpecializations(); // NEW
  }, [fetchProgramData, fetchSpecializations]);

  useEffect(() => {
    if (!showAssignModal) return;
    const fetchUsers = async () => {
      try {
        setIsFetchingUsers(true);
        setSelectedUserId("");
        const response = await api.get(`/api/v1/users?role=${staffRole}`);
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
      fetchProgramData();
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
        <p className="text-red-500 font-medium">{error || "Program not found"}</p>
        <button onClick={() => router.push("/dashboard/programs")} className="text-[#3014B8] underline">
          Return to Programs
        </button>
      </div>
    );
  }

  const activeCount = specializations.filter((s) => s.isActive).length;

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
                program.isActive ? "bg-[#D1FAE5] text-[#047857]" : "bg-red-100 text-red-700"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {program.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-[16px] font-bold text-[#3014B8]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              {program.department}
            </span>
          </div>
          <h1 className="text-[36px] font-bold text-[#0F172A] leading-[45px]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            {program.name}
          </h1>
          <p className="text-[14px] text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            Department: {program.department} • Code: {program.code}
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-[32px] text-white text-[14px] font-bold"
          style={{ background: "linear-gradient(111.37deg, #1C0087 0%, #3014B8 100%)", fontFamily: "'Google Sans', sans-serif" }}
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {/* Main Content */}
      <div className="relative w-full" style={{ minHeight: 567 }}>
        <div className="absolute flex flex-col gap-8 w-full" style={{ left: 0, right: 330, top: 16 }}>

          {/* Specialization Section */}
          <div className="flex flex-col gap-0 rounded-[12px] overflow-hidden w-full px-6"
          >
            {/* ── Creation card ── */}
            <div className="flex flex-col p-6 gap-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-[12px] bg-white">
              {/* Header */}
              <div className="w-full flex flex-row items-center p-0 h-10">
                <div className="flex items-center justify-center w-10 h-10 bg-[#E3DFFF] rounded-[8px] mr-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <CirclePlus size={20} className="text-[#190082]" />
                  </div>
                </div>
                <h3 className="flex items-center text-[20px] font-semibold text-[#191C1D] leading-7">
                  Add a Specialization
                </h3>
              </div>

              {/* Inputs */}
              <div className="w-full flex flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="pl-1 text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
                    NAME OF THE SPECIALIZATION
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Intelligence Artificielle"
                    value={specializationName}
                    onChange={(e) => setSpecializationName(e.target.value)}
                    className="w-full h-10 px-4 py-2 bg-[#F8F9FA] border border-[#C8C4D6] rounded-[8px] text-[14px] font-normal text-[#191C1D] placeholder-[#6B7280] outline-none"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="pl-1 text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
                    UNIQUE CODE
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: IA-2026"
                    value={specializationCode}
                    onChange={(e) => setSpecializationCode(e.target.value)}
                    className="w-full h-10 px-4 py-2 bg-[#F8F9FA] border border-[#C8C4D6] rounded-[8px] text-[14px] font-normal text-[#191C1D] placeholder-[#6B7280] outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="w-full flex justify-end mt-2">
                <button
                  className="flex flex-row items-center justify-center gap-2 w-[263px] h-10 px-8 bg-[#5E39E0] rounded-[8px] text-white font-semibold text-[16px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all"
                  onClick={addSpecialization}
                  disabled={isLoading2 || !specializationName || !specializationCode}
                  style={{ opacity: isLoading2 || !specializationName || !specializationCode ? 0.6 : 1, cursor: isLoading2 || !specializationName || !specializationCode ? "not-allowed" : "pointer" }}
                >
                  {isLoading2 ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                  <span>Add Specialization</span>
                </button>
              </div>
            </div>

            {/* ── Listing section ── */}
            <div className="flex flex-col gap-0 mt-12 rounded-[12px] overflow-hidden w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] bg-white">
              {/* List header */}
              <div
                className="flex flex-row justify-between items-center px-8 py-6"
                style={{ borderBottom: "1px solid #C8C4D6" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-[18px] h-[16px]">
                    <List size={16} className="text-[#5E39E0]" />
                  </div>
                  <span className="text-[20px] font-semibold text-[#191C1D]">
                    Specializations
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Active badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[12px] font-semibold text-[#15803D] tracking-[0.6px]">
                      {activeCount} Active
                    </span>
                  </div>
                  {/* Total */}
                  <span className="text-[14px] text-[#474554]">
                    {specializations.length} total
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="flex flex-col w-full overflow-auto" style={{ maxHeight: 310 }}>
                {/* Table header row */}
                <div className="flex flex-row w-full bg-[#F3F4F5] sticky top-0">
                  <div className="flex-[3] px-8 py-3">
                    <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">Name</span>
                  </div>
                  <div className="flex-[2] px-8 py-3">
                    <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">Code</span>
                  </div>
                  <div className="flex-[2] px-8 py-3">
                    <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">Created At</span>
                  </div>
                  <div className="flex-[1] px-8 py-3 flex justify-center">
                    <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">Status</span>
                  </div>
                  <div className="flex-[1] px-8 py-3 flex justify-end">
                    <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">Actions</span>
                  </div>
                </div>

                {/* Body */}
                {isLoadingSpecs ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={20} className="animate-spin text-[#5E39E0]" />
                  </div>
                ) : specializations.length === 0 ? (
                  <div className="py-10 text-center text-[14px] text-[#474554]">
                    No specializations yet. Add one above.
                  </div>
                ) : (
                  specializations.map((spec, index) => (
                    <div
                      key={spec.id}
                      className="flex flex-row items-center w-full hover:bg-[#F8F9FA] transition-colors"
                      style={{
                        borderTop: index === 0 ? "none" : "1px solid rgba(200, 196, 214, 0.3)",
                        minHeight: 72,
                      }}
                    >
                      {/* Name */}
                      <div className="flex-[3] px-8 py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-[rgba(227,223,255,0.3)]">
                          <CirclePlus size={16} className="text-[#190082]" />
                        </div>
                        <span className="text-[14px] font-semibold text-[#191C1D]">{spec.name}</span>
                      </div>
                      {/* Code */}
                      <div className="flex-[2] px-8 py-4">
                        <span className="text-[14px] text-[#474554]">{spec.code}</span>
                      </div>
                      {/* Created At */}
                      <div className="flex-[2] px-8 py-4">
                        <span className="text-[14px] text-[#474554]">
                          {new Date(spec.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {/* Status */}
                      <div className="flex-[1] px-8 py-4 flex justify-center">
                        {spec.isActive ? (
                          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[10px] font-bold text-[#15803D] uppercase tracking-[-0.25px]">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#FEF9C3] text-[10px] font-bold text-[#A16207] uppercase tracking-[-0.25px]">
                            Inactive
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                        <div className="flex-[1] px-8 py-4 flex justify-end items-center gap-2">
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F5] transition-colors"
                            onClick={() => {
                              setEditingSpec(spec);
                              setEditSpecName(spec.name);
                              setEditSpecIsActive(spec.isActive);
                              setShowEditSpecModal(true);
                            }}
                          >
                            <EditIcon size={15} className="text-[#474554]" />
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors disabled:opacity-40"
                            disabled={isDeletingSpecId === spec.id}
                            onClick={() => deleteSpecialization(spec.id)}
                          >
                            {isDeletingSpecId === spec.id
                              ? <Loader2 size={13} className="animate-spin text-red-400" />
                              : <Trash2 size={13} className="text-[#474554] hover:text-red-500 transition-colors" />
                            }
                          </button>
                        </div>
                    </div>
                  ))
                )}

                {/* Table footer */}
                {specializations.length > 0 && (
                  <div
                    className="flex flex-row justify-between items-center px-8 py-3 bg-[#F3F4F5] sticky bottom-0"
                  >
                    <span className="text-[12px] font-semibold text-[#474554] tracking-[0.6px]">
                      Showing {specializations.length} specialization{specializations.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#190082] tracking-[0.6px]">
                        {activeCount} active
                      </span>
                      <span className="text-[12px] text-[#C8C4D6]">|</span>
                      <span className="text-[12px] font-semibold text-[#190082] tracking-[0.6px]">
                        {specializations.length - activeCount} inactive
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions Section */}
          <div
            className="flex flex-col p-8 gap-8 rounded-[20px] bg-white"
            style={{ border: "1px solid rgba(48,20,184,0.1)", boxShadow: "6px 6px 24px rgba(0,0,0,0.16)", backdropFilter: "blur(7.6px)" }}
          >
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-bold text-[#191C1E]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  SESSIONS ({program._count.sessions})
                </h3>
                <p className="text-[14px] text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  History and cohort planning
                </p>
              </div>
              <button
                onClick={() => setShowNewSession(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-[32px] text-[14px] font-bold text-[#1C0087]"
                style={{ background: "rgba(48,20,184,0.1)", fontFamily: "'Google Sans', sans-serif" }}
              >
                <Plus size={14} className="text-[#1C0087]" />
                New Session
              </button>
            </div>

            <div className="flex flex-col w-full">
              <div className="flex flex-row w-full pb-4 border-b border-[#F1F5F9]">
                {["Year", "Status", "Candidates", "Exam Date", "Rooms"].map((h, i) => (
                  <div key={h} className={`flex-1 px-4 pb-1 ${i === 2 || i === 4 ? "text-center" : ""}`}>
                    <span className="text-[14px] font-bold text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>{h}</span>
                  </div>
                ))}
                <div className="w-[72px]" />
              </div>

              {program.sessions && program.sessions.length > 0 ? (
                program.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-row items-center w-full cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                    style={{ height: 83 }}
                    onClick={() => router.push(`/dashboard/programs/${program.id}/${session.id}`)}
                  >
                    <div className="flex-1 px-4">
                      <span className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>{session.academicYear}</span>
                    </div>
                    <div className="flex-1 px-4"><SessionStatusBadge status={session.status} /></div>
                    <div className="flex-1 px-4 flex justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                        <span className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>{session.candidates}</span>
                      </div>
                    </div>
                    <div className="flex-1 px-4 pl-8">
                      <span className="text-[16px] text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>{session.examDate}</span>
                    </div>
                    <div className="flex-1 px-4 flex justify-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                        <span className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>{session.rooms}</span>
                      </div>
                    </div>
                    <div className="w-[72px] flex justify-end pr-4">
                      <button className="p-2 hover:bg-gray-100 rounded"><MoreVertical size={16} className="text-[#94A3B8]" /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#64748B]">No sessions found. Create one to get started.</div>
              )}
            </div>
          </div>

          {/* Stats Teaser Cards */}
          <div className="relative w-full" style={{ height: 128 }}>
            <div className="absolute flex flex-col gap-1 p-6 rounded-[12px]"
              style={{ left: 0, right: "70%", top: 0, height: 125, background: "#3014B8", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "6px 6px 24px rgba(0,0,0,0.16)", backdropFilter: "blur(7.6px)" }}
            >
              <span className="text-[14px] text-white opacity-70" style={{ fontFamily: "'Google Sans', sans-serif" }}>Success Rate</span>
              <span className="text-[24px] font-bold text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>84%</span>
              <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]">
                <div className="h-full rounded-full bg-white" style={{ width: "84%" }} />
              </div>
            </div>
            <div className="absolute flex flex-col gap-1 p-6 rounded-[12px] bg-white"
              style={{ left: "35%", right: "35%", top: 0, height: 125, border: "1px solid rgba(48,20,184,0.1)", boxShadow: "6px 6px 24px rgba(0,0,0,0.16)", backdropFilter: "blur(7.6px)" }}
            >
              <span className="text-[14px] text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>Allocated Budget</span>
              <span className="text-[24px] font-bold text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>12k€</span>
              <span className="text-[10px] font-semibold text-[#059669] pt-1" style={{ fontFamily: "'Inter', sans-serif" }}>+4% vs 2024</span>
            </div>
            <div className="absolute flex flex-col gap-1 p-6 rounded-[12px] bg-white"
              style={{ left: "70%", right: 0, top: 0, height: 125, border: "1px solid rgba(48,20,184,0.1)", boxShadow: "6px 6px 24px rgba(0,0,0,0.16)", backdropFilter: "blur(7.6px)" }}
            >
              <span className="text-[14px] text-[#64748B]" style={{ fontFamily: "'Google Sans', sans-serif" }}>Modules</span>
              <span className="text-[24px] font-bold text-[#0F172A]" style={{ fontFamily: "'Google Sans', sans-serif" }}>12</span>
              <span className="text-[10px] text-[#474555] pt-1" style={{ fontFamily: "'Inter', sans-serif" }}>ECTS Credits: 180</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && <EditFormationModal onClose={() => setShowEditModal(false)} />}

      {showNewSession && program && (
        <NewSessionModal
          formationId={program.id}
          programName={program.name}
          onClose={() => setShowNewSession(false)}
          onSuccess={() => { setShowNewSession(false); fetchProgramData(); }}
        />
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[500px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans relative">
            <button onClick={() => { setShowAssignModal(false); setSelectedUserId(""); }} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <div className="mb-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px]">Formation Staff</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Assign New Member</h2>
            </div>
            <form onSubmit={handleAssignStaff} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Filter By Role</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} disabled={isAssigning}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="COORDINATOR">COORDINATOR</option>
                  <option value="SURVEILLANT">SURVEILLANT</option>
                  <option value="CORRECTOR">CORRECTOR</option>
                  <option value="JURY_MEMBER">JURY_MEMBER</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Select User</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} disabled={isFetchingUsers || isAssigning}>
                  <option value="" disabled>{isFetchingUsers ? "Loading users..." : "Choose a staff member"}</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</option>
                  ))}
                </select>
                {!isFetchingUsers && availableUsers.length === 0 && (
                  <p className="text-xs text-rose-500 ml-1 mt-1 font-medium">No users found with this role.</p>
                )}
              </div>
              <div className="flex justify-end items-center gap-4 mt-4 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => setShowAssignModal(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors" disabled={isAssigning}>Cancel</button>
                <button type="submit" disabled={isAssigning || !selectedUserId} className="bg-[#3014B8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2">
                  {isAssigning && <Loader2 size={16} className="animate-spin" />}
                  Assign Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditSpecModal && editingSpec && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-[32px] w-full max-w-[480px] p-8 shadow-2xl relative">
      <button
        onClick={() => { setShowEditSpecModal(false); setEditingSpec(null); }}
        className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={20} />
      </button>

      <div className="mb-8">
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px]">
          Specialization
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Edit Specialization</h2>
      </div>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Name</label>
          <input
            type="text"
            value={editSpecName}
            onChange={(e) => setEditSpecName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
            disabled={isUpdatingSpec}
          />
        </div>

        {/* Code — read-only */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Code (read-only)</label>
          <input
            type="text"
            value={editingSpec.code}
            readOnly
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed outline-none"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Active</span>
          <button
            type="button"
            onClick={() => setEditSpecIsActive((v) => !v)}
            disabled={isUpdatingSpec}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              editSpecIsActive ? "bg-[#5E39E0]" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                editSpecIsActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-4 mt-2 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => { setShowEditSpecModal(false); setEditingSpec(null); }}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isUpdatingSpec}
          >
            Cancel
          </button>
          <button
            onClick={updateSpecialization}
            disabled={isUpdatingSpec || !editSpecName.trim()}
            className="bg-[#3014B8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isUpdatingSpec && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}