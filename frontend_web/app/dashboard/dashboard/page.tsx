import React from 'react';
import { StatCard } from '@/components/dashboard/statcard';
import { TableRow } from '@/components/dashboard/tablerow';
import { SupportCard } from '@/components/dashboard/supportcard';
import { 
  UserPlus, 
  CalendarSync, 
  Users, 
  GraduationCap, 
  History, 
  CopyPlus,
  Calculator,
  Code,
} from "lucide-react";

const DashboardOverview = () => {
  const date = new Date();
  
  // Updated to English formatting per request
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return (
    <main className="flex flex-col items-start p-0 isolate w-full min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col items-start p-8 gap-10 w-full max-w-[1280px] mx-auto z-0">
        
        {/* Welcome Section */}
        <section className="flex flex-row justify-between items-end w-full h-[69px]">
          <header className="flex flex-col items-start gap-1">
            <p className="font-['Google_Sans'] font-normal text-[16px] leading-5 text-[#64748B]">
              {formattedDate}
            </p>
            <h1 className="font-['Google_Sans'] font-bold text-[36px] leading-[45px] text-[#0F172A]">
              Welcome, Admin
            </h1>
          </header>
        </section>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <StatCard 
            label="Active Programs" 
            value="3" 
            trend="+2 ce mois" 
            trendColor="text-[#059669]" 
            bgColor="bg-[#EEF2FF]" 
            iconColor="text-[#3014B8]"
            trendDGColor="bg-[#DCFCE7] px-2 py-1 rounded-xl"
            icon={GraduationCap} 
            className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6"
          />
          <StatCard 
            label="Live Sessions" 
            value="2" 
            bgColor="bg-[#FFFBEB]" 
            iconColor="text-[#B45309]"
            icon={CalendarSync}
            className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6"
          />
          <StatCard 
            label="Imported Candidates" 
            value="147" 
            bgColor="bg-[#EFF6FF]" 
            iconColor="text-[#1D4ED8]"
            icon={UserPlus}
            className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6"
          />
          <StatCard 
            label="Registered Users" 
            value="12" 
            bgColor="bg-[#FAF5FF]" 
            iconColor="text-[#7E22CE]"
            icon={Users}
            className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Main Content Column */}
          <div className="flex flex-col gap-10 flex-grow lg:w-[65%]">
            
            {/* Recent Sessions Table Section */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-row justify-between items-center px-2">
                <h2 className="font-['Google_Sans'] font-bold text-[24px] text-[#0F172A]">Recent Sessions</h2>
                <button className="font-['Google_Sans'] font-bold text-[14px] text-[#3014B8] hover:underline">View All</button>
              </div>
              
              <div className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl overflow-hidden">
                <TableRow 
                  title="Computer Science 2025/2026" 
                  date="Created Apr 14" 
                  condidatsNumber="45"
                  status="Import Complete" 
                  badge="New"
                  icon={<Code/>}
                />
                <div className="bg-[#F8FAFC]/30">
                  <TableRow 
                    title="Mathematics Advanced Theory" 
                    date="Launched Apr 12" 
                    condidatsNumber="38" 
                    status="Examination in Progress" 
                    statusColor="text-[#059669]"
                    badge="Active"
                    icon={<Calculator/>}
                  />
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="flex flex-col gap-4">
              <h2 className="font-['Google_Sans'] font-bold text-[24px] px-2 text-[#0F172A]">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="flex flex-col items-center justify-center p-6 gap-2 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl hover:bg-white/80 transition-all border-dashed border-2">
                  <CopyPlus className="text-[#3014B8] w-6 h-6" />
                  <span className="font-['Google_Sans'] font-bold text-[14px] text-[#0F172A]">+ New Program</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 gap-2 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl hover:bg-white/80 transition-all border-dashed border-2">
                  <UserPlus className="text-[#3014B8] w-6 h-6 " />
                  <span className="font-['Google_Sans'] font-bold text-[14px] text-[#0F172A]">+ Add User</span>
                </button>
              </div>
            </section>
          </div>

          {/* Activity Sidebar */}
          <aside className="lg:w-[35%] w-full">
            <div className="bg-white border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-2xl p-6 min-h-[500px] flex flex-col">
              <div className="flex flex-row justify-between items-center mb-8">
                <h2 className="font-['Google_Sans'] font-bold text-[24px] text-[#0F172A]">
                  Recent Activity
                </h2>
                <History className="text-[#64748B] w-[18px] h-[18px]" />
              </div>
              <div className="relative pl-8 border-l-2 border-[#F6F6F8] flex flex-col gap-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#3014B8] border-4 border-white shadow-sm" />
                  <p className="font-bold text-[#0F172A]">Import Successful</p>
                  <p className="text-sm text-[#64748B]">CS Session - 2h ago</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#E2E8F0] border-4 border-white shadow-sm" />
                  <p className="font-bold text-[#0F172A]">New User</p>
                  <p className="text-sm text-[#64748B]">Corrector added - 5h ago</p>
                </div>
              </div>
              <div className="pt-8 mt-auto">
                <SupportCard /> 
              </div>

            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default DashboardOverview;
















































// import React from 'react';
// import { StatCard } from '@/components/dashboard/statcard';
// import { ProgressBar } from '@/components/dashboard/progressbar';
// import { TableRow } from '@/components/dashboard/tablerow';
// import {Search , Bell ,CircleQuestionMark ,UserPlus ,CalendarCheck ,ClipboardClock ,ShieldCheck} from "lucide-react";
// import Navbar from '@/components/dashboard/overviewnavbar';





// const DashboardOverview = () => {


//   const date = new Date();

//   const formatted = new Intl.DateTimeFormat('en-GB', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   }).format(date);

//   const finalDate = formatted.replace(',', '');
//   return (
//     <main className="flex flex-col items-start p-0 isolate w-full min-h-[1242.5px] self-stretch flex-none relative">
        
//       <div className="flex flex-col items-start px-8 py-2 gap-8 w-full h-full self-stretch z-0">
        
//         {/* Header Section */}
//         <section className="flex flex-col items-start p-0 gap-6 w-full  h-[251px] self-stretch">
//           <header className="flex flex-col items-start p-0 w-full h-[65px] self-stretch">
//             <p className="w-full h-5 font-['Google_Sans'] font-normal text-[16px] leading-5 flex items-center text-[#64748B]">
//               {finalDate}
//             </p>
//             <h1 className="w-full h-[45px] font-['Google_Sans'] font-bold text-[36px] leading-[45px] flex items-center text-[#0F172A]">
//               Welcome Admin
//             </h1>
            
//           </header>

//           {/* Stats Grid */}
//           <div className="flex flex-row justify-center items-start p-0 gap-6 w-full h-[162px] self-stretch">
//             <StatCard label="Total Candidates" value="1,240" trend="+15%" trendColor="text-[#22C55E]" bgColor="bg-[#DBEAFE]"  icon={UserPlus} />
//             <StatCard label="Exam Sessions" value="12" trend="Steady" trendColor="text-[#94A3B8]" bgColor="bg-[#F3E8FF]"  icon={CalendarCheck}/>
//             <StatCard label="Pending Grades" value="458" trend="-8%" trendColor="text-[#EF4444]" bgColor="bg-[#FFEDD5]"  icon={ClipboardClock}/>
//             <StatCard label="Correctors Registered" value="84" trend="+2%" trendColor="text-[#22C55E]" bgColor="bg-[#DCFCE7]"  icon={ShieldCheck}/>
//           </div>
//         </section>

//         {/* System Status Section */}
//         <section className="box-border flex flex-col items-start p-0 w-full  h-[161px] bg-white/50 border border-[#E2E8F0] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl self-stretch">
//           <div className="box-border flex flex-row justify-between items-center py-6 px-[24px] w-full h-[73px] border-b border-[#E2E8F0] self-stretch">
//             <h2 className="font-['Inter'] font-bold text-[18px] leading-[22px] text-[#0F172A]">System Status</h2>
//             <div className="flex flex-row items-center py-1 px-3 gap-2 bg-[#DCFCE7] rounded-full">
//               <span className="w-2 h-2 bg-[#22C55E] rounded-full"></span>
//               <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#16A34A]">Operational</span>
//             </div>
//           </div>
          
//           <div className="flex flex-row justify-center items-start p-6 gap-6 w-full h-[86px] self-stretch">
//             <ProgressBar label="Server Load" percent={24} color="bg-[#3014B8]"/>
//             <ProgressBar label="Database" percent={12} color="bg-[#22C55E]" />
//             <ProgressBar label="Storage" percent={68} color="bg-[#F97316]" />
//           </div>
//         </section>

//         {/* Table Section */}
//         <section className="box-border flex flex-col items-start p-0 w-full min-h-[610.5px] bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] rounded-xl self-stretch">
//           <div className="box-border flex flex-col items-start p-6 w-full h-[71px] border-b border-[#E2E8F0] self-stretch">
//             <h2 className="font-['Inter'] font-bold text-[18px] leading-[22px] text-[#0F172A]">Upcoming Exam Sessions</h2>
//           </div>
          
//           <div className="flex flex-col items-start p-0 w-full self-stretch">
//             {/* Table Header */}
//             <div className="box-border flex flex-row w-full border-b border-[#F1F5F9]">
//               <div className="flex-1 p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Session Title</div>
//               <div className="w-[102px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Date & Time</div>
//               <div className="w-[119px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Proctors</div>
//               <div className="w-[114px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Capacity</div>
//               <div className="w-[128px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Status</div>
//             </div>

//             {/* Table Rows */}
//             <TableRow title="Mathematics Advanced Theory" date="Oct 24, 09:00 AM" proctors="4" capacity="200/250" status="Scheduled" statusColor="text-[#2563EB] bg-[#DBEAFE]" />
//             <TableRow title="Biology Research Methodology" date="Nov 02, 10:00 AM" proctors="3" capacity="150/150" status="Full" statusColor="text-[#EA580C] bg-[#FFEDD5]" />
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// };

// export default DashboardOverview;