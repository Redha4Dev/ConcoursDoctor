"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function NewSessionModal({ onClose }: Props) {
  const [year, setYear] = useState("2025/2026");
  const [examDate, setExamDate] = useState("");
  const [candidateLimit, setCandidateLimit] = useState("");
  const [rooms, setRooms] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative flex flex-col rounded-[24px]"
        style={{
          width: 576,
          maxWidth: 576,
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex flex-col p-8"
          style={{ borderBottom: "1px solid rgba(200,196,215,0.1)" }}
        >
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2
                className="text-[24px] font-bold text-[#0F172A] leading-[30px]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Nouvelle session
              </h2>
              <p
                className="text-[14px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Configurez les paramètres du prochain concours de doctorat.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <div className="flex flex-col gap-6 p-8">
          {/* Year + Exam Date row */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Année académique
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025/2026"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Date d'examen
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Candidate limit + Rooms row */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label
                className="text-[14px] font-bold text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Limite de candidats
              </label>
              <input
                type="number"
                value={candidateLimit}
                onChange={(e) => setCandidateLimit(e.target.value)}
                placeholder="50"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label
                className="text-[14px] font-bold text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Nombre de salles
              </label>
              <input
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                placeholder="3"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Status selector */}
          <div className="flex flex-col gap-2">
            <label
              className="text-[14px] font-bold text-[#64748B]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Statut initial
            </label>
            <div
              className="relative flex items-center rounded-[8px]"
              style={{
                background: "#F2F4F6",
                border: "1px solid rgba(200,196,215,0.2)",
              }}
            >
              <select
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none appearance-none bg-transparent"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <div className="absolute right-3 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1L6 7L11 1"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-row justify-end items-center gap-3 px-8 py-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-[#475569]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Annuler
          </button>
          <button
            className="px-8 py-2.5 rounded-[8px] text-[14px] font-semibold text-white"
            style={{
              background: "#3014B8",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}