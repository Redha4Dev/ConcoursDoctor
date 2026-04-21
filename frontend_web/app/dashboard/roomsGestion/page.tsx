"use client";

import React from "react";
import { 
  DoorOpen, 
  Settings2, 
  Pen, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  DoorClosed,
  Wrench
} from "lucide-react";

// Mock data (translated)
const roomsData = [
  {
    id: 1,
    name: "Room A1",
    capacity: 50,
    floor: "2nd Floor",
    building: "Higher Cycle",
    status: "AVAILABLE",
  },
  {
    id: 2,
    name: "Room B1",
    capacity: 50,
    floor: "Ground Floor",
    building: "Preparatory Classes",
    status: "AVAILABLE",
  },
  {
    id: 3,
    name: "Room A3",
    capacity: 50,
    floor: "4th Floor",
    building: "Higher Cycle",
    status: "UNAVAILABLE",
  },
  {
    id: 4,
    name: "Room 5",
    capacity: 30,
    floor: "1st Floor",
    building: "Higher Cycle",
    status: "AVAILABLE",
  },
  {
    id: 5,
    name: "Room 4",
    capacity: 30,
    floor: "Basement Level 1",
    building: "Higher Cycle",
    status: "AVAILABLE",
  },
];

export default function RoomManagement() {
  return (
    <div className="p-8 bg-[#f8f9fc] min-h-screen w-full font-sans antialiased text-slate-800">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">
            Room Management
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Manage Examination Rooms.
          </p>
        </div>
        <button className="bg-[#2D1B88] hover:bg-[#2D1B88]/90 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2.5 transition-colors shadow-sm">
          <DoorClosed className="w-[18px] h-[18px]" />
          New Room
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Rooms */}
        <div className="bg-white rounded-2xl p-4  shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#2D1B88]">
              <DoorClosed className="w-5 h-5" />
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
          <div className="mb-6">
            <h3 className="text-4xl font-bold text-slate-900">20</h3>
            <p className="text-[11px] mt-4 text-slate-400 font-bold uppercase tracking-wider">
              TOTAL ROOMS
            </p>
          </div>
        </div>

        {/* Card 2: Availability */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            AVAILABILITY
          </p>
          <h3 className="text-4xl font-bold text-slate-900 mb-2">88%</h3>
          <p className="text-[13px] text-slate-500 font-medium">
            Optimal capacity
          </p>
        </div>

        {/* Card 3: Maintenance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            UNDER MAINTENANCE
          </p>
          <h3 className="text-4xl font-bold text-red-500 mb-2">4</h3>
          <p className="text-[13px] text-slate-500 font-medium">
            Recovery expected in 48h
          </p>
        </div>

        {/* Card 4: Total Capacity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            TOTAL CAPACITY
          </p>
          <h3 className="text-4xl font-bold text-slate-500 mb-2">1.2k</h3>
          <p className="text-[13px] text-slate-500 font-medium">
            Students simultaneously
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
        
        {/* Table Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-slate-900">
            Room Directory
          </h2>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-2">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Room Name</th>
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Building</th>
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="pb-4 pt-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomsData.map((room) => (
                <tr key={room.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  
                  {/* Room Name & Icon */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${room.status === 'AVAILABLE' ? 'bg-indigo-50 text-[#2D1B88]' : 'bg-orange-50 text-orange-500'}`}>
                        {room.status === 'AVAILABLE' ? (
                          <DoorOpen className="w-5 h-5" />
                        ) : (
                          <Wrench className="w-5 h-5" />
                        )}
                      </div>
                      <span className="font-bold text-[14px] text-slate-900">
                        {room.name}
                      </span>
                    </div>
                  </td>

                  {/* Capacity */}
                  <td className="py-4 font-bold text-[14px] text-slate-900">
                    {room.capacity}
                  </td>

                  {/* Floor */}
                  <td className="py-4 text-[14px] text-slate-500 font-medium">
                    {room.floor}
                  </td>

                  {/* Building */}
                  <td className="py-4 font-bold text-[14px] text-slate-900">
                    {room.building}
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                      room.status === 'AVAILABLE' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {room.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 text-right pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-slate-400 hover:text-slate-700 transition-colors">
                        <Pen className="w-4 h-4" />
                      </button>
                      <button className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[13px] text-slate-500 font-medium">
            Showing 1-5 of 20 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2D1B88] text-white text-[13px] font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-[13px] font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-[13px] font-bold transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-[13px] font-bold transition-colors">
              4
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
