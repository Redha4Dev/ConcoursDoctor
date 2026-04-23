"use client";

import React, { useState, useEffect } from "react";
import {
  DoorOpen,
  Settings2,
  Pen,
  Trash2,
  DoorClosed,
  Wrench,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

// --- Types ---
interface Room {
  id?: number | string;
  name: string;
  capacity: number | string;
  floor: string;
  building: string;
  status: string;
}

export default function RoomManagement() {
  // --- State ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | string | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    floor: "RDC",
    building: "Cycle superieur",
    status: "AVAILABLE",
  });

  // --- Effects ---
  useEffect(() => {
    fetchRooms();
  }, []);

  // --- API Handlers ---
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/v1/rooms");
      const data = response.data;
      let roomsArray = [];

      if (Array.isArray(data)) {
        roomsArray = data;
      } else if (data?.rooms && Array.isArray(data.rooms)) {
        roomsArray = data.rooms;
      } else if (data?.data && Array.isArray(data.data)) {
        roomsArray = data.data;
      }

      setRooms(roomsArray);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      // Fallback for UI testing
      setRooms([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (isEditMode && selectedRoomId) {
        await api.patch(`/api/v1/rooms/${selectedRoomId}`, payload);
      } else {
        await api.post("/api/v1/rooms", payload);
      }

      await fetchRooms();
      closeModal();
    } catch (error) {
      console.error("Operation failed:", error);
      alert(`Failed to ${isEditMode ? "update" : "add"} room.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/api/v1/rooms/${id}`);
      setRooms(rooms.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete room.");
    }
  };

  // --- Helpers ---
  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedRoomId(null);
    setFormData({
      name: "",
      capacity: "",
      floor: "RDC",
      building: "Cycle superieur",
      status: "AVAILABLE",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setIsEditMode(true);
    setSelectedRoomId(room.id || null);
    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      floor: room.floor,
      building: room.building,
      status: room.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedRoomId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-[32px] text-white font-bold text-[16px]"
          style={{
            background: "linear-gradient(103.23deg, #1C0087 0%, #3014B8 100%)",
            boxShadow:
              "0px 10px 15px -3px rgba(99,102,241,0.2), 0px 4px 6px -4px rgba(99,102,241,0.2)",
            fontFamily: "'Google Sans', sans-serif",
          }}
        >
          <DoorClosed className="w-[18px] h-[18px]" />
          New Room
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#2D1B88]">
              <DoorClosed className="w-6 h-6" />
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-slate-900">
              {rooms.length}
            </h3>
            <p className="text-[11px] mt-1 text-slate-400 font-bold uppercase tracking-wider">
              TOTAL ROOMS
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-[11px] mt-3 text-slate-400 font-bold uppercase mb-2">
            AVAILABILITY
          </p>
          <h3 className="text-4xl font-bold text-slate-900">88%</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-[11px] mt-3 text-slate-400 font-bold uppercase mb-2">
            CAPACITY
          </p>
          <h3 className="text-4xl font-bold text-slate-500">1.2k</h3>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-slate-900">
            Room Directory
          </h2>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase">
                  Room Name
                </th>
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase">
                  Capacity
                </th>
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase">
                  Floor
                </th>
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase">
                  Building
                </th>
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase">
                  Status
                </th>
                <th className="pb-4 text-[12px] font-bold text-slate-500 uppercase text-right pr-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2D1B88]" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                rooms.map((room, idx) => (
                  <tr
                    key={room.id || idx}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${room.status === "AVAILABLE" ? "bg-indigo-50 text-[#2D1B88]" : "bg-orange-50 text-orange-500"}`}
                        >
                          {room.status === "AVAILABLE" ? (
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
                    <td className="py-4 font-bold text-[14px] text-slate-900">
                      {room.capacity}
                    </td>
                    <td className="py-4 text-[14px] text-slate-500 font-medium">
                      {room.floor}
                    </td>
                    <td className="py-4 font-bold text-[14px] text-slate-900">
                      {room.building}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${room.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(room)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Pen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => room.id && handleDeleteRoom(room.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL (CREATE & EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] w-full max-w-[500px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-8">
              <p className="text-[13px] font-bold text-[#2D1B88] uppercase tracking-wider mb-2">
                {isEditMode
                  ? "FORMULAIRE DE MODIFICATION"
                  : "FORMULAIRE DE CRÉATION"}
              </p>
              <h2 className="text-[32px] font-bold text-slate-900 leading-tight">
                {isEditMode
                  ? "Modifier la salle"
                  : "Ajouter une nouvelle salle"}
              </h2>
            </div>
            <form onSubmit={handleSubmitRoom} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500 uppercase">
                  Nom de la salle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="ex: Salle A1"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-[#2D1B88] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-slate-500 uppercase">
                    Capacité *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    placeholder="0"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-[#2D1B88] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-slate-500 uppercase">
                    Étage *
                  </label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                  >
                    <option value="RDC">RDC</option>
                    <option value="1er Étage">1er Étage</option>
                    <option value="2ème Étage">2ème Étage</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500 uppercase">
                  Bâtiment
                </label>
                <select
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                >
                  <option value="Cycle superieur">Cycle superieur</option>
                  <option value="Classe préparatoire">
                    Classe préparatoire
                  </option>
                </select>
              </div>
              <div className="flex justify-end items-center gap-6 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="font-bold text-slate-500 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2D1B88] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D1B88]/90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting
                    ? "Traitement..."
                    : isEditMode
                      ? "Modifier"
                      : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
