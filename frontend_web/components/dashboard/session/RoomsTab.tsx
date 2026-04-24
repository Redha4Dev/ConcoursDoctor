"use client";

import React from "react";
import { 
  Zap, 
  DoorClosed, 
  ListFilter, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  AlertTriangle
} from "lucide-react";

const roomsData = [
  {
    id: 1,
    name: "Salle A1",
    capacity: "50 places",
    floor: "RDC",
    building: "Cycle superieur",
    status: "active", // green dot
  },
  {
    id: 2,
    name: "Salle 5",
    capacity: "30 places",
    floor: "2ème étage",
    building: "Cycle superieur",
    status: "active",
  },
  {
    id: 3,
    name: "Salle A3",
    capacity: "20 places",
    floor: "1er étage",
    building: "Cycle superieur",
    status: "inactive", // brownish dot
  },
  {
    id: 4,
    name: "Salle B1",
    capacity: "50 places",
    floor: "4ème étage",
    building: "Classe préparatoire",
    status: "active",
  },
];

export default function RoomDirectory() {
  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      
      {/* Main Directory Card */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden flex flex-col">
        
        {/* Header Actions */}
        <div className="flex flex-row items-center justify-between p-6">
          <h2 className="text-[22px] font-bold text-[#0F172A]">
            Répertoire des Salles
          </h2>
          
          <div className="flex flex-row items-center gap-4">
            <button className="flex items-center gap-2 bg-white border border-[#3014B8] text-[#3014B8] hover:bg-slate-50 transition-colors px-5 py-2.5 rounded-full text-[14px] font-bold">
              <Zap size={16} />
              Auto-assigner candidats
            </button>

            <button className="flex items-center gap-2 bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-5 py-2.5 rounded-full text-[14px] font-bold">
              <DoorClosed size={16} />
              Nouvel salle
            </button>

            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <ListFilter size={20} />
            </button>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="flex flex-row items-center bg-[#F8F9FA] px-8 py-4 border-y border-slate-100">
          <div className="flex-[2] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Nom de la Salle
          </div>
          <div className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Capacité
          </div>
          <div className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Étage
          </div>
          <div className="flex-[1.5] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Bâtiment
          </div>
          <div className="w-16 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Action
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {roomsData.map((room) => (
            <div 
              key={room.id} 
              className="flex flex-row items-center px-8 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              {/* Room Name & Status */}
              <div className="flex-[2] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${room.status === 'active' ? 'bg-[#10B981]' : 'bg-[#C6B0A3]'}`} />
                <span className="text-[15px] font-bold text-[#0F172A]">
                  {room.name}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex-1 text-[14px] text-slate-500">
                {room.capacity}
              </div>

              {/* Floor */}
              <div className="flex-1 text-[14px] text-slate-500">
                {room.floor}
              </div>

              {/* Building Badge */}
              <div className="flex-[1.5] flex items-center">
                <span className="bg-[#F0EEFF] text-[#3014B8] text-[12px] font-bold px-3 py-1.5 rounded-md">
                  {room.building}
                </span>
              </div>

              {/* Actions */}
              <div className="w-16 flex items-center justify-center">
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-row items-center justify-between p-6">
          <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">
            Affichage de 4 salles sur 28
          </span>
          
          <div className="flex flex-row items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3014B8] text-white text-[13px] font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 text-[13px] font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 text-[13px] font-bold transition-colors">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-[13px] font-bold">
              ...
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 text-[13px] font-bold transition-colors">
              7
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Stats Cards */}
      <div className="flex flex-row gap-6 w-full">
        {/* Occupancy Rate */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#3014B8] flex items-center justify-center text-white">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[24px] font-bold text-[#0F172A] leading-tight">
              84%
            </p>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Taux d'occupation moyen
            </h3>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#F0EEFF] flex items-center justify-center text-[#3014B8]">
            <DoorClosed size={20} />
          </div>
          <div>
            <p className="text-[24px] font-bold text-[#0F172A] leading-tight">
              22
            </p>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Salles disponibles
            </h3>
          </div>
        </div>

        {/* Maintenance */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#FCE8E6] flex items-center justify-center text-[#991B1B]">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[24px] font-bold text-[#0F172A] leading-tight">
              03
            </p>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Salles en maintenance
            </h3>
          </div>
        </div>
      </div>
      
    </div>
  );
}