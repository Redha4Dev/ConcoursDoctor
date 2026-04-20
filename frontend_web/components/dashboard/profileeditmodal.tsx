import React from 'react';
import { Pencil } from 'lucide-react';

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ isOpen, onClose }: ProfileEditProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* --- Main Modal Container --- */}
      <div className="relative flex flex-row items-start p-[40px_75px] gap-32 w-[950px] h-[650px] bg-[#F4F4F4]/75 backdrop-blur-[10px] rounded-[32px] overflow-hidden shadow-2xl">
        
        {/* Close Button (Helper) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-[#64748B] hover:text-[#0F172A] font-bold"
        >
          ✕
        </button>

        {/* --- Form Wrapper (Frame 138) --- */}
        <div className="flex flex-col items-start p-0 gap-4 w-[800px] h-[570px]">
          
          {/* Row 1: Name Fields (Frame 86) */}
          <div className="flex flex-row items-start p-0 gap-10 w-full">
            {/* First Name */}
            <div className="flex flex-col items-start gap-1 w-[380px]">
              <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">First name</label>
              <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
                <span className="font-['SF_Pro'] font-normal text-[16px] text-[#64748B]">Alodf</span>
                <Pencil size={18} className="text-[#64748B]" />
              </div>
            </div>
            {/* Family Name */}
            <div className="flex flex-col items-start gap-1 w-[380px]">
              <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Family name</label>
              <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
                <span className="font-['SF_Pro'] font-normal text-[16px] text-[#64748B]">Hilter</span>
                <Pencil size={18} className="text-[#64748B]" />
              </div>
            </div>
          </div>

          {/* Mobile Field */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Mobile</label>
            <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
              <span className="font-['SF_Pro'] font-normal text-[16px] text-[#64748B]">+213 *******67</span>
              <Pencil size={18} className="text-[#64748B]" />
            </div>
          </div>

          {/* Role Title Field */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Role Title</label>
            <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
              <span className="font-['SF_Pro'] font-normal text-[16px] text-[#64748B]">System Administrator</span>
              <Pencil size={18} className="text-[#64748B]" />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Email</label>
            <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
              <span className="font-['SF_Pro'] font-normal text-[16px] text-black/35">exemple@gmail.com</span>
              <Pencil size={18} className="text-[#64748B]" />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Password</label>
            <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
              <span className="font-['SF_Pro'] font-normal text-[16px] text-black/35">********</span>
              <Pencil size={18} className="text-[#64748B]" />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label className="font-['SF_Pro'] font-[590] text-[16px] text-[#0F172A]">Confirm password</label>
            <div className="flex flex-row justify-between items-center p-[10px] w-full h-[44px] bg-[#F6F6F8]/40 border-b border-[#3014B8]">
              <span className="font-['SF_Pro'] font-normal text-[16px] text-black/35">******</span>
              <Pencil size={18} className="text-[#64748B]" />
            </div>
          </div>

          {/* --- Action Button (Continue) --- */}
          <div className="mt-4 flex flex-row justify-center w-full">
            <button 
              onClick={onClose}
              className="flex flex-row justify-center items-center p-[10px] w-[300px] h-[64px] bg-[#3014B8] rounded-[16px] hover:bg-[#250f91] transition-all shadow-lg"
            >
              <span className="font-['SF_Pro'] font-[590] text-[24px] text-[#F4F4F4]">
                continue
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;