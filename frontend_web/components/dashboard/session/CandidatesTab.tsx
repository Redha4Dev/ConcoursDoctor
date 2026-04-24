"use client";

import React, { useRef, useState } from "react";
import { CloudUpload, Filter, Download, Link } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

type CandidateStatus = "registered" | "error";

interface Candidate {
  id: number;
  idNumber: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  importedAt: string;
  error?: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: 1,
    idNumber: "2026001",
    lastName: "Benali",
    firstName: "Ahmed",
    email: "ahmed@esi.dz",
    phone: "0550 12 34 56",
    status: "registered",
    importedAt: "12/04/2026",
  },
  {
    id: 2,
    idNumber: "2026002",
    lastName: "Mezian",
    firstName: "Sara",
    email: "sara@esi.dz",
    phone: "0550 12 34 56",
    status: "registered",
    importedAt: "12/04/2026",
  },
  {
    id: 3,
    idNumber: "INVALID",
    lastName: "—",
    firstName: "—",
    email: "invalid email",
    phone: "—",
    status: "error",
    importedAt: "12/04/2026",
    error: "invalid email",
  },
];

const StatusBadge = ({
  status,
  error,
}: {
  status: CandidateStatus;
  error?: string;
}) => {
  if (status === "error") {
    return (
      <span className="px-3 py-1 rounded-full bg-[#BA1A1A] text-[12px] font-bold text-white">
        Error
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[12px] font-bold text-[#047857]">
      REGISTERED
    </span>
  );
};

export default function CandidatesTab() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("••••••••••••••••");

  // --- Handle File Upload using @/lib/api ---
  const uploadFile = async (selectedFile: File) => {
    if (!sessionId) {
      console.error("Session ID is missing.");
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const endpoint = `/api/v1/candidates/${sessionId}/import`;

      // Assuming your api utility is an Axios instance or similar wrapper
      const response = await api.post(
              endpoint,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );

      // Adjust response handling based on your specific api wrapper's return format
      console.log("Upload successful:", response.data || response);
      
      // Optional: Refresh your candidates state here based on the response

    } catch (error) {
      console.error("Error uploading file:", error);
      // Optional: Handle error UI state here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top row: Upload + API Config */}
      <div className="flex flex-row gap-8 w-full">
        {/* Upload Area */}
        <div
          className="flex-1 flex flex-col rounded-[20px] overflow-hidden p-1"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(48,20,184,0.1)",
            boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
            backdropFilter: "blur(7.6px)",
            minHeight: 308,
          }}
        >
          <div
            className={`flex flex-col items-center justify-center gap-6 p-12 rounded-[20px] flex-1 transition-all ${
              isDragging
                ? "border-[#3014B8] bg-[rgba(48,20,184,0.15)]"
                : "bg-[rgba(48,20,184,0.1)]"
            }`}
            style={{
              border: `2px dashed ${isDragging ? "rgba(48,20,184,0.4)" : "rgba(48,20,184,0.2)"}`,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) uploadFile(f);
            }}
          >
            <div
              className="w-[65px] h-[56px] flex items-center justify-center rounded-[12px]"
              style={{ background: "rgba(48,20,184,0.1)" }}
            >
              <CloudUpload size={28} className="text-[#3014B8]" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center max-w-sm">
              <h3
                className="text-[18px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Drag and drop your candidate list
              </h3>
              <p
                className="text-[14px] text-[#64748B]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Support for CSV, XLSX, and XLS formats up to 20MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`px-7 py-3 rounded-[4px] text-[14px] font-bold text-white ${
                isUploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              style={{
                background: "#3014B8",
                boxShadow: "0px 10px 15px -3px rgba(48,20,184,0.2), 0px 4px 6px -4px rgba(48,20,184,0.2)",
                fontFamily: "'Google Sans', sans-serif",
              }}
            >
              {isUploading ? "Uploading..." : file ? `📄 ${file.name}` : "Browse Files"}
            </button>
          </div>
        </div>

        {/* API Config Card */}
        <div
          className="flex flex-col gap-4 p-6 rounded-[20px]"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(48,20,184,0.1)",
            boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
            width: 311,
            minHeight: 308,
          }}
        >
          <div className="flex items-center gap-2">
            <Link size={16} className="text-[#3014B8]" />
            <h3
              className="text-[18px] font-bold text-[#0F172A]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              API Configuration
            </h3>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {/* Endpoint URL */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[14px] font-bold text-[#334155]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Endpoint URL
              </label>
              <textarea
                value={apiEndpoint || `/api/v1/candidates/${sessionId || "{sessionId}"}/import`}
                onChange={(e) => setApiEndpoint(e.target.value)}
                readOnly
                className="w-full px-3 py-2.5 rounded-[4px] text-[14px] text-[#6B7280] resize-none"
                style={{
                  background: "#F6F6F8",
                  border: "1px solid rgba(48,20,184,0.2)",
                  fontFamily: "'Google Sans', sans-serif",
                  height: 57,
                }}
              />
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[14px] font-bold text-[#334155]"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[4px] text-[14px] text-[#6B7280]"
                style={{
                  background: "#F6F6F8",
                  border: "1px solid rgba(48,20,184,0.2)",
                  fontFamily: "'Inter', sans-serif",
                  height: 38,
                }}
              />
            </div>

            {/* Test button */}
            <button
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[4px] text-[14px] font-bold text-[#3014B8]"
              style={{
                background: "rgba(48,20,184,0.1)",
                fontFamily: "'Google Sans', sans-serif",
              }}
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div
        className="flex flex-col w-full rounded-[20px] overflow-hidden bg-white"
        style={{
          boxShadow: "6px 6px 24px rgba(0,0,0,0.16)",
          backdropFilter: "blur(7.6px)",
        }}
      >
        {/* Table header row */}
        <div className="flex flex-row justify-between items-center px-8 py-6">
          <h2
            className="text-[24px] font-bold text-[#0F172A]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Candidate List
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-bold text-[#64748B] hover:bg-gray-50"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              <Filter size={13} className="text-[#64748B]" />
              Filter
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-bold text-[#64748B] hover:bg-gray-50"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              <Download size={12} className="text-[#64748B]" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-white">
              {[
                "No.",
                "ID Number",
                "Last Name",
                "First Name",
                "Email",
                "Phone Number",
                "Status",
                "Imported at",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-8 text-left text-[12px] font-bold text-[#64748B]"
                  style={{
                    fontFamily: "'Google Sans', sans-serif",
                    paddingTop: 30,
                    paddingBottom: 30,
                  }}
                >
                  {h}
                </th>
              ))}
              <th className="w-[88px]" />
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c) => (
              <tr
                key={c.id}
                className={c.status === "error" ? "bg-[rgba(255,218,214,0.2)]" : "border-t border-[#F8FAFC]"}
              >
                <td className="px-8 py-7">
                  <span
                    className={`text-[14px] ${c.status === "error" ? "text-[rgba(186,26,26,0.5)]" : "text-[#64748B]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {c.id}
                  </span>
                </td>
                <td className="px-6 py-7">
                  <span
                    className={`text-[14px] font-bold ${c.status === "error" ? "text-[#BA1A1A]" : "text-[#3014B8]"}`}
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    {c.idNumber}
                  </span>
                </td>
                <td className="px-6 py-7">
                  {c.status === "error" ? (
                    <div className="w-3.5 h-px bg-[#CBD5E1]" />
                  ) : (
                    <span
                      className="text-[14px] font-bold text-[#0F172A]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {c.lastName}
                    </span>
                  )}
                </td>
                <td className="px-6 py-7">
                  {c.status === "error" ? (
                    <div className="w-3.5 h-px bg-[#CBD5E1]" />
                  ) : (
                    <span
                      className="text-[14px] font-bold text-[#0F172A]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {c.firstName}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`text-[14px] ${c.status === "error" ? "font-bold text-[#BA1A1A]" : "text-[#64748B]"}`}
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    {c.email}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {c.status === "error" ? (
                    <div className="w-3.5 h-px bg-[#CBD5E1]" />
                  ) : (
                    <span
                      className="text-[14px] text-[#64748B]"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {c.phone}
                    </span>
                  )}
                </td>
                <td className="px-6 py-7">
                  <StatusBadge status={c.status} error={c.error} />
                </td>
                <td className="px-6 py-7">
                  <span
                    className="text-[14px] text-[#64748B]"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    {c.importedAt}
                  </span>
                </td>
                <td className="px-8 py-7 text-right">
                  {c.status === "error" ? (
                    <button className="text-[#BA1A1A] hover:opacity-70">
                      <span className="text-lg">✕</span>
                    </button>
                  ) : (
                    <button className="text-[#64748B] hover:opacity-70">
                      <span className="text-lg">···</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div
          className="flex flex-row justify-between items-center px-8 py-6"
          style={{ background: "rgba(242,244,246,0.3)" }}
        >
          <span
            className="text-[12px] text-[#64748B]"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            Showing 3 of 45 candidates
          </span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-[4px] hover:bg-gray-100">
              <span className="text-[#64748B] text-xs">‹</span>
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-[12px] font-bold ${
                  n === 1
                    ? "bg-[#3014B8] text-white"
                    : "text-[#64748B] hover:bg-gray-100"
                }`}
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                {n}
              </button>
            ))}
            <span
              className="px-2 text-[12px] font-bold text-[#64748B]"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              ...
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[12px] font-bold text-[#64748B] hover:bg-gray-100">
              67
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-[4px] hover:bg-gray-100">
              <span className="text-[#64748B] text-xs">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}