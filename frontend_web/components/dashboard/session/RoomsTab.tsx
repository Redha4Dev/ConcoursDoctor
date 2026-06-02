"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Zap, 
  DoorClosed, 
  Trash2, 
  Loader2, 
  X, 
  Plus, 
  RefreshCcw, 
  Edit2, 
  UserPlus, 
  MinusCircle, 
  ShieldCheck
} from "lucide-react";

type RoomDetails = {
  id: string;
  name: string;
  capacity?: number;
  floor?: string;
  building?: string;
};

type RoomSurveillant = {
  id: string;
  sessionRoomId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: string;
    name: string;
  };
};

type SessionRoom = {
  id: string;
  status: string;
  usedCapacity?: number;
  room: RoomDetails;
  specialization?: {
    id: string;
    formationSpecialization?: {
      name: string;
    };
  };
  roomSurveillants?: RoomSurveillant[];
};

type SurveillantAssignment = {
  userId: string;
  subjectId: string;
};

type SelectOption = {
  id: string;
  name: string;
};

export default function RoomDirectory() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Data States
  const [sessionRooms, setSessionRooms] = useState<SessionRoom[]>([]);
  const [globalRooms, setGlobalRooms] = useState<RoomDetails[]>([]);
  
  // Dynamically Fetched Form Dependencies
  const [availableStaff, setAvailableStaff] = useState<SelectOption[]>([]); 
  const [availableSubjects, setAvailableSubjects] = useState<SelectOption[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<SelectOption[]>([]);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isFormDependenciesLoading, setIsFormDependenciesLoading] = useState(false);

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSpecializationId, setSelectedSpecializationId] = useState("");
  const [inputUsedCapacity, setInputUsedCapacity] = useState<number | "">("");
  const [surveillantAssignments, setSurveillantAssignments] = useState<SurveillantAssignment[]>([]);

  // Edit Capacity Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSessionRoomId, setEditingSessionRoomId] = useState("");
  const [usedCapacityInput, setUsedCapacityInput] = useState<number | "">("");

  // Assign Surveillant Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningSessionRoomId, setAssigningSessionRoomId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");

  // --- API Handlers ---

  const fetchSessionRooms = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      
      // Parallel requests for rooms and staff assignments to construct the matrix mapping
      const [roomsRes, surveillantsRes] = await Promise.all([
        api.get(`/api/v1/sessions/${sessionId}/rooms`),
        api.get(`/api/v1/sessions/${sessionId}/surveillants`)
      ]);

      const roomsData = roomsRes.data?.data || roomsRes.data || [];
      const assignmentsData = surveillantsRes.data?.data || surveillantsRes.data || [];

      // Intersect the sets natively via room ID matching your JSON schema payload
      const mergedRooms = roomsData.map((roomSlot: any) => {
        const matchedSurveillants = assignmentsData.filter(
          (asgn: any) => asgn.sessionRoomId === roomSlot.id
        );
        return {
          ...roomSlot,
          roomSurveillants: matchedSurveillants
        };
      });

      setSessionRooms(mergedRooms);
    } catch (error) {
      console.error("❌ Error merging and fetching session room fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalRooms = async () => {
    try {
      setIsGlobalLoading(true);
      const { data } = await api.get(`/api/v1/rooms`);
      setGlobalRooms(data?.data || data || []);
    } catch (error) {
      console.error("❌ Error fetching global rooms:", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchFormDependencies = async () => {
    if (!sessionId) return;
    try {
      setIsFormDependenciesLoading(true);
      
      const [surveillantsRes, subjectsRes, specRes] = await Promise.all([
        api.get(`/api/v1/sessions/${sessionId}/surveillants`),
        api.get(`/api/v1/sessions/${sessionId}/subjects`),
        api.get(`/api/v1/sessions/${sessionId}/specializations`)
      ]);

      const rawSurveillants = surveillantsRes.data?.data || surveillantsRes.data || [];
      
      // Deduplicate to show clean list options in Form selectors
      const uniqueStaffMap = new Map();
      rawSurveillants.forEach((item: any) => {
        const user = item.user;
        if (user && user.id) {
          uniqueStaffMap.set(user.id, {
            id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim()
          });
        }
      });
      setAvailableStaff(Array.from(uniqueStaffMap.values()));

      const rawSubjects = subjectsRes.data?.data || subjectsRes.data || [];
      const formattedSubjects = rawSubjects.map((sub: any) => ({
        id: sub.id,
        name: sub.name
      }));
      setAvailableSubjects(formattedSubjects);

      const rawSpecs = specRes.data?.data || specRes.data || [];
      const formattedSpecs = rawSpecs.map((s: any) => ({
        id: s.id,
        name: s.formationSpecialization?.name || "Spécialisation inconnue"
      }));
      setAvailableSpecializations(formattedSpecs);

    } catch (error) {
      console.error("❌ Error fetching layout select targets:", error);
    } finally {
      setIsFormDependenciesLoading(false);
    }
  };

const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !selectedRoomId || !selectedSpecializationId) return;
    
    try {
      setIsSubmitting(true);
      const payload: any = { roomId: selectedRoomId, specializationId: selectedSpecializationId };
      if (inputUsedCapacity !== "") payload.usedCapacity = Number(inputUsedCapacity);

      const roomRes = await api.post(`/api/v1/sessions/${sessionId}/rooms`, payload);
      const newSessionRoomId = roomRes.data?.data?.id;

      if (newSessionRoomId && surveillantAssignments.length > 0) {
        const assignmentPromises = surveillantAssignments
          .filter(sa => sa.userId && sa.subjectId)
          .map(sa => 
            api.post(`/api/v1/sessions/${sessionId}/rooms/${newSessionRoomId}/surveillants`, {
              userId: sa.userId,
              subjectId: sa.subjectId
            })
          );
        await Promise.all(assignmentPromises);
      }

      await fetchSessionRooms();
      closeAddModal();
    } catch (error) {
      console.error("❌ Error provisioning room records:", error);
    } finally { // ✅ Fixed the block name here
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (sessionRoomId: string) => {
    if (!window.confirm("Voulez-vous vraiment retirer cette salle de la session ?")) return;
    try {
      setActionLoading(sessionRoomId);
      await api.delete(`/api/v1/sessions/${sessionId}/rooms/${sessionRoomId}`);
      setSessionRooms(prev => prev.filter(r => r.id !== sessionRoomId));
    } catch (error) {
      console.error("❌ Error wiping structural slot configuration:", error);
      fetchSessionRooms();
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !editingSessionRoomId || usedCapacityInput === "") return;
    try {
      setIsSubmitting(true);
      await api.patch(`/api/v1/sessions/${sessionId}/rooms/${editingSessionRoomId}`, {
        usedCapacity: Number(usedCapacityInput)
      });
      await fetchSessionRooms();
      closeEditModal();
    } catch (error) {
      console.error("❌ Error updating storage boundaries:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSurveillant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !assigningSessionRoomId || !assignUserId || !assignSubjectId) return;
    try {
      setIsSubmitting(true);
      await api.post(`/api/v1/sessions/${sessionId}/rooms/${assigningSessionRoomId}/surveillants`, {
        userId: assignUserId,
        subjectId: assignSubjectId
      });
      await fetchSessionRooms();
      closeAssignModal();
    } catch (error) {
      console.error("❌ Failed link structural handler mappings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!sessionId) return;
    try {
      setIsAutoAssigning(true);
      await api.post(`/api/v1/sessions/${sessionId}/rooms/auto-assign`, {});
      await fetchSessionRooms(); 
    } catch (error) {
      console.error("❌ Error deploying algorithmic automation matrices:", error);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionRooms();
      fetchFormDependencies(); 
    }
  }, [sessionId]);

  // --- Modal Helpers ---
  const openAddModal = () => {
    setIsAddModalOpen(true);
    setSurveillantAssignments([]);
    fetchGlobalRooms();
    fetchFormDependencies();
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedRoomId("");
    setSelectedSpecializationId("");
    setInputUsedCapacity("");
  };

  const openEditModal = (sessionRoomId: string, currentCapacity: number | undefined) => {
    setEditingSessionRoomId(sessionRoomId);
    setUsedCapacityInput(currentCapacity ?? 0);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSessionRoomId("");
  };

  const openAssignModal = (sessionRoomId: string) => {
    setAssigningSessionRoomId(sessionRoomId);
    setAssignUserId("");
    setAssignSubjectId("");
    fetchFormDependencies();
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningSessionRoomId("");
  };

  const addAssignmentRow = () => {
    setSurveillantAssignments([...surveillantAssignments, { userId: "", subjectId: "" }]);
  };

  const removeAssignmentRow = (index: number) => {
    setSurveillantAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof SurveillantAssignment, value: string) => {
    setSurveillantAssignments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans relative">
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden flex flex-col">
        <div className="flex flex-row items-center justify-between p-6">
          <h2 className="text-[22px] font-bold text-[#0F172A]">Répertoire des Salles</h2>
          <div className="flex flex-row items-center gap-4">
            <button 
              onClick={handleAutoAssign}
              disabled={isAutoAssigning}
              className="flex items-center gap-2 bg-transparent border-2 border-[#3014B8] text-[#3014B8] hover:bg-[#3014B8]/5 transition-colors px-5 py-2 rounded-full text-[14px] font-bold disabled:opacity-50"
            >
              {isAutoAssigning ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Auto-assign
            </button>
            <button onClick={openAddModal} className="flex items-center gap-2 bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-5 py-2.5 rounded-full text-[14px] font-bold">
              <Plus size={16} />
              Ajouter une salle
            </button>
          </div>
        </div>

        <div className="flex flex-row items-center bg-[#F8F9FA] px-8 py-4 border-y border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex-[2.5]">Nom & Détails</div>
          <div className="flex-1">Capacité (Utilisée / Max)</div>
          <div className="flex-1">Étage</div>
          <div className="flex-[1.2]">Bâtiment</div>
          <div className="w-32 text-center">Actions</div>
        </div>

        <div className="flex flex-col min-h-[150px]">
          {isLoading ? (
             <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-[#3014B8]" /></div>
          ) : sessionRooms.length === 0 ? (
             <div className="text-center py-10 text-slate-400 text-sm">Aucune salle sélectionnée.</div>
          ) : (
            sessionRooms.map((sr) => (
              <div key={sr.id} className="flex flex-row items-start md:items-center px-8 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                
                <div className="flex-[2.5] flex flex-col justify-center gap-1.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]" />
                    <span className="text-[15px] font-bold text-[#0F172A]">{sr.room?.name}</span>
                    {sr.specialization?.formationSpecialization?.name && (
                      <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md tracking-wide">
                        {sr.specialization.formationSpecialization.name}
                      </span>
                    )}
                  </div>

                  {/* 🟢 Live Mapped Surveillants and Subject Fields */}
                  {sr.roomSurveillants && sr.roomSurveillants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {sr.roomSurveillants.map((rs) => (
                        <div 
                          key={rs.id} 
                          className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                        >
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>{rs.user?.firstName} {rs.user?.lastName}</span>
                          <span className="text-emerald-400 mx-0.5">|</span>
                          <span className="text-emerald-600/80 font-normal italic uppercase tracking-wider">{rs.subject?.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 pl-5 italic font-medium">Aucun surveillant assigné</span>
                  )}
                </div>
                
                <div className="flex-1 text-[14px] text-slate-500 font-medium pt-1 md:pt-0">
                  <span className="text-[#3014B8] font-bold">{sr.usedCapacity ?? 0}</span> 
                  <span className="mx-1 text-slate-300">/</span> 
                  {sr.room?.capacity || "—"} pts
                </div>
                
                <div className="flex-1 text-[14px] text-slate-500 pt-1 md:pt-0">{sr.room?.floor || "—"}</div>
                
                <div className="flex-[1.2] pt-1 md:pt-0">
                  <span className="bg-[#F0EEFF] text-[#3014B8] text-[12px] font-bold px-3 py-1 rounded-md">{sr.room?.building || "—"}</span>
                </div>
                
                <div className="w-32 flex justify-center gap-2 pt-1 md:pt-0">
                  <button 
                    onClick={() => openAssignModal(sr.id)}
                    className="p-2 text-slate-300 hover:text-[#10B981] transition-colors"
                    title="Assigner un surveillant"
                  >
                    <UserPlus size={16} />
                  </button>
                  <button 
                    onClick={() => openEditModal(sr.id, sr.usedCapacity)}
                    className="p-2 text-slate-300 hover:text-[#3014B8] transition-colors"
                    title="Modifier la capacité"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(sr.id)}
                    disabled={actionLoading === sr.id}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    {actionLoading === sr.id ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-row gap-6 w-full">
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F0EEFF] flex items-center justify-center text-[#3014B8]"><DoorClosed size={20} /></div>
          <div>
            <p className="text-[20px] font-bold text-[#0F172A]">{sessionRooms.length}</p>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase">Salles Actuelles</h3>
          </div>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Ajouter une salle & surveillants</h3>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddRoom} className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Sélectionner la salle *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]"
                  >
                    <option value="">-- Sélectionner --</option>
                    {globalRooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.building})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Spécialisation *</label>
                  <select
                    required
                    value={selectedSpecializationId}
                    onChange={(e) => setSelectedSpecializationId(e.target.value)}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]"
                  >
                    <option value="">-- Sélectionner --</option>
                    {availableSpecializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Capacité Utilisée</label>
                <input
                  type="number"
                  value={inputUsedCapacity}
                  onChange={(e) => setInputUsedCapacity(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]"
                  placeholder="Ex: 30"
                />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[12px] font-bold text-slate-500 uppercase">Affecter des surveillants</label>
                  <button type="button" onClick={addAssignmentRow} className="text-[#3014B8] flex items-center gap-1 text-[13px] font-bold">
                    <UserPlus size={16} /> Ajouter
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {surveillantAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <select
                        required
                        value={assignment.userId}
                        onChange={(e) => updateAssignment(index, 'userId', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px]"
                      >
                        <option value="">-- Surveillant --</option>
                        {availableStaff.map(staff => <option key={staff.id} value={staff.id}>{staff.name}</option>)}
                      </select>
                      
                      <select
                        required
                        value={assignment.subjectId}
                        onChange={(e) => updateAssignment(index, 'subjectId', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px]"
                      >
                        <option value="">-- Sujet --</option>
                        {availableSubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                      </select>

                      <button type="button" onClick={() => removeAssignmentRow(index)} className="text-slate-400 hover:text-red-500"><MinusCircle size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeAddModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8]">
                  Confirmer l'affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CAPACITY MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Modifier la capacité</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateCapacity} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Capacité Utilisée</label>
                <input
                  type="number"
                  required
                  value={usedCapacityInput}
                  onChange={(e) => setUsedCapacityInput(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8]">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN SURVEILLANT MODAL --- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Assigner un surveillant</h3>
              <button onClick={closeAssignModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignSurveillant} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Surveillant *</label>
                <select required value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]">
                  <option value="">-- Sélectionner un surveillant --</option>
                  {availableStaff.map(staff => <option key={staff.id} value={staff.id}>{staff.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase">Sujet *</label>
                <select required value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px]">
                  <option value="">-- Sélectionner un sujet --</option>
                  {availableSubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={closeAssignModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#10B981]">Assigner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}