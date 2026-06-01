"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, Users } from "lucide-react";

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  
  const date = new Date();
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
              Welcome, {user?.firstName || 'Coordinator'}
            </h1>
          </header>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="flex items-center gap-4 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6">
            <div className="p-4 rounded-full bg-[#FFFBEB] text-[#B45309]">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] font-semibold uppercase tracking-wider">My Managed Sessions</p>
              <h2 className="text-3xl font-bold text-[#0F172A]">3 Active</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-6">
            <div className="p-4 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] font-semibold uppercase tracking-wider">Staff Under Supervision</p>
              <h2 className="text-3xl font-bold text-[#0F172A]">24 Staff</h2>
            </div>
          </div>
        </div>

        {/* Sessions Placeholder */}
        <section className="flex flex-col gap-6 w-full">
          <h2 className="font-['Google_Sans'] font-bold text-[24px] text-[#0F172A] px-2">Upcoming Sessions</h2>
          <div className="bg-white/50 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <CalendarDays className="w-12 h-12 text-[#94A3B8] mb-4" />
            <h3 className="text-xl font-bold text-[#0F172A]">No sessions this week</h3>
            <p className="text-[#64748B] max-w-md mt-2">You currently do not have any active sessions requiring coordination this week.</p>
          </div>
        </section>

      </div>
    </main>
  );
}
