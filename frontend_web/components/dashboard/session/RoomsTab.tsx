"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Zap, 
  DoorClosed, 
  ListFilter, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  AlertTriangle,
  Loader2,
  X,
  Plus,
  RefreshCcw,
  Edit2,
  UserPlus,
  MinusCircle
} from "lucide-react";

type RoomDetails = {
  id: string;
  name: string;
  capacity?: number;
  floor?: string;
  building?: string;
};

type SessionRoom = {
  id: string;
  status: string;
  usedCapacity?: number;
  room: RoomDetails;
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
      const { data } = await api.get(`/api/v1/sessions/${sessionId}/rooms`);
      setSessionRooms(data?.data || data || []);
    } catch (error) {
      console.error("Error fetching session rooms:", error);
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
      console.error("Error fetching global rooms:", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchFormDependencies = async () => {
    if (!sessionId) return;
    try {
      setIsFormDependenciesLoading(true);
      
      const [staffRes, subjectsRes, specRes] = await Promise.all([
        api.get(`/api/v1/sessions/${sessionId}/staff`),
        api.get(`/api/v1/sessions/${sessionId}/subjects`),
        api.get(`/api/v1/sessions/${sessionId}/specializations`)
      ]);

      const rawStaff = staffRes.data?.data || staffRes.data || [];
      const formattedStaff = rawStaff
        .filter((staffItem: any) => staffItem.function === "SURVEILLANT")
        .map((staffItem: any) => ({
          id: staffItem.user.id,
          name: `${staffItem.user.firstName} ${staffItem.user.lastName}`.trim()
        }));
      setAvailableStaff(formattedStaff);

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
      console.error("Error fetching form dependencies:", error);
    } finally {
      setIsFormDependenciesLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !selectedRoomId || !selectedSpecializationId) return;
    
    try {
      setIsSubmitting(true);
      
      const payload: any = { 
        roomId: selectedRoomId,
        specializationId: selectedSpecializationId 
      };
      
      if (inputUsedCapacity !== "") {
        payload.usedCapacity = Number(inputUsedCapacity);
      }

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
      console.error("Error linking room or assigning surveillants:", error);
      alert("Une erreur est survenue.");
    } finally {
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
      console.error("Error deleting room from session:", error);
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
      
      setSessionRooms(prev => prev.map(r => 
        r.id === editingSessionRoomId ? { ...r, usedCapacity: Number(usedCapacityInput) } : r
      ));
      
      closeEditModal();
    } catch (error) {
      console.error("Error updating capacity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Dedicated Surveillant Assignment Handler
  const handleAssignSurveillant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !assigningSessionRoomId || !assignUserId || !assignSubjectId) return;

    try {
      setIsSubmitting(true);
      await api.post(`/api/v1/sessions/${sessionId}/rooms/${assigningSessionRoomId}/surveillants`, {
        userId: assignUserId,
        subjectId: assignSubjectId
      });
      
      closeAssignModal();
      // Optional: Show a success toast here
    } catch (error) {
      console.error("Error assigning surveillant:", error);
      alert("Erreur lors de l'assignation du surveillant.");
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
      console.error("Error auto-assigning rooms:", error);
      alert("Une erreur est survenue lors de l'assignation automatique.");
    } finally {
      setIsAutoAssigning(false);
    }
  };

  useEffect(() => {
    fetchSessionRooms();
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
    setSurveillantAssignments([]);
  };

  const openEditModal = (sessionRoomId: string, currentCapacity: number | undefined) => {
    setEditingSessionRoomId(sessionRoomId);
    setUsedCapacityInput(currentCapacity ?? 0);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSessionRoomId("");
    setUsedCapacityInput("");
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
    setAssignUserId("");
    setAssignSubjectId("");
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
          <div className="flex-[2]">Nom</div>
          <div className="flex-1">Capacité (Utilisée / Max)</div>
          <div className="flex-1">Étage</div>
          <div className="flex-[1.5]">Bâtiment</div>
          <div className="w-32 text-center">Actions</div>
        </div>

        <div className="flex flex-col min-h-[150px]">
          {isLoading ? (
             <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-[#3014B8]" /></div>
          ) : sessionRooms.length === 0 ? (
             <div className="text-center py-10 text-slate-400 text-sm">Aucune salle sélectionnée.</div>
          ) : (
            sessionRooms.map((sr) => (
              <div key={sr.id} className="flex flex-row items-center px-8 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <div className="flex-[2] flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${sr.status === 'active' ? 'bg-[#10B981]' : 'bg-slate-300'}`} />
                  <span className="text-[15px] font-bold text-[#0F172A]">{sr.room.name}</span>
                </div>
                
                <div className="flex-1 text-[14px] text-slate-500 font-medium">
                  <span className="text-[#3014B8]">{sr.usedCapacity ?? 0}</span> 
                  <span className="mx-1 text-slate-300">/</span> 
                  {sr.room.capacity} pts
                </div>
                
                <div className="flex-1 text-[14px] text-slate-500">{sr.room.floor}</div>
                <div className="flex-[1.5]">
                  <span className="bg-[#F0EEFF] text-[#3014B8] text-[12px] font-bold px-3 py-1 rounded-md">{sr.room.building}</span>
                </div>
                
                <div className="w-32 flex justify-center gap-2">
                  <button 
                    onClick={() => openAssignModal(sr.id)}
                    disabled={actionLoading === sr.id}
                    className="p-2 text-slate-300 hover:text-[#10B981] transition-colors disabled:opacity-30"
                    title="Assigner un surveillant"
                  >
                    <UserPlus size={16} />
                  </button>
                  <button 
                    onClick={() => openEditModal(sr.id, sr.usedCapacity)}
                    disabled={actionLoading === sr.id}
                    className="p-2 text-slate-300 hover:text-[#3014B8] transition-colors disabled:opacity-30"
                    title="Modifier la capacité"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(sr.id)}
                    disabled={actionLoading === sr.id}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30"
                    title="Supprimer la salle"
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

      {/* --- MODALS --- */}

      {/* Add Room Modal (Original Logic) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Ajouter une salle & surveillants</h3>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddRoom} className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Sélectionner la salle *
                  </label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    disabled={isGlobalLoading}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{isGlobalLoading ? "Chargement..." : "-- Sélectionner --"}</option>
                    {globalRooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.building})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Spécialisation *
                  </label>
                  <select
                    required
                    value={selectedSpecializationId}
                    onChange={(e) => setSelectedSpecializationId(e.target.value)}
                    disabled={isFormDependenciesLoading}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{isFormDependenciesLoading ? "Chargement..." : "-- Sélectionner --"}</option>
                    {availableSpecializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Capacité Utilisée (Optionnel)
                </label>
                <input
                  type="number"
                  min="0"
                  value={inputUsedCapacity}
                  onChange={(e) => setInputUsedCapacity(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all"
                  placeholder="Ex: 30"
                />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                    Affecter des surveillants (Optionnel)
                  </label>
                  <button 
                    type="button" 
                    onClick={addAssignmentRow}
                    disabled={isFormDependenciesLoading}
                    className="text-[#3014B8] hover:text-[#250f96] disabled:opacity-50 flex items-center gap-1 text-[13px] font-bold transition-colors"
                  >
                    <UserPlus size={16} /> Ajouter
                  </button>
                </div>
                
                {isFormDependenciesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin text-[#3014B8]" size={20} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {surveillantAssignments.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Aucun surveillant ajouté.</p>
                    ) : (
                      surveillantAssignments.map((assignment, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <select
                            required
                            value={assignment.userId}
                            onChange={(e) => updateAssignment(index, 'userId', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                          >
                            <option value="">-- Surveillant --</option>
                            {availableStaff.map(staff => (
                              <option key={staff.id} value={staff.id}>{staff.name}</option>
                            ))}
                          </select>
                          
                          <select
                            required
                            value={assignment.subjectId}
                            onChange={(e) => updateAssignment(index, 'subjectId', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                          >
                            <option value="">-- Sujet --</option>
                            {availableSubjects.map(subject => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                          </select>

                          <button 
                            type="button" 
                            onClick={() => removeAssignmentRow(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeAddModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500 hover:text-slate-700">Annuler</button>
                <button type="submit" disabled={isSubmitting || !selectedRoomId || !selectedSpecializationId || isFormDependenciesLoading} className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8] hover:bg-[#250f96] disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-[#3014B8]/20">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Confirmer l'affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Capacity Modal (Reverted to original simplicity) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Modifier la capacité</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateCapacity} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Capacité Utilisée
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={usedCapacityInput}
                  onChange={(e) => setUsedCapacityInput(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all"
                  placeholder="Ex: 25"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={closeEditModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500">Annuler</button>
                <button type="submit" disabled={isSubmitting || usedCapacityInput === ""} className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8] hover:bg-[#250f96] disabled:opacity-50 flex items-center gap-2 transition-all">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Assign Surveillant Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Assigner un surveillant</h3>
              <button onClick={closeAssignModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignSurveillant} className="p-6 flex flex-col gap-5">
              {isFormDependenciesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin text-[#3014B8]" size={24} />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                      Surveillant *
                    </label>
                    <select
                      required
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Sélectionner un surveillant --</option>
                      {availableStaff.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                      Sujet *
                    </label>
                    <select
                      required
                      value={assignSubjectId}
                      onChange={(e) => setAssignSubjectId(e.target.value)}
                      className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Sélectionner un sujet --</option>
                      {availableSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button type="button" onClick={closeAssignModal} className="px-5 py-2.5 text-[14px] font-bold text-slate-500">Annuler</button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !assignUserId || !assignSubjectId} 
                      className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Assigner
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}