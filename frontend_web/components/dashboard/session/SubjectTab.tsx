"use client";

import React, { useState } from "react";
import { 
  Book, 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Cpu,
  BrainCircuit,
  Shield
} from "lucide-react";

// Dummy data based on the screenshot
const subjectsData = [
  { id: 1, name: "Base de données avancées", coeff: "3.0", icon: Database },
  { id: 2, name: "Systèmes Distribués", coeff: "1", icon: Cpu },
  { id: 3, name: "Intelligence Artificielle", coeff: "1", icon: BrainCircuit },
  { id: 4, name: "Cybersécurité", coeff: "3", icon: Shield },
];

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-6  w-full font-sans">
      
      {/* Top Stats Cards */}
      <div className="flex flex-row gap-6 w-full">
        {/* Total Subjects Card */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h3 className="text-[12px] font-bold text-[#3014B8] tracking-wide uppercase mb-1">
            Total Matières
          </h3>
          <p className="text-[32px] font-bold text-[#0F172A] leading-none">
            12
          </p>
        </div>

        {/* Total Coefficient Card */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h3 className="text-[12px] font-bold text-[#3014B8] tracking-wide uppercase mb-1">
            Coefficient Total
          </h3>
          <p className="text-[32px] font-bold text-[#0F172A] leading-none">
            24.5
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden flex flex-col">
        
        {/* Header Actions */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-[22px] font-bold text-[#0F172A]">
            Matières enregistrées
          </h2>
          
          <div className="flex flex-row items-center gap-4">
            <button className="flex items-center gap-2 bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-5 py-2.5 rounded-full text-[14px] font-bold">
              <Book size={16} />
              Nouvel Matières
            </button>
            
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F6F6F8] text-[14px] text-slate-700 placeholder:text-slate-400 rounded-full pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#3014B8]/20 w-[240px] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="flex flex-row items-center bg-[#F8F9FA] px-8 py-3 border-b border-slate-100">
          <div className="flex-[2] text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Nom de la Matière
          </div>
          <div className="flex-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Coefficient
          </div>
          <div className="flex-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right pr-4">
            Actions
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {subjectsData.map((subject) => (
            <div 
              key={subject.id} 
              className="flex flex-row items-center px-8 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              {/* Subject Name & Icon */}
              <div className="flex-[2] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] flex items-center justify-center text-[#3014B8]">
                  <subject.icon size={18} />
                </div>
                <span className="text-[15px] font-bold text-[#0F172A]">
                  {subject.name}
                </span>
              </div>

              {/* Coefficient */}
              <div className="flex-1 flex justify-center">
                <span className="bg-[#F0EEFF] text-[#3014B8] text-[13px] font-bold px-3 py-1 rounded-full">
                  {subject.coeff}
                </span>
              </div>

              {/* Actions */}
              <div className="flex-1 flex items-center justify-end gap-3 pr-4">
                <button className="p-2 text-slate-400 hover:text-[#3014B8] transition-colors rounded-lg hover:bg-slate-100">
                  <Pencil size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-row items-center justify-between p-6">
          <span className="text-[13px] text-slate-500">
            Affichage de 4 sur 12 matières
          </span>
          
          <div className="flex flex-row items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3014B8] text-white text-[13px] font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 text-[13px] font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 text-[13px] font-bold transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}