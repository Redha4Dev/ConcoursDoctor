"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Trash2, Loader2, X } from "lucide-react";

interface StaffCard {
  id: string; // Global core user ID used for request payloads
  assignmentId?: string; // Unique primary key of a session staff entry row (if assigned)
  initials: string;
  name: string;
  role: string;
  institution?: string;
}

interface Subject {
  id: string;
  sessionId: string;
  name: string;
  coefficient: number;
  maxGrade: number;
  minimumGrade: number;
  description?: string;
}

const StaffMemberCard = ({
  member,
  onRemove,
  isRemoving,
}: {
  member: StaffCard;
  onRemove?: () => void;
  isRemoving?: boolean;
}) => (
  <div
    className="flex flex-row justify-between items-center p-5 rounded-[12px] bg-white transition-all hover:shadow-md"
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
          <span className="text-[12px] text-[#64748B] uppercase font-medium tracking-wider">
            {member.role}
          </span>
          {member.institution && (
            <>
              <span className="text-[11px] text-[#64748B]">•</span>
              <span className="text-[12px] text-[#64748B] italic">
                {member.institution}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
    {onRemove && (
      <button
        className="p-1.5 rounded-[17px] hover:bg-red-50 transition-colors disabled:opacity-50"
        onClick={onRemove}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 size={16} className="text-[#BA1A1A] animate-spin" />
        ) : (
          <Trash2 size={16} className="text-[#BA1A1A]" />
        )}
      </button>
    )}
  </div>
);

const SectionCard = ({
  title,
  members,
  onAssign,
  onRemove,
  removingId,
}: {
  title: string;
  members: StaffCard[];
  onAssign?: () => void;
  onRemove?: (member: StaffCard) => void;
  removingId?: string | null;
}) => (
  <div
    className="flex flex-col gap-6 p-8 rounded-[20px] bg-white"
    style={{
      border: "1px solid rgba(48,20,184,0.1)",
      boxShadow: "6px 6px 24px rgba(0,0,0,0.08)",
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
        className="flex items-center gap-2 px-4 py-2 rounded-[32px] text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        style={{
          background: "#3014B8",
          fontFamily: "'Google Sans', sans-serif",
        }}
      >
        <Plus size={14} />
        Assign
      </button>
    </div>

    {members.length === 0 ? (
      <p className="text-slate-400 text-sm py-4 text-center italic border border-dashed rounded-xl">
        Aucun membre assigné
      </p>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {members.map((m) => (
          <StaffMemberCard
            key={m.assignmentId || m.id}
            member={m}
            onRemove={onRemove ? () => onRemove(m) : undefined}
            isRemoving={removingId === m.assignmentId || removingId === m.id}
          />
        ))}
      </div>
    )}
  </div>
);

export default function StaffTab() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Data States
  const [assignedStaff, setAssignedStaff] = useState<StaffCard[]>([]);
  const [globalStaff, setGlobalStaff] = useState<StaffCard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<
    "surveillant" | "corrector" | "jury" | "anonymat" | null
  >(null);

  // Form States
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const coordinator: StaffCard = {
    id: "coord-1",
    initials: "MM",
    name: "Malki Mimoun",
    role: "ESI-SBA COORDINATOR",
  };

  // --- API Handlers ---

  const fetchStaffData = async () => {
    if (!sessionId) return;
    try {
      // 1. Fetch unassigned users filtering by role=STAFF from the global route to populate modal dropdown
      const usersRes = await api.get(`/api/v1/users?role=STAFF`);
      const usersList =
        usersRes.data?.data?.users ||
        usersRes.data?.users ||
        usersRes.data?.data ||
        [];

      const mappedGlobalStaff = usersList.map((user: any) => ({
        id: user.id,
        initials: (user.firstName?.[0] || "U") + (user.lastName?.[0] || "S"),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role || "STAFF",
        institution: user.institution,
      }));
      setGlobalStaff(mappedGlobalStaff);

      // 2. Fetch staff members already assigned to this session to update dashboard table lists
      const assignedRes = await api.get(`/api/v1/sessions/${sessionId}/staff`);
      const assignedList = assignedRes.data?.data || assignedRes.data || [];

      const mappedAssignedStaff = assignedList.map((entry: any) => ({
        id: entry.userId || entry.user?.id,
        assignmentId: entry.id,
        initials:
          (entry.user?.firstName?.[0] || "U") +
          (entry.user?.lastName?.[0] || "S"),
        name: entry.user
          ? `${entry.user.firstName} ${entry.user.lastName}`
          : "Unknown User",
        role: entry.function || "STAFF",
        institution: entry.user?.institution,
      }));
      console.log("Mapped assigned staff:", mappedAssignedStaff);
      setAssignedStaff(mappedAssignedStaff);
    } catch (error) {
      console.error("Error fetching staff data configuration:", error);
    }
  };

  const fetchSubjects = async () => {
    if (!sessionId) return;
    try {
      const { data } = await api.get(`/api/v1/sessions/${sessionId}/subjects`);
      const subjectList = data?.data || data || [];
      setSubjects(subjectList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStaffData(), fetchSubjects()]);
      setIsLoading(false);
    };
    loadData();
  }, [sessionId]);

  // Filtering local dashboard displays matching exact backend enums
  const correctors = assignedStaff.filter((s) => s.role === "CORRECTOR");
  const juryMembers = assignedStaff.filter((s) => s.role === "JURY_MEMBER");
  const proctors = assignedStaff.filter((s) => s.role === "SURVEILLANT");
  const anonymatMembers = assignedStaff.filter(
    (s) => s.role === "ANONYMAT_COMITE",
  );

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !selectedUserId || !assignRole) return;

    try {
      setActionLoading("assigning");

      if (assignRole === "surveillant") {
        await api.post(`/api/v1/sessions/${sessionId}/staff`, {
          userId: selectedUserId,
          function: "SURVEILLANT",
        });
      } else if (assignRole === "corrector") {
        if (!selectedSubjectId) {
          alert("Le sujet (matière) est requis pour un correcteur.");
          return;
        }
        await api.post(`/api/v1/sessions/${sessionId}/staff`, {
          userId: selectedUserId,
          function: "CORRECTOR",
          subjectId: selectedSubjectId,
        });
      } else if (assignRole === "jury") {
        await api.post(`/api/v1/sessions/${sessionId}/staff`, {
          userId: selectedUserId,
          function: "JURY_MEMBER",
        });
      } else if (assignRole === "anonymat") {
        await api.post(`/api/v1/sessions/${sessionId}/staff`, {
          userId: selectedUserId,
          function: "ANONYMAT_COMITE",
        });
      }

      await fetchStaffData();
      closeModal();
    } catch (error) {
      console.error(`Error assigning:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (member: StaffCard, role: string) => {
    if (!window.confirm(`Voulez-vous vraiment retirer ${member.name} ?`))
      return;

    try {
      setActionLoading(member.assignmentId || member.id);

      let backendFuncStr = "SURVEILLANT";
      if (role === "corrector") backendFuncStr = "CORRECTOR";
      if (role === "jury") backendFuncStr = "JURY_MEMBER";
      if (role === "anonymat") backendFuncStr = "ANONYMAT_COMITE";

      await api.delete(
        `/api/v1/sessions/${sessionId}/staff/${member.id}/${backendFuncStr}`,
      );

      await fetchStaffData();
    } catch (error) {
      console.error(`Error removing:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (
    role: "surveillant" | "corrector" | "jury" | "anonymat",
  ) => {
    setAssignRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAssignRole(null);
    setSelectedUserId("");
    setSelectedSubjectId("");
  };

  if (isLoading) {
    return (
      <div className="flex w-full py-20 items-center justify-center">
        <Loader2 className="animate-spin text-[#3014B8] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full relative">
      <SectionCard
        title="Anonymity Committee (Comité d'anonymat)"
        members={anonymatMembers}
        onAssign={() => openModal("anonymat")}
        onRemove={(m) => handleRemoveMember(m, "anonymat")}
        removingId={actionLoading}
      />

      <SectionCard
        title="Correctors"
        members={correctors}
        onAssign={() => openModal("corrector")}
        onRemove={(m) => handleRemoveMember(m, "corrector")}
        removingId={actionLoading}
      />

      <SectionCard
        title="Jury Members"
        members={juryMembers}
        onAssign={() => openModal("jury")}
        onRemove={(m) => handleRemoveMember(m, "jury")}
        removingId={actionLoading}
      />

      <SectionCard
        title="Proctors (Surveillants)"
        members={proctors}
        onAssign={() => openModal("surveillant")}
        onRemove={(m) => handleRemoveMember(m, "surveillant")}
        removingId={actionLoading}
      />

      {/* --- Assignment Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A] capitalize">
                Assigner un{" "}
                {assignRole === "surveillant"
                  ? "Surveillant"
                  : assignRole === "anonymat"
                    ? "Membre du Comité d'Anonymat"
                    : assignRole}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAssignSubmit}
              className="p-6 flex flex-col gap-5"
            >
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Sélectionner un membre du staff
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Choisir dans la liste --</option>
                  {globalStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              {assignRole === "corrector" && (
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Sujet / Matière d'examen
                  </label>
                  <select
                    required
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">-- Choisir un sujet --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-[14px] font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "assigning" || !selectedUserId}
                  className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8] hover:bg-[#250f96] disabled:opacity-50 flex items-center gap-2 transition-all shadow-md"
                >
                  {actionLoading === "assigning" && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
