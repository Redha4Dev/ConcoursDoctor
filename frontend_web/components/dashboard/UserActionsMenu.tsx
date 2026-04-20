"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  courseName?: string;
  courseCode?: string;
  department?: string;
}

const ActionModal: React.FC<CourseModalProps> = ({
  open,
  onClose,
  courseName = "PhD in Computer Science — INFO-2026",
  courseCode = "CS-PHD-2026",
  department = "Computer Science",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex flex-col items-start p-0 bg-white/75 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-[12px] overflow-hidden font-['Google_Sans']"
        style={{ width: "576px", height: "566.5px" }}
      >
        {/* Modal Header */}
        <header className="flex flex-row justify-between items-center px-8 py-6 w-full border-b border-white/50 h-[99px] shrink-0">
          <div className="flex flex-col gap-1 w-[308.75px]">
            <h2 className="font-bold text-[24px] leading-[30px] text-[#0F172A] flex items-center">
              Edit Course
            </h2>
            <p className="text-[12px] leading-[15px] text-[#64748B] flex items-center">
              Add a new curriculum to the academic catalog.
            </p>
          </div>
        </header>

        {/* Modal Form Body */}
        <div className="flex flex-col items-start p-8 gap-6 w-full h-[379.5px]">
          {/* Name Field */}
          <div className="flex flex-col gap-2 w-full">
            <label className="flex items-center gap-2 font-bold text-[14px] leading-[18px] text-[#64748B]">
              Course Name{" "}
              <span className="text-[#BA1A1A] text-[11px] font-inter font-semibold tracking-[0.55px] uppercase">
                *
              </span>
            </label>
            <div className="flex items-center px-4 py-3 bg-[#F6F6F8] rounded-lg h-[42px]">
              <span className="text-[14px] leading-[18px] text-[#0F172A] font-normal">
                {courseName}
              </span>
            </div>
          </div>

          {/* Row: Code & Dept */}
          <div className="relative w-full h-[70.5px]">
            {/* Code Field */}
            <div className="absolute left-0 w-[244px] flex flex-col gap-2">
              <label className="flex items-center gap-2 font-bold text-[14px] leading-[18px] text-[#64748B]">
                Code <span className="text-[#BA1A1A] font-bold">*</span>
              </label>
              <div className="flex items-center px-4 py-3 bg-[#F6F6F8] rounded-lg h-[42px]">
                <span className="text-[14px] leading-[18px] text-[#0F172A] font-normal">
                  {courseCode}
                </span>
              </div>
            </div>

            {/* Department Field */}
            <div className="absolute right-0 w-[244px] flex flex-col gap-2">
              <label className="flex items-center gap-2 font-bold text-[14px] leading-[18px] text-[#64748B]">
                Department <span className="text-[#BA1A1A] font-bold">*</span>
              </label>
              <div className="flex items-center justify-between px-[17px] bg-[#F2F4F6] border border-[#C8C4D7]/20 rounded-lg h-[42px]">
                <span className="text-[14px] leading-[18px] text-[#0F172A] font-normal">
                  {department}
                </span>
                <ChevronDown size={21} className="text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold text-[14px] leading-[18px] text-[#64748B]">
              Description (optional)
            </label>
            <div className="flex flex-row items-start px-4 pt-3 pb-[72px] bg-white/50 border border-[#C8C4D7]/20 rounded-lg w-full h-[104px]">
              <p className="text-[14px] leading-[18px] text-[#64748B] font-normal">
                Describe the objectives, prerequisites, and career opportunities for this course...
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="flex flex-row justify-end items-center px-8 py-6 gap-3 w-full h-[88px] shrink-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-6 py-2.5 w-[101.39px] h-10 font-inter font-semibold text-[14px] leading-5 text-[#475569] hover:bg-gray-100/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="relative flex items-center justify-center px-8 py-2.5 w-[102px] h-10 bg-[#3014B8] font-inter font-semibold text-[14px] leading-5 text-white rounded-lg shadow-[0_2px_8px_rgba(48,20,184,0.25)] hover:bg-[#2610A0] transition-colors overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.002] rounded-lg" />
            <span className="relative z-10">Create</span>
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export const UserActionsMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F6F6F8] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      <ActionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};