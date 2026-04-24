"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CloudUpload, Filter, Download, Link, Search, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

// Updated to match your API's available values
type CandidateStatus = "REGISTERED" | "VALID" | "INVALID" | "ERROR";

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

const StatusBadge = ({ status }: { status: CandidateStatus }) => {
  const styles: Record<CandidateStatus, string> = {
    REGISTERED: "bg-[#D1FAE5] text-[#047857]",
    VALID: "bg-[#DBEAFE] text-[#1E40AF]",
    INVALID: "bg-[#FEE2E2] text-[#991B1B]",
    ERROR: "bg-[#BA1A1A] text-white",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase ${styles[status] || styles.ERROR}`}>
      {status}
    </span>
  );
};

export default function CandidatesTab() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // --- State for Data and Loading ---
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // --- State for Query Parameters ---
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(""); // REGISTERED, VALID, INVALID
  const [page, setPage] = useState(1);
  const limit = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");


  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1); // optional: reset page on new search
  }, 500); // ⏱ 0.5 seconds

  return () => clearTimeout(timer);
}, [search]);


  // --- Fetch Candidates from API ---
  const fetchCandidates = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/v1/candidates/${sessionId}`, {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          page,
          limit,
        },
      });
      console.log(response.data);
      // Assuming response.data contains { items: Candidate[], total: number }
      // Adjust based on your actual API response structure
      setCandidates(response.data.data.candidates || response.data);
      setTotalCount(response.data.data.pagination.total || 0);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, debouncedSearch, status, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // --- File Upload Logic ---
  const uploadFile = async (selectedFile: File) => {
    if (!sessionId) return;
    setFile(selectedFile);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post(`/api/v1/candidates/${sessionId}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchCandidates(); // Refresh list after upload
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-row gap-8 w-full">
        {/* Upload Area */}
        <div className="flex-1 flex flex-col rounded-[20px] overflow-hidden p-1 bg-white border border-[rgba(48,20,184,0.1)] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] min-h-[308px]">
          <div
            className={`flex flex-col items-center justify-center gap-6 p-12 rounded-[20px] flex-1 transition-all border-2 border-dashed ${
              isDragging ? "border-[#3014B8] bg-[rgba(48,20,184,0.15)]" : "border-[rgba(48,20,184,0.2)] bg-[rgba(48,20,184,0.1)]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) uploadFile(f);
            }}
          >
            <div className="w-[65px] h-[56px] flex items-center justify-center rounded-[12px] bg-[rgba(48,20,184,0.1)]">
              <CloudUpload size={28} className="text-[#3014B8]" />
            </div>
            <div className="text-center">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Drag and drop your candidate list</h3>
              <p className="text-[14px] text-[#64748B]">Support for CSV, XLSX, and XLS up to 20MB.</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-7 py-3 rounded-[4px] text-[14px] font-bold text-white bg-[#3014B8] disabled:opacity-70"
            >
              {isUploading ? "Uploading..." : file ? `📄 ${file.name}` : "Browse Files"}
            </button>
          </div>
        </div>

        {/* Search & Quick Filters */}
        <div className="w-[311px] flex flex-col gap-4 p-6 rounded-[20px] bg-white border border-[rgba(48,20,184,0.1)]">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#3014B8]" />
            <h3 className="text-[18px] font-bold text-[#0F172A]">Filters</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#F6F6F8] border border-[rgba(48,20,184,0.2)] rounded-[4px] text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#F6F6F8] border border-[rgba(48,20,184,0.2)] rounded-[4px] text-sm"
            >
              <option value="">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="VALID">Valid</option>
              <option value="INVALID">Invalid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6">
          <h2 className="text-[24px] font-bold text-[#0F172A]">Candidate List</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-[#64748B] font-bold hover:bg-gray-50 rounded-lg">
            <Download size={14} /> Export
          </button>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#3014B8]" size={32} />
            </div>
          )}
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {["No.", "ID Number", "Last Name", "First Name", "Email", "Status", "Imported"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((c, idx) => (
                  <tr key={c.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#64748B]">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#3014B8]">{c.idNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{c.lastName}</td>
                    <td className="px-6 py-4 text-sm font-medium">{c.firstName}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{c.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{c.importedAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    No candidates found for this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-8 py-6 bg-gray-50/50">
          <span className="text-[12px] text-[#64748B]">
            Showing {Math.min(limit * page, totalCount) } of {totalCount} candidates
          </span>
          <div className="flex gap-1">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 disabled:opacity-50"
            >
              ‹
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#3014B8] text-white text-xs font-bold">
              {page}
            </button>
            <button 
              disabled={candidates.length < limit}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}