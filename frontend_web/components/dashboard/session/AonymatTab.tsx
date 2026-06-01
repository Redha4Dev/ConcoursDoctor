"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ShieldCheck, 
  Users, 
  QrCode, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// --- Types ---
interface SubjectStat {
  subjectName: string;
  count: number;
}

interface AnonymatStats {
  total: number;
  bySubject: SubjectStat[];
}

interface AnonymatCode {
  qrCode: string;
  anonymousCode: string;
  subjectName: string;
}

export default function AnonymatSettings() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // --- States ---
  const [stats, setStats] = useState<AnonymatStats>({ total: 0, bySubject: [] });
  const [codes, setCodes] = useState<AnonymatCode[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // --- Debounce Search Term ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // --- API Handlers ---

  // Fetch Stats separately (only needed on mount or after generation)
  const fetchStats = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { data } = await api.get(`/api/v1/anonymization/${sessionId}/stats`);
      if (data?.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching anonymization stats:", error);
    }
  }, [sessionId]);

  // Fetch Codes with Pagination & Filtering
  const fetchCodes = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/v1/anonymization/${sessionId}/codes`, {
        params: {
          search: debouncedSearch || undefined,
          page,
          limit,
        },
      });
      console.log(response.data);
      // Adjust based on your backend pagination structure. 
      // Assuming it returns: { data: { items: [...], pagination: { total: X } } }
      const responseData = response.data.data.data;
      
      setCodes(responseData.items || responseData.codes || responseData); 
      setTotalCount(responseData.pagination?.total || responseData.length || 0);

    } catch (error) {
      console.error("Error fetching anonymization codes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, debouncedSearch, page, limit]);

  const handleGenerateAnonymat = async () => {
    if (!sessionId) return;
    
    if (!window.confirm("Are you sure you want to generate anonymization for all candidates in this session? This action is irreversible.")) {
      return;
    }

    try {
      setIsGenerating(true);
      const { data } = await api.post(`/api/v1/sessions/${sessionId}/anonymize`);
      console.log(data);
      
      if (data.success) {
        await fetchStats();
        await fetchCodes();
      }
    } catch (error) {
      console.error("Error while generating anonymization:", error);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial mount & dependency fetches
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const isAnonymized = stats.total > 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="flex flex-row gap-6 w-full font-sans items-start">
      
      {/* Left Column */}
      <div className="flex flex-col gap-6 w-[400px]">
        
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[12px] font-bold text-[#3014B8] tracking-widest uppercase">
              Anonymization Status
            </h3>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              isAnonymized ? 'bg-[#E0FCE5] text-[#149334]' : 'bg-[#FCE8E0] text-[#934834]'
            }`}>
              {isAnonymized ? 'Generated' : 'Not Started'}
            </span>
          </div>

          <div className="flex items-end gap-3 mb-2">
            <h2 className="text-[42px] font-black text-[#1E293B] leading-none tracking-tighter">
              {stats.total}
            </h2>
            <span className="text-[15px] font-bold text-slate-400 mb-1.5">candidates</span>
          </div>
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
            Total number of copies that received an anonymization code for this session.
          </p>

          <button 
            onClick={handleGenerateAnonymat}
            disabled={isGenerating || isAnonymized}
            className="w-full bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            {isGenerating ? "Generating..." : isAnonymized ? "Anonymization Completed" : "Start Anonymization"}
            {!isGenerating && !isAnonymized && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
          </button>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h2 className="text-[20px] font-bold text-[#1E293B] mb-6 flex items-center gap-2">
            <FileText size={20} className="text-[#3014B8]" />
            Distribution by Subject
          </h2>
          
          {stats.bySubject.length > 0 ? (
            <div className="flex flex-col gap-5">
              {stats.bySubject.map((subject, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-bold text-[#1E293B]">{subject.subjectName}</span>
                    <span className="text-[13px] font-bold text-[#3014B8] bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                      {subject.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3014B8] rounded-full" 
                      style={{ width: `${(subject.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-[14px]">
              No data available.
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="bg-white rounded-2xl p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex-1 h-fit relative min-h-[600px] flex flex-col">
        
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-[#3014B8]" size={32} />
          </div>
        )}

        <div className="flex items-start justify-between mb-10">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center text-[#3014B8]">
              <QrCode size={28} />
            </div>
            <div>
              <h2 className="text-[28px] font-bold text-[#1E293B] leading-tight">
                Anonymization Registry
              </h2>
              <p className="text-[15px] text-slate-400 mt-1">
                Strict list linking physical QR codes to virtual anonymous codes.
              </p>
            </div>
          </div>
        </div>

        {!isAnonymized && !isLoading && (
          <div className="mb-8 bg-[#FFF8E6] border border-[#FFE199] rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="text-[#D97706] mt-0.5" size={20} />
            <div>
              <h4 className="text-[14px] font-bold text-[#92400E]">Generation Required</h4>
              <p className="text-[13px] text-[#B45309] mt-1">
                The copies for this session have not yet been anonymized. Please use the "Start Anonymization" button to generate codes for all candidates.
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <input 
            type="text"
            placeholder="Search by QR Code, Anonymous Code, or Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!isAnonymized}
            className="flex-1 bg-[#F1F5F9] border-none rounded-xl py-4 px-5 text-[14px] font-medium text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3014B8]/20 transition-all placeholder:text-slate-400 disabled:opacity-50"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden border border-slate-100 rounded-xl flex flex-col">
          <div className="bg-[#F8FAFC] grid grid-cols-3 p-4 border-b border-slate-100">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Physical QR Code</span>
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Anonymous Code</span>
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Subject</span>
          </div>
          
          <div className="overflow-y-auto flex-1 min-h-[300px]">
            {codes.length > 0 ? (
              codes.map((code, idx) => (
                <div key={idx} className="grid grid-cols-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors items-center">
                  <span className="text-[14px] font-mono font-medium text-slate-600">
                    {code.qrCode}
                  </span>
                  <span className="text-[14px] font-mono font-bold text-[#3014B8]">
                    {code.anonymousCode}
                  </span>
                  <span className="text-[14px] font-medium text-slate-700 truncate pr-4">
                    {code.subjectName}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 h-full">
                <Users size={32} className="mb-3 opacity-50" />
                <p className="text-[14px] font-medium">
                  {isAnonymized && debouncedSearch ? "No results found for this search." : "No codes to display."}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination Footer */}
        <div className="pt-6 flex justify-between items-center">
          <div className="text-[13px] font-medium text-slate-400">
            Showing <span className="font-bold text-slate-700">{(page - 1) * limit + (codes.length > 0 ? 1 : 0)}</span> to <span className="font-bold text-slate-700">{Math.min(page * limit, totalCount)}</span> of <span className="font-bold text-slate-700">{totalCount}</span> entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#3014B8] disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 text-[13px] font-bold text-[#1E293B]">
              Page {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading || totalPages === 0}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#3014B8] disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}