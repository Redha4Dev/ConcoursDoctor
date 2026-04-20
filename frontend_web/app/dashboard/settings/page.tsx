'use client';
import React, { useState } from 'react';
import { Edit3, Globe, Mail, Bell, ShieldCheck, Pencil, X } from 'lucide-react';
import ProfileEditModal from '@/components/dashboard/profileeditmodal';
import Toggle from '@/components/ui/costumtoggle';




const SystemSettings = () => {
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlines, setDeadlines] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-[#F8FAFC]">
      <ProfileEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

      {/* --- HEADER --- */}
      <header className="flex flex-col items-start p-8 gap-1 w-full bg-white/50 border-b border-[#E2E8F0] backdrop-blur-[6px]">
        <h1 className="font-sans font-bold text-[36px] text-[#0F172A]">System Settings</h1>
        <p className="font-sans text-[16px] text-[#64748B]">Manage your portal preferences and localization settings.</p>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex flex-col p-8 gap-12 w-full max-w-[1278px]">
        
        {/* Language Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#3014B8] rounded-sm text-white"><Globe size={16} /></div>
              <h2 className="font-bold text-[20px] text-[#0F172A]">Language</h2>
            </div>
            <p className="text-[#64748B]">Select your interface language. Arabic enables RTL support.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-6 bg-white border border-[#3014B8]/10 shadow-xl rounded-[12px]">
              <span className="block mb-4 font-bold text-[14px] tracking-widest uppercase">Select Primary Language</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setLang('EN')}
                  className={`flex-1 p-4 rounded border-2 transition-all ${lang === 'EN' ? 'bg-[#3014B8]/10 border-[#3014B8] text-[#3014B8]' : 'border-gray-100 text-[#64748B]'}`}
                >
                  <div className="text-[36px] font-bold">EN</div>
                  <div className="font-bold">English (US)</div>
                </button>
                <button 
                  onClick={() => setLang('AR')}
                  className={`flex-1 p-4 rounded border-2 transition-all ${lang === 'AR' ? 'bg-[#3014B8]/10 border-[#3014B8] text-[#3014B8]' : 'border-gray-100 text-[#64748B]'}`}
                >
                  <div className="text-[36px] font-bold">AR</div>
                  <div className="font-bold">العربية (Arabic)</div>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 bg-white border border-[#3014B8]/10 shadow-xl rounded-[12px]">
              <span className="block mb-4 font-bold text-[14px] tracking-widest uppercase">Interface Preview ({lang === 'AR' ? 'RTL' : 'LTR'})</span>
              <div className={`p-4 bg-[#F6F6F8] rounded-lg h-[145px] flex flex-col gap-4 ${lang === 'AR' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-3 w-full ${lang === 'AR' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="h-2 flex-grow bg-[#3014B8]/20 rounded" />
                  <div className="w-8 h-8 bg-[#3014B8]/20 rounded-xl" />
                </div>
                <div className={`w-[70%] h-3 bg-[#3014B8]/10 rounded ${lang === 'AR' ? 'self-start' : 'self-end'}`} />
                <div className="w-full text-center text-[10px] text-[#64748B] mt-auto">Directionality Preview</div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="p-8 bg-white border-t border-[#E2E8F0] shadow-xl rounded-[12px] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[18px]">Profile Information</h2>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#F6F6F8] rounded text-[#64748B] font-bold hover:bg-gray-200 transition-colors"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-24 h-24 bg-gray-200 rounded-[12px] border-4 border-white shadow-md overflow-hidden" />
              <div>
                <h3 className="font-bold text-[18px]">Dr. Adolf Hilter</h3>
                <p className="text-[14px] text-[#64748B]">System Administrator</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#64748B]">Email</label>
                <div className="p-3 bg-[#F1F5F9] rounded border border-[#3014B8]/10 text-[#0F172A]">a.hilter@esi-sba.dz</div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#64748B]">Role Title</label>
                <div className="p-3 bg-[#F1F5F9] rounded border border-[#3014B8]/10 text-[#0F172A]">System Administrator</div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="flex flex-col gap-4 pt-8 border-t border-[#E2E8F0]">
          <h2 className="font-bold text-[18px]">Notification Preferences</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Email Alerts', sub: 'Summaries of new applications.', state: emailAlerts, set: setEmailAlerts },
              { label: 'Review Deadlines', sub: 'Reminders for pending reviews.', state: deadlines, set: setDeadlines },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white border border-[#E2E8F0] rounded-lg">
                <div>
                  <h3 className="font-bold text-[#0F172A]">{item.label}</h3>
                  <p className="text-[14px] text-[#64748B]">{item.sub}</p>
                </div>
                <Toggle enabled={item.state} setEnabled={item.set} />
              </div>
            ))}
          </div>
        </section>

        <footer className="flex justify-end gap-4 pt-8">
          <button className="px-8 py-3 text-[#475569] font-bold hover:underline">Discard Changes</button>
          <button className="px-8 py-3 bg-[#3014B8] text-white font-bold rounded-lg shadow-lg hover:bg-[#250f91] transition-all">
            Save All Changes
          </button>
        </footer>
      </main>
    </div>
  );
};

export default SystemSettings;