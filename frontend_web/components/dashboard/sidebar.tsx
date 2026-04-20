'use client';

import Image from 'next/image';
import {
  LayoutGrid,
  Users,
  UserCog,
  ClipboardCheck,
  FileText,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <a
      href="#"
      className={`group flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200 ${
        active
          ? 'bg-[#EEEBFF] text-[#3b27b5] shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-[#3b27b5]' : 'text-slate-700'}>
        {icon}
      </span>
      {label}
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="px-8 py-6 ">
        <img 
            src="/LogoDoctora.svg" 
            alt="ConcourDoctora" 
            className="h-14 object-contain mb-2"
          />
      </div>
      <hr />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <NavItem icon={<LayoutGrid size={22} />} label="Dashboard" />
        <NavItem icon={<Users size={22} />} label="Candidates" active />
        <NavItem icon={<UserCog size={22} />} label="Manage Teachers" />
        <NavItem icon={<ClipboardCheck size={22} />} label="Correctors" />
        <NavItem icon={<FileText size={22} />} label="Exams" />
        <NavItem icon={<BarChart3 size={22} />} label="Results" />
        
        {/* Divider */}
        <div className="my-6 border-t border-slate-100 mx-2" />
        
        <NavItem icon={<Settings size={22} />} label="Settings" />
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-slate-200">
              
            </div>
            
            <div>
              <p className="text-[15px] font-bold text-slate-900 leading-tight">Dr. Alodf H.</p>
              <p className="text-xs text-slate-400 font-medium">Super Admin</p>
            </div>
          </div>
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <LogOut size={20} className="rotate-180" /> 
          </button>
        </div>
      </div>
    </aside>
  );
}