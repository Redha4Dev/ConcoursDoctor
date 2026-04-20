"use client";
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  CircleEllipsis,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TeacherRow } from '@/components/dashboard/teacherrow';
import { NewUserModal } from '@/components/dashboard/NewUserModal';
import { UserActionsMenu } from '@/components/dashboard/UserActionsMenu';

const TeachersDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-start p-4 md:p-8 pb-[124px] gap-8 w-full min-h-full bg-[#F6F6F8] font-['Google_Sans']">

      {/* New User Modal */}
      <NewUserModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
        <div className="flex flex-col gap-1 max-w-[600px]">
          <div className="pt-1">
            <h1 className="font-['Manrope'] font-bold text-[30px] leading-9 tracking-[-0.75px] text-[#0F172A]">
              User Management
            </h1>
          </div>
          <p className="text-[14px] leading-[18px] text-[#64748B]">
            Manage access and permissions for the ConcoursDoctor academic team.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex flex-row items-center justify-center px-6 py-3 gap-2 min-w-[200px] h-11 bg-[#3014B8] rounded-[32px] hover:opacity-90 transition-all shrink-0"
        >
          <Plus size={18} className="text-white" />
          <span className="font-bold text-[16px] leading-5 text-white">+ New User</span>
        </button>
      </header>

      {/* Dashboard Stats Bento */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", val: "1,284", icon: <Users size={16}/>, color: "bg-[#EEF2FF]", iconCol: "text-[#4F46E5]", trend: "+12%" },
          { label: "Active", val: "1,150", icon: <ShieldCheck size={16}/>, color: "bg-[#EFF6FF]", iconCol: "text-[#2563EB]" },
          { label: "Pending", val: "42", icon: <CircleEllipsis size={16}/>, color: "bg-[#FFFBEB]", iconCol: "text-[#D97706]" },
          { label: "Inactive", val: "92", icon: <Ban size={16}/>, color: "bg-[#FFF1F2]", iconCol: "text-[#E11D48]" }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col p-6 gap-1 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl min-h-[150px] w-full">
            <div className="flex justify-between items-start w-full">
              <div className={`p-2 rounded-lg ${stat.color} ${stat.iconCol}`}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="px-2 py-1 bg-[#ECFDF5] rounded-full text-[#059669] text-[12px] font-bold font-inter">
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="pt-3">
              <p className="text-[14px] text-[#64748B]">{stat.label}</p>
              <h3 className="text-[24px] font-bold text-[#0F172A]">{stat.val}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Filters & Table Section */}
      <section className="flex flex-col w-full bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl overflow-hidden">

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center p-6 gap-4 border-b border-[#F6F6F8]">
          <div className="relative w-full lg:flex-grow">
            <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full h-[43px] pl-10 pr-4 bg-white border border-[#F6F6F8] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3014B8]/20"
            />
          </div>

          <div className="flex flex-row items-center gap-4 w-full lg:w-auto">
            {/* Role Filter */}
            <div className="flex flex-col gap-1 flex-1 lg:w-[125px]">
              <span className="pl-1 text-[12px] font-bold text-[#64748B]">Role</span>
              <div className="relative h-[42px] bg-white border border-[#F6F6F8] rounded-lg px-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-[14px] text-[#0F172A]">All</span>
                <Filter size={14} className="text-[#64748B]" />
              </div>
            </div>
            {/* Status Filter */}
            <div className="flex flex-col gap-1 flex-1 lg:w-[76px]">
              <span className="pl-1 text-[12px] font-bold text-[#64748B]">Status</span>
              <div className="relative h-[42px] bg-white border border-[#F6F6F8] rounded-lg px-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-[14px] text-[#0F172A]">All</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-[#F8FAFC]">
                <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Name</th>
                <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Email</th>
                <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Role</th>
                <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Status</th>
                <th className="px-6 py-5 text-right font-bold text-[14px] text-[#64748B]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              <TeacherRow
                name="Alan Mercer"
                id="#TEA-8821"
                email="a.mercer@oxford.edu"
                phone="+213 567 89 23 44"
                initials="AM"
                roles={['Corrector', 'Proctor']}
                active={true}
                actionsMenu={<UserActionsMenu />}
              />
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <footer className="flex justify-between items-center p-4 border-t border-[#F1F5F9] w-full">
          <span className="text-[12px] font-bold text-[#64748B]">
            Showing 3 of 42 users
          </span>
          <div className="flex gap-2">
            <button className="p-2 opacity-50 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeft size={20} className="text-[#64748B]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronRight size={20} className="text-[#64748B]" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default TeachersDashboard;



















// "use client";
// import React from 'react';
// import { 
//   Search, 
//   Plus, 
//   Users, 
//   ShieldCheck, 
//   CircleEllipsis, 
//   Ban, 
//   ChevronLeft, 
//   ChevronRight, 
//   Filter 
// } from 'lucide-react';
// import { TeacherRow } from '@/components/dashboard/teacherrow';

// const TeachersDashboard = () => {
//   return (
//     <div className="flex flex-col items-start p-4 md:p-8 pb-[124px] gap-8 w-full min-h-full bg-[#F6F6F8] font-['Google_Sans']">
      
//       {/* Page Header */}
//       <header className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
//         <div className="flex flex-col gap-1 max-w-[600px]">
//           <div className="pt-1">
//             <h1 className="font-['Manrope'] font-bold text-[30px] leading-9 tracking-[-0.75px] text-[#0F172A]">
//               User Management
//             </h1>
//           </div>
//           <p className="text-[14px] leading-[18px] text-[#64748B]">
//             Manage access and permissions for the ConcoursDoctor academic team.
//           </p>
//         </div>
        
//         <button className="flex flex-row items-center justify-center px-6 py-3 gap-2 min-w-[200px] h-11 bg-[#3014B8] rounded-[32px] hover:opacity-90 transition-all shrink-0">
//           <Plus size={18} className="text-white" />
//           <span className="font-bold text-[16px] leading-5 text-white">+ New User</span>
//         </button>
//       </header>

//       {/* Dashboard Stats Bento */}
//       <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {[
//           { label: "Total Users", val: "1,284", icon: <Users size={16}/>, color: "bg-[#EEF2FF]", iconCol: "text-[#4F46E5]", trend: "+12%" },
//           { label: "Active", val: "1,150", icon: <ShieldCheck size={16}/>, color: "bg-[#EFF6FF]", iconCol: "text-[#2563EB]" },
//           { label: "Pending", val: "42", icon: <CircleEllipsis size={16}/>, color: "bg-[#FFFBEB]", iconCol: "text-[#D97706]" },
//           { label: "Inactive", val: "92", icon: <Ban size={16}/>, color: "bg-[#FFF1F2]", iconCol: "text-[#E11D48]" }
//         ].map((stat, i) => (
//           <div key={i} className="flex flex-col p-6 gap-1 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl min-h-[150px] w-full">
//             <div className="flex justify-between items-start w-full">
//               <div className={`p-2 rounded-lg ${stat.color} ${stat.iconCol}`}>
//                 {stat.icon}
//               </div>
//               {stat.trend && (
//                 <span className="px-2 py-1 bg-[#ECFDF5] rounded-full text-[#059669] text-[12px] font-bold font-inter">
//                   {stat.trend}
//                 </span>
//               )}
//             </div>
//             <div className="pt-3">
//               <p className="text-[14px] text-[#64748B]">{stat.label}</p>
//               <h3 className="text-[24px] font-bold text-[#0F172A]">{stat.val}</h3>
//             </div>
//           </div>
//         ))}
//       </section>

//       {/* Filters & Table Section */}
//       <section className="flex flex-col w-full bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl overflow-hidden">
        
//         {/* Filter Bar */}
//         <div className="flex flex-col lg:flex-row items-start lg:items-center p-6 gap-4 border-b border-[#F6F6F8]">
//           <div className="relative w-full lg:flex-grow">
//             <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
//             <input 
//               type="text" 
//               placeholder="Search by name or email..." 
//               className="w-full h-[43px] pl-10 pr-4 bg-white border border-[#F6F6F8] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3014B8]/20"
//             />
//           </div>

//           <div className="flex flex-row items-center gap-4 w-full lg:w-auto">
//             {/* Role Filter */}
//             <div className="flex flex-col gap-1 flex-1 lg:w-[125px]">
//               <span className="pl-1 text-[12px] font-bold text-[#64748B]">Role</span>
//               <div className="relative h-[42px] bg-white border border-[#F6F6F8] rounded-lg px-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
//                 <span className="text-[14px] text-[#0F172A]">All</span>
//                 <Filter size={14} className="text-[#64748B]" />
//               </div>
//             </div>
//             {/* Status Filter */}
//             <div className="flex flex-col gap-1 flex-1 lg:w-[76px]">
//               <span className="pl-1 text-[12px] font-bold text-[#64748B]">Status</span>
//               <div className="relative h-[42px] bg-white border border-[#F6F6F8] rounded-lg px-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
//                 <span className="text-[14px] text-[#0F172A]">All</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Area */}
//         <div className="w-full overflow-x-auto">
//           <table className="w-full border-collapse min-w-[800px]">
//             <thead>
//               <tr className="bg-white border-b border-[#F8FAFC]">
//                 <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Name</th>
//                 <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Email</th>
//                 <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Role</th>
//                 <th className="px-6 py-5 text-left font-bold text-[14px] text-[#64748B]">Status</th>
//                 <th className="px-6 py-5 text-right font-bold text-[14px] text-[#64748B]">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-[#F8FAFC]">
//               <TeacherRow 
//                 name="Alan Mercer" 
//                 id="#TEA-8821" 
//                 email="a.mercer@oxford.edu" 
//                 phone="+213 567 89 23 44" 
//                 initials="AM" 
//                 roles={['Corrector', 'Proctor']} 
//                 active={true} 
//               />
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Footer */}
//         <footer className="flex justify-between items-center p-4 border-t border-[#F1F5F9] w-full">
//           <span className="text-[12px] font-bold text-[#64748B]">
//             Showing 3 of 42 users
//           </span>
//           <div className="flex gap-2">
//             <button className="p-2 opacity-50 hover:bg-gray-100 rounded-md transition-colors">
//               <ChevronLeft size={20} className="text-[#64748B]" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
//               <ChevronRight size={20} className="text-[#64748B]" />
//             </button>
//           </div>
//         </footer>
//       </section>
//     </div>
//   );
// };

// export default TeachersDashboard;