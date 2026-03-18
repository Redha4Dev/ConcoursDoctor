"use client";

import React from 'react';
import { Search, Plus, CirclePlus } from 'lucide-react';
import { MoreVertical, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { TeacherRow } from '@/components/dashboard/teacherrow';

const TeachersDashboard = () => {
  return (
    <div className="flex flex-col items-start p-8 w-full min-h-screen bg-[#F6F6F8]">
      <div className="flex flex-col items-start gap-8 w-full max-w-[1214px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-row justify-between items-end w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[36px] font-bold leading-[45px] text-[#0F172A] font-sans">
              Manage Teachers
            </h1>
            <p className="text-[16px] font-normal leading-5 text-[#64748B] font-sans">
              Onboard and oversee evaluators for active Ph.D. research contests.
            </p>
          </div>
        </header>

        {/* Registration Form Section */}
        <section className="flex flex-col items-center p-0 pb-10 gap-6 w-full bg-white border border-[#E2E8F0] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
          <div className="flex items-center p-6 w-full bg-[#F8FAFC]/50 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                <CirclePlus size={20} className="text-[#3014B8]" />
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Register New Teacher</h2>
            </div>
          </div>

          <form className="grid grid-cols-12 gap-y-6 gap-x-4 w-full px-6">
            <div className="col-span-4 flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#334155]">Full Name</label>
              <input type="text" placeholder="Dr. Sarah Mitchell" className="w-full h-12 px-4 border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#3014B8]" />
            </div>
            <div className="col-span-3 flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#334155]">Email Address</label>
              <input type="email" placeholder="s.mitchell@university.edu" className="w-full h-12 px-4 border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#3014B8]" />
            </div>
            <div className="col-span-5 flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#334155]">Roles</label>
              <div className="flex items-center h-12 gap-4">
                <label className="flex items-center gap-2 text-[14px] font-bold text-[#475569] cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#CBD5E1]" /> Corrector
                </label>
                <label className="flex items-center gap-2 text-[14px] font-bold text-[#475569] cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#CBD5E1]" /> Surveillant
                </label>
              </div>
            </div>
            <div className="col-span-4 flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#334155]">Phone Number</label>
              <div className="flex gap-2">
                <input type="text" placeholder="+213 (555) 000-0000" className="flex-1 h-12 px-4 border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#3014B8]" />
                <button type="button" className="px-6 py-2 bg-[#3014B8] text-white font-bold rounded-lg hover:bg-[#251095]">
                  Create
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Directory Table Section */}
        <section className="flex flex-col w-full bg-white border border-[#E2E8F0] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Account Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <input 
                type="text" 
                placeholder="Search teachers..." 
                className="w-[264px] h-[38px] pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none"
              />
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] text-[14px] font-bold">
                <th className="px-6 py-4">Name & ID</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              <TeacherRow 
                name="Alan Mercer" 
                id="#TEA-8821" 
                email="a.mercer@oxford.edu" 
                phone="+213 567 89 23 44" 
                initials="AM" 
                roles={['Corrector', 'Surveillant']} 
                active={true} 
              />
              <TeacherRow 
                name="Elena Kostova" 
                id="#TEA-1029" 
                email="e.kostova@mit.edu" 
                phone="+213 676 67 67 67" 
                initials="EK" 
                roles={['Corrector']} 
                active={false} 
              />
            </tbody>
          </table>
          {/* Table Footer / Pagination */}
<div className="flex flex-row justify-between items-center p-4 w-full border-t border-[#F1F5F9]">
  {/* Left: Showing count */}
  <div className="flex flex-col items-start w-[170.38px]">
    <h5 className="font-sans font-bold text-[12px] leading-[15px] flex items-center text-[#64748B]">
      Showing 3 of 42 teachers
    </h5>
  </div>

  {/* Right: Pagination Buttons */}
  <div className="flex flex-row items-start gap-[7.99px] w-[54.79px]">
    {/* Previous Button */}
    <button className="flex flex-col justify-center items-center p-2 w-[23.4px] h-7 opacity-50 rounded-[2px] hover:bg-gray-200">
      <div className="flex flex-row justify-center items-start w-[15px] h-3">
        <ChevronLeft size={20} className="text-[#64748B]" />
      </div>
    </button>

    {/* Next Button */}
    <button className="flex flex-col justify-center items-center p-2 w-[23.4px] h-7 rounded-[2px] hover:bg-gray-200">
      <div className="flex flex-row justify-center items-start w-[15px] h-3">
        <ChevronRight size={20} className="text-[#64748B]" />
      </div>
    </button>
  </div>
</div>
        </section>
      </div>
    </div>
  );
};



export default TeachersDashboard;