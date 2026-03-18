import React from 'react';
import { StatCard } from '@/components/dashboard/statcard';
import { ProgressBar } from '@/components/dashboard/progressbar';
import { TableRow } from '@/components/dashboard/tablerow';
import {Search , Bell ,CircleQuestionMark ,UserPlus ,CalendarCheck ,ClipboardClock ,ShieldCheck} from "lucide-react";
import Navbar from '@/components/dashboard/overviewnavbar';





const DashboardOverview = () => {
  return (
    <main className="flex flex-col items-start p-0 isolate w-full min-h-[1242.5px] self-stretch flex-none relative">
        <Navbar />
      <div className="flex flex-col items-start py-[82px] px-8 gap-8 w-full h-full self-stretch z-0">
        
        {/* Header Section */}
        <section className="flex flex-col items-start p-0 gap-6 w-full  h-[251px] self-stretch">
          <header className="flex flex-col items-start p-0 w-full h-[65px] self-stretch">
            <h1 className="w-full h-[45px] font-['Google_Sans'] font-bold text-[36px] leading-[45px] flex items-center text-[#0F172A]">
              Dashboard Overview
            </h1>
            <p className="w-full h-5 font-['Google_Sans'] font-normal text-[16px] leading-5 flex items-center text-[#64748B]">
              Academic session 2025-2026 Contest Management
            </p>
          </header>

          {/* Stats Grid */}
          <div className="flex flex-row justify-center items-start p-0 gap-6 w-full h-[162px] self-stretch">
            <StatCard label="Total Candidates" value="1,240" trend="+15%" trendColor="text-[#22C55E]" bgColor="bg-[#DBEAFE]"  icon={UserPlus} />
            <StatCard label="Exam Sessions" value="12" trend="Steady" trendColor="text-[#94A3B8]" bgColor="bg-[#F3E8FF]"  icon={CalendarCheck}/>
            <StatCard label="Pending Grades" value="458" trend="-8%" trendColor="text-[#EF4444]" bgColor="bg-[#FFEDD5]"  icon={ClipboardClock}/>
            <StatCard label="Correctors Registered" value="84" trend="+2%" trendColor="text-[#22C55E]" bgColor="bg-[#DCFCE7]"  icon={ShieldCheck}/>
          </div>
        </section>

        {/* System Status Section */}
        <section className="box-border flex flex-col items-start p-0 w-full  h-[161px] bg-white/50 border border-[#E2E8F0] shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl self-stretch">
          <div className="box-border flex flex-row justify-between items-center py-6 px-[24px] w-full h-[73px] border-b border-[#E2E8F0] self-stretch">
            <h2 className="font-['Inter'] font-bold text-[18px] leading-[22px] text-[#0F172A]">System Status</h2>
            <div className="flex flex-row items-center py-1 px-3 gap-2 bg-[#DCFCE7] rounded-full">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full"></span>
              <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#16A34A]">Operational</span>
            </div>
          </div>
          
          <div className="flex flex-row justify-center items-start p-6 gap-6 w-full h-[86px] self-stretch">
            <ProgressBar label="Server Load" percent={24} color="bg-[#3014B8]"/>
            <ProgressBar label="Database" percent={12} color="bg-[#22C55E]" />
            <ProgressBar label="Storage" percent={68} color="bg-[#F97316]" />
          </div>
        </section>

        {/* Table Section */}
        <section className="box-border flex flex-col items-start p-0 w-full min-h-[610.5px] bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] rounded-xl self-stretch">
          <div className="box-border flex flex-col items-start p-6 w-full h-[71px] border-b border-[#E2E8F0] self-stretch">
            <h2 className="font-['Inter'] font-bold text-[18px] leading-[22px] text-[#0F172A]">Upcoming Exam Sessions</h2>
          </div>
          
          <div className="flex flex-col items-start p-0 w-full self-stretch">
            {/* Table Header */}
            <div className="box-border flex flex-row w-full border-b border-[#F1F5F9]">
              <div className="flex-1 p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Session Title</div>
              <div className="w-[102px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Date & Time</div>
              <div className="w-[119px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Proctors</div>
              <div className="w-[114px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Capacity</div>
              <div className="w-[128px] p-6 font-['Google_Sans'] font-bold text-sm text-[#64748B]">Status</div>
            </div>

            {/* Table Rows */}
            <TableRow title="Mathematics Advanced Theory" date="Oct 24, 09:00 AM" proctors="4" capacity="200/250" status="Scheduled" statusColor="text-[#2563EB] bg-[#DBEAFE]" />
            <TableRow title="Biology Research Methodology" date="Nov 02, 10:00 AM" proctors="3" capacity="150/150" status="Full" statusColor="text-[#EA580C] bg-[#FFEDD5]" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardOverview;