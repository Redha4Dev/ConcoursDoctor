"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  CircleEllipsis,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Pen,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

// --- Types ---
interface User {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: "CORRECTOR" | "SURVEILLANT" | "JURY" | "AUDITOR" | "COORDINATOR";
  specialization: string;
  academicGrade: string;
  institution: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE"; // Kept for UI logic
}

const TeachersDashboard = () => {
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(
    null,
  );

  const [formData, setFormData] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    role: "CORRECTOR",
    specialization: "",
    academicGrade: "",
    institution: "",
  });

  // --- API Handlers ---
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/v1/users");

      // Axios usually puts the body in .data
      const data = response.data.data;
      console.log(data);

      // 1. Check if the response is directly an array
      // 2. Check if it's wrapped in a 'users' or 'data' key
      const validatedArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
            ? data.data
            : []; // Fallback to empty array if all else fails

      setUsers(validatedArray);
    } catch (error) {
      console.error("Fetch failed:", error);
      setUsers([]); // Reset to empty array on error to prevent crashes
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Force 'users' to be treated as an array even if state gets wonky
  const safeUsers = Array.isArray(users) ? users : [];

  const stats = [
    {
      label: "Total Users",
      val: safeUsers.length,
      icon: <Users size={16} />,
      color: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "Correctors",
      val: safeUsers.filter((u) => u.role === "CORRECTOR").length,
      icon: <ShieldCheck size={16} />,
      color: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Surveillants",
      val: safeUsers.filter((u) => u.role === "SURVEILLANT").length,
      icon: <CircleEllipsis size={16} />,
      color: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Juries",
      val: safeUsers.filter((u) => u.role === "JURY").length,
      icon: <Ban size={16} />,
      color: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isEditMode && selectedUserId) {
        await api.patch(`/api/v1/users/${selectedUserId}`, formData);
        
      } else {
        await api.post("/api/v1/users", formData);
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      alert("Action failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.delete(`/api/v1/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      alert("Delete failed.");
    }
  };

  // --- Modal Helpers ---
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "CORRECTOR",
      specialization: "",
      academicGrade: "",
      institution: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);
    setSelectedUserId(user.id || null);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <div className="flex font-sans flex-col items-start p-4 md:p-8 pb-[124px] gap-8 w-full min-h-full bg-[#F6F6F8]">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[30px] leading-9 tracking-tight text-[#0F172A]">
            User Management
          </h1>
          <p className="text-[14px] text-[#64748B]">
            Configure roles and academic details for the platform staff.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-[32px] text-white font-bold text-[16px] transition-all hover:shadow-indigo-200 shadow-lg"
          style={{
            background: "linear-gradient(103.23deg, #1C0087 0%, #3014B8 100%)",
          }}
        >
          <Plus size={18} />
          <span>New User</span>
        </button>
      </header>

      {/* Stats Bento */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color} ${stat.text}`}
            >
              {stat.icon}
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
          </div>
        ))}
      </section>

      {/* Table Section */}
      <section className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email or institution..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  User Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Specialization
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Institution
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {user.specialization}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {user.academicGrade}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.institution}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          onClick={() => user.id && handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[550px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans relative">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px]">
                Staff Registration
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {isEditMode ? "Update Staff Member" : "Add New Staff Member"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              {/* Row 1 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  First Name
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Last Name
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Role
                </label>
                <select
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                >
                  <option value="CORRECTOR">CORRECTOR</option>
                  <option value="SURVEILLANT">SURVEILLANT</option>
                  <option value="COORDINATOR">COORDINATOR</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Academic Grade
                </label>
                <input
                  placeholder="e.g. Professeur"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={formData.academicGrade}
                  onChange={(e) =>
                    setFormData({ ...formData, academicGrade: e.target.value })
                  }
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Specialization
                </label>
                <input
                  placeholder="e.g. AI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                  Institution
                </label>
                <input
                  placeholder="e.g. USTHB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-4 col-span-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3014B8] text-white px-10 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isEditMode ? "Save Changes" : "Confirm Addition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersDashboard;
