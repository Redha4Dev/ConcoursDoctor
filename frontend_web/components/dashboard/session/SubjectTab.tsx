"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api"; 
import {
  Book,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  X,
  Loader2,
} from "lucide-react";

type Subject = {
  id?: string | number;
  name: string;
  coefficient: number;
  maxGrade: number;
  minimumGrade: number;
};

export default function SubjectsPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Data & UI States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Submission States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState<Subject>({
    name: "",
    coefficient: 1,
    maxGrade: 20,
    minimumGrade: 10,
  });

  // --- API Handlers ---

  const fetchSubjects = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/v1/sessions/${sessionId}/subjects`);
      
      // Defensive check for different API response structures
      if (Array.isArray(data)) {
        setSubjects(data);
      } else if (data && Array.isArray(data.data)) {
        setSubjects(data.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string | number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette matière ?")) return;
    
    try {
      await api.delete(`/api/v1/sessions/${sessionId}/subjects/${subjectId}`);
      // You can also change this to `await fetchSubjects()` if you want the delete to refresh from the server too
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: newSubject.name,
        coefficient: Number(newSubject.coefficient),
        maxGrade: Number(newSubject.maxGrade),
        minimumGrade: Number(newSubject.minimumGrade),
      };

      if (editingSubject?.id) {
        // PATCH existing subject
        await api.patch(
          `/api/v1/sessions/${sessionId}/subjects/${editingSubject.id}`,
          payload
        );
      } else {
        // POST new subject
        await api.post(
          `/api/v1/sessions/${sessionId}/subjects`,
          payload
        );
      }

      // Fetch all subjects again to ensure state perfectly matches the database
      await fetchSubjects();

      closeModal();
    } catch (error) {
      console.error("Error saving subject:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper Functions ---

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject(subject);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setNewSubject({ name: "", coefficient: 1, maxGrade: 20, minimumGrade: 10 });
  };

  useEffect(() => {
    fetchSubjects();
  }, [sessionId]);

  // --- Derived Data ---

  const totalSubjects = subjects.length;
  const totalCoefficient = Array.isArray(subjects) 
    ? subjects.reduce((acc, curr) => acc + Number(curr.coefficient || 0), 0)
    : 0;

  const filteredSubjects = subjects.filter((subject) =>
    (subject?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-sans relative">
      {/* Stats Cards */}
      <div className="flex flex-row gap-6 w-full">
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h3 className="text-[12px] font-bold text-[#3014B8] tracking-wide uppercase mb-1">Total Matières</h3>
          <p className="text-[32px] font-bold text-[#0F172A] leading-none">{isLoading ? "..." : totalSubjects}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
          <h3 className="text-[12px] font-bold text-[#3014B8] tracking-wide uppercase mb-1">Coefficient Total</h3>
          <p className="text-[32px] font-bold text-[#0F172A] leading-none">{isLoading ? "..." : totalCoefficient.toFixed(1)}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden flex flex-col">
        <div className="flex flex-row items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-[22px] font-bold text-[#0F172A]">Matières enregistrées</h2>
          <div className="flex flex-row items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#3014B8] hover:bg-[#250f96] transition-colors text-white px-5 py-2.5 rounded-full text-[14px] font-bold"
            >
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

        {/* Table Headers */}
        <div className="flex flex-row items-center bg-[#F8F9FA] px-8 py-3 border-b border-slate-100">
          <div className="flex-[2] text-[12px] font-bold text-slate-500 uppercase tracking-wider">Nom de la Matière</div>
          <div className="flex-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">Coefficient</div>
          <div className="flex-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right pr-4">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-[#3014B8]" size={32} /></div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-500 text-[14px]">Aucune matière trouvée.</div>
          ) : (
            filteredSubjects.map((subject) => (
              <div key={subject.id} className="flex flex-row items-center px-8 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <div className="flex-[2] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] flex items-center justify-center text-[#3014B8]"><Database size={18} /></div>
                  <span className="text-[15px] font-bold text-[#0F172A]">{subject.name}</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="bg-[#F0EEFF] text-[#3014B8] text-[13px] font-bold px-3 py-1 rounded-full">{subject.coefficient}</span>
                </div>
                <div className="flex-1 flex items-center justify-end gap-3 pr-4">
                  <button onClick={() => openEditModal(subject)} className="p-2 text-slate-400 hover:text-[#3014B8] transition-colors rounded-lg hover:bg-slate-100">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => subject.id && handleDeleteSubject(subject.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-[20px] font-bold text-[#0F172A]">
                {editingSubject ? "Modifier la Matière" : "Ajouter une Matière"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Nom de la matière</label>
                <input
                  type="text"
                  required
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                  placeholder="ex: Génie Logiciel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Coefficient</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newSubject.coefficient}
                    onChange={(e) => setNewSubject({ ...newSubject, coefficient: parseFloat(e.target.value) })}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Note Min. (Valid.)</label>
                  <input
                    type="number"
                    required
                    value={newSubject.minimumGrade}
                    onChange={(e) => setNewSubject({ ...newSubject, minimumGrade: parseFloat(e.target.value) })}
                    className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Note Max</label>
                <input
                  type="number"
                  required
                  value={newSubject.maxGrade}
                  onChange={(e) => setNewSubject({ ...newSubject, maxGrade: parseFloat(e.target.value) })}
                  className="w-full bg-[#F6F6F8] border-none rounded-xl py-3 px-4 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-[#3014B8]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">Annuler</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#3014B8] hover:bg-[#250f96] disabled:opacity-70 flex items-center gap-2 transition-colors"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingSubject ? "Mettre à jour" : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}