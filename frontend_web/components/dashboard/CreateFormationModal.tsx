"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "../ui/input";

interface Props {
  onClose: () => void;
  onSuccess: () => void; 
}

export default function CreateFormationModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const CreateFormation = async (name: string, code: string, department: string, description: string) => {
    try {
      setLoading(true);
      
      const response = await api.post("/api/v1/formations", { name, code, department, description });
      if (response.status === 200 || response.status === 201) {
        onSuccess(); 
      } 
    } catch (error) {
      console.error("Failed to create program:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative flex flex-col rounded-[12px] overflow-hidden"
        style={{
          width: 576,
          maxWidth: 576,
          background: "rgba(255,255,255,0.75)",
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex flex-row justify-between items-center px-8 py-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
        >
          <div className="flex flex-col gap-1">
            <h2
              className="text-[24px] font-bold text-[#0F172A] leading-[30px]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              New Program
            </h2>
            <p
              className="text-[12px] text-[#64748B]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Add a new program to the academic catalog.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-[#64748B]" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="flex flex-col gap-6 p-8">
          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label
                className="text-[14px] font-bold text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Program Name
              </label>
              <span className="text-[11px] font-semibold text-[#BA1A1A] uppercase tracking-wide">
                *
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PhD in Computer Science"
              className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
              style={{
                background: "#F6F6F8",
                fontFamily: "'Google Sans', sans-serif",
              }}
            />
          </div>

          {/* Code + Department row */}
          <div className="flex flex-row gap-4">
            {/* Code */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Code
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="INFO-2026"
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <label
                  className="text-[14px] font-bold text-[#64748B]"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                >
                  Department
                </label>
                <span className="text-[14px] font-bold text-[#BA1A1A]">*</span>
              </div>
              <input 
                type="text"
                value={department}
                placeholder="Computer Science"
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#0F172A] outline-none"
                style={{
                  background: "#F6F6F8",
                  fontFamily: "'Google Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-2">
            <label
              className="text-[14px] font-bold text-[#64748B]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe objectives, prerequisites, and career opportunities..."
              className="w-full px-4 py-3 rounded-[8px] text-[14px] text-[#64748B] outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(200,196,215,0.2)",
                fontFamily: "'Google Sans', sans-serif",
                height: 104,
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-row justify-end items-center gap-3 px-8 py-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-[#475569]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Cancel
          </button>
          <button
            className="px-8 py-2.5 rounded-[8px] text-[14px] font-semibold text-white relative"
            style={{
              background: "#3014B8",
              fontFamily: "'Inter', sans-serif",
            }}
            disabled={loading}
            onClick={() => CreateFormation(name, code, department, description)}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}