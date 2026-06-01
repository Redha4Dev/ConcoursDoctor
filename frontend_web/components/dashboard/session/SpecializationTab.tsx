"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CirclePlus,
  EditIcon,
  Trash2,
  List,
  Loader2,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Specialization {
  id: string;
  formationId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

interface SessionSpecialization {
  id: string;
  sessionId: string;
  formationSpecializationId: string;
  availableSlots: number;
  waitingListSlots: number;
  formationSpecialization: {
    id: string;
    formationId: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: string;
  };
  _count: { candidates: number };
}

interface Props {
  programId: string;
  sessionId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpecializationTab({ programId, sessionId }: Props) {
    programId = useParams().formationId as string;
    sessionId = useParams().sessionId as string;
  // ── Formation specializations (source list for the dropdown) ───────────────
  const [formationSpecs, setFormationSpecs] = useState<Specialization[]>([]);
  const [isLoadingFormationSpecs, setIsLoadingFormationSpecs] = useState(false);

  // ── Session specializations ────────────────────────────────────────────────
  const [sessionSpecs, setSessionSpecs] = useState<SessionSpecialization[]>([]);
  const [isLoadingSessionSpecs, setIsLoadingSessionSpecs] = useState(false);

  // ── Add form ───────────────────────────────────────────────────────────────
  const [selectedFormationSpecId, setSelectedFormationSpecId] = useState("");
  const [availableSlots, setAvailableSlots] = useState(10);
  const [waitingListSlots, setWaitingListSlots] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editingSessionSpec, setEditingSessionSpec] = useState<SessionSpecialization | null>(null);
  const [editSessionSlots, setEditSessionSlots] = useState(0);
  const [editWaitingListSlots, setEditWaitingListSlots] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  // Only show active formation specs not already added to this session
  const availableForSession = formationSpecs.filter(
    (s) =>
      s.isActive &&
      !sessionSpecs.some((ss) => ss.formationSpecializationId === s.id)
  );

  // ── Fetch formation specializations ───────────────────────────────────────
  const fetchFormationSpecs = useCallback(async () => {
    if (!programId) {
        console.log("No program ID provided, skipping fetchFormationSpecs");
        return;
    }
    try {
      setIsLoadingFormationSpecs(true);
      const response = await api.get(
        `/api/v1/formations/${programId}/specializations`
      );
      if (response.data?.success) setFormationSpecs(response.data.data);
    } catch (err) {
      console.error("Failed to fetch formation specializations:", err);
    } finally {
      setIsLoadingFormationSpecs(false);
    }
  }, [programId]);

  // ── Fetch session specializations ──────────────────────────────────────────
  const fetchSessionSpecs = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoadingSessionSpecs(true);
      const response = await api.get(
        `/api/v1/sessions/${sessionId}/specializations`
      );
      if (response.data?.success) setSessionSpecs(response.data.data);
      console.log("Fetched session specializations:", response.data.data);
    } catch (err) {
      console.error("Failed to fetch session specializations:", err);
    } finally {
      setIsLoadingSessionSpecs(false);
    }
  }, [sessionId]);

  // ── Add specialization to session ──────────────────────────────────────────
  const addSessionSpecialization = async () => {
    if (!selectedFormationSpecId) return;
    try {
      setIsAdding(true);
      const response = await api.post(
        `/api/v1/sessions/${sessionId}/specializations`,
        { 
          formationSpecializationId: selectedFormationSpecId, 
          availableSlots,
          waitingListSlots 
        }
      );
      if (response.data?.success) {
        setSelectedFormationSpecId("");
        setAvailableSlots(10);
        setWaitingListSlots(0);
        fetchSessionSpecs();
      }
    } catch (err) {
      console.error("Failed to add specialization to session:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // ── Update session specialization slots ────────────────────────────────────
  const updateSessionSpecialization = async () => {
    if (!editingSessionSpec) return;
    try {
      setIsUpdating(true);
      const response = await api.patch(
        `/api/v1/sessions/${sessionId}/specializations/${editingSessionSpec.id}`,
        { 
          availableSlots: editSessionSlots,
          waitingListSlots: editWaitingListSlots
        }
      );
      if (response.data?.success) {
        setEditingSessionSpec(null);
        fetchSessionSpecs();
      }
    } catch (err) {
      console.error("Failed to update session specialization:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Remove specialization from session ─────────────────────────────────────
  const deleteSessionSpecialization = async (specId: string) => {
    console.log(`Deleting session specialization: ${specId}`);
    try {
      setIsDeletingId(specId);
      const response = await api.delete(
        `/api/v1/sessions/${sessionId}/specializations/${specId}`
      );
      if (response.data?.success) fetchSessionSpecs();
    } catch (err) {
      console.error("Failed to remove specialization from session:", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFormationSpecs();
    fetchSessionSpecs();
  }, [fetchFormationSpecs, fetchSessionSpecs]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full">

      {/* ── Add to session card ── */}
      <div className="flex flex-col p-6 gap-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-[12px] bg-white">
        <div className="flex flex-row items-center h-10">
          <div className="flex items-center justify-center w-10 h-10 bg-[#E3DFFF] rounded-[8px] mr-4">
            <Plus size={20} className="text-[#190082]" />
          </div>
          <h3 className="text-[20px] font-semibold text-[#191C1D] leading-7">
            Add Specialization to Session
          </h3>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-4">
          {/* Specialization dropdown */}
          <div className="flex-[2] flex flex-col gap-1.5">
            <label className="pl-1 text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
              Specialization
            </label>
            <div className="relative">
              <select
                value={selectedFormationSpecId}
                onChange={(e) => setSelectedFormationSpecId(e.target.value)}
                disabled={isLoadingFormationSpecs}
                className="w-full h-10 px-4 pr-10 bg-[#F8F9FA] border border-[#C8C4D6] rounded-[8px] text-[14px] text-[#191C1D] outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingFormationSpecs
                    ? "Loading…"
                    : availableForSession.length === 0
                    ? "No specializations available"
                    : "Select a specialization…"}
                </option>
                {availableForSession.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#474554] pointer-events-none"
              />
            </div>
            {!isLoadingFormationSpecs && availableForSession.length === 0 && formationSpecs.length > 0 && (
              <p className="text-[11px] text-amber-600 ml-1 mt-0.5">
                All active specializations have already been added to this session.
              </p>
            )}
          </div>

          {/* Available slots */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="pl-1 text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
              Available Slots
            </label>
            <input
              type="number"
              min={1}
              value={availableSlots}
              onChange={(e) => setAvailableSlots(Math.max(1, Number(e.target.value)))}
              className="w-full h-10 px-4 bg-[#F8F9FA] border border-[#C8C4D6] rounded-[8px] text-[14px] text-[#191C1D] outline-none"
            />
          </div>

          {/* Waiting list slots */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="pl-1 text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
              Waiting List Slots
            </label>
            <input
              type="number"
              min={0}
              value={waitingListSlots}
              onChange={(e) => setWaitingListSlots(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-4 bg-[#F8F9FA] border border-[#C8C4D6] rounded-[8px] text-[14px] text-[#191C1D] outline-none"
            />
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={addSessionSpecialization}
            disabled={isAdding || !selectedFormationSpecId}
            className="flex flex-row items-center justify-center gap-2 w-[263px] h-10 px-8 bg-[#5E39E0] rounded-[8px] text-white font-semibold text-[16px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
            <span>Add to Session</span>
          </button>
        </div>
      </div>

      {/* ── Session specializations list ── */}
      <div className="flex flex-col rounded-[12px] overflow-hidden w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] bg-white">
        {/* Header */}
        <div
          className="flex flex-row justify-between items-center px-8 py-6"
          style={{ borderBottom: "1px solid #C8C4D6" }}
        >
          <div className="flex items-center gap-3">
            <List size={16} className="text-[#5E39E0]" />
            <span className="text-[20px] font-semibold text-[#191C1D]">
              Session Specializations
            </span>
          </div>
          <span className="text-[14px] text-[#474554]">
            {sessionSpecs.length} total
          </span>
        </div>

        <div className="flex flex-col w-full overflow-auto" style={{ maxHeight: 310 }}>
          {/* Table header */}
          <div className="flex flex-row w-full bg-[#F3F4F5] sticky top-0">
            {[
              { label: "Name", flex: 3 },
              { label: "Code", flex: 2 },
              { label: "Available Slots", flex: 1.2 },
              { label: "Waiting List", flex: 1.2 },
              { label: "Candidates", flex: 1 },
              { label: "Actions", flex: 1 },
            ].map(({ label, flex }) => (
              <div key={label} className="px-8 py-3 flex items-center" style={{ flex }}>
                <span className="text-[12px] font-semibold text-[#474554] uppercase tracking-[0.6px]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Body */}
          {isLoadingSessionSpecs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-[#5E39E0]" />
            </div>
          ) : sessionSpecs.length === 0 ? (
            <div className="py-10 text-center text-[14px] text-[#474554]">
              No specializations added to this session yet.
            </div>
          ) : (
            sessionSpecs.map((ss, index) => (
              <div
                key={ss.id}
                className="flex flex-row items-center w-full hover:bg-[#F8F9FA] transition-colors"
                style={{
                  borderTop: index === 0 ? "none" : "1px solid rgba(200,196,214,0.3)",
                  minHeight: 72,
                }}
              >
                <div className="px-8 py-4 flex items-center gap-3" style={{ flex: 3 }}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-[rgba(227,223,255,0.3)]">
                    <CirclePlus size={16} className="text-[#190082]" />
                  </div>
                  <span className="text-[14px] font-semibold text-[#191C1D]">
                    {ss.formationSpecialization.name}
                  </span>
                </div>
                <div className="px-8 py-4" style={{ flex: 2 }}>
                  <span className="text-[14px] text-[#474554]">
                    {ss.formationSpecialization.code}
                  </span>
                </div>
                <div className="px-8 py-4" style={{ flex: 1.2 }}>
                  <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#3730A3]">
                    {ss.availableSlots} slots
                  </span>
                </div>
                <div className="px-8 py-4" style={{ flex: 1.2 }}>
                  <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[12px] font-bold text-[#475569]">
                    {ss.waitingListSlots} slots
                  </span>
                </div>
                <div className="px-8 py-4" style={{ flex: 1 }}>
                  <span className="text-[14px] text-[#474554]">
                    {ss._count.candidates}
                  </span>
                </div>
                <div className="px-8 py-4 flex justify-end items-center gap-2" style={{ flex: 1 }}>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F5] transition-colors"
                    onClick={() => {
                      setEditingSessionSpec(ss);
                      setEditSessionSlots(ss.availableSlots);
                      setEditWaitingListSlots(ss.waitingListSlots);
                    }}
                  >
                    <EditIcon size={15} className="text-[#474554]" />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors disabled:opacity-40"
                    disabled={isDeletingId === ss.id}
                    onClick={() => deleteSessionSpecialization(ss.id)}
                  >
                    {isDeletingId === ss.id ? (
                      <Loader2 size={13} className="animate-spin text-red-400" />
                    ) : (
                      <Trash2 size={13} className="text-[#474554] hover:text-red-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Footer */}
          {sessionSpecs.length > 0 && (
            <div className="flex flex-row justify-between items-center px-8 py-3 bg-[#F3F4F5] sticky bottom-0">
              <span className="text-[12px] font-semibold text-[#474554] tracking-[0.6px]">
                Showing {sessionSpecs.length} specialization{sessionSpecs.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[12px] font-semibold text-[#190082] tracking-[0.6px]">
                {sessionSpecs.reduce((sum, ss) => sum + ss._count.candidates, 0)} total candidates
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editingSessionSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[480px] p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingSessionSpec(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px]">
                Session Specialization
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Update Spec Configuration
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {editingSessionSpec.formationSpecialization.name}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Edit Available Slots */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Available Slots
                </label>
                <input
                  type="number"
                  min={1}
                  value={editSessionSlots}
                  onChange={(e) => setEditSessionSlots(Math.max(1, Number(e.target.value)))}
                  disabled={isUpdating}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Edit Waiting List Slots */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Waiting List Slots
                </label>
                <input
                  type="number"
                  min={0}
                  value={editWaitingListSlots}
                  onChange={(e) => setEditWaitingListSlots(Math.max(0, Number(e.target.value)))}
                  disabled={isUpdating}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm text-slate-500">Current candidates:</span>
                <span className="text-sm font-bold text-slate-700">
                  {editingSessionSpec._count.candidates}
                </span>
                {editSessionSlots < editingSessionSpec._count.candidates && (
                  <span className="ml-auto text-[11px] font-semibold text-amber-600">
                    ⚠ Slots below current candidate count
                  </span>
                )}
              </div>

              <div className="flex justify-end items-center gap-4 mt-2 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingSessionSpec(null)}
                  disabled={isUpdating}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSessionSpecialization}
                  disabled={isUpdating || editSessionSlots < 1 || editWaitingListSlots < 0}
                  className="bg-[#3014B8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isUpdating && <Loader2 size={16} className="animate-spin" />}
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