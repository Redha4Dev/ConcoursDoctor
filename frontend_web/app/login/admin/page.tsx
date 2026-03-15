"use client"; 
import React , { useState } from 'react';
import { Lock, Mail, Eye, EyeOff , ShieldCheck } from 'lucide-react'; // Using Lucide for the icons

export default function AdminLogin () {

    // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#F6F6F8] overflow-hidden isolate">
      
      {/* Background Decorative Blurs */}
      <div className="absolute -left-24 -top-24 w-96 h-96 bg-[#3014B8] opacity-5 blur-[32px] rounded-[12px] z-0" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#3014B8] opacity-5 blur-[32px] rounded-[12px] z-0" />

      {/* Main Card Container */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-[480px] bg-white shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-[12px] overflow-hidden">
        
        {/* Header Section */}
        <header className="flex flex-col items-center pt-10 pb-6 w-full border-b border-white">
          <div className="mb-4 p-3 bg-[#3014B8]/10 rounded-[12px]">
            <ShieldCheck className="w-8 h-7 text-[#3014B8]" />
          </div>
          <h1 className="font-['Inter'] font-bold text-[18px] leading-[22px] text-[#0F172A] text-center px-6">
            Ph.D. Contest Management
          </h1>
          <p className="mt-1 font-['Google_Sans'] font-normal text-[14px] leading-[18px] text-[#64748B]">
            Administrator Secure Access Portal
          </p>
        </header>

        {/* Form Section */}
        <div className="flex flex-col gap-8 p-8 w-full">
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Username/Email Input */}
            <div className="flex flex-col gap-2">
              <label className="font-['Google_Sans'] font-bold text-[14px] text-[#0F172A]">
                Username or Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#64748B]" />
                </span>
                <input 
                  type="text" 
                  placeholder="Enter your credentials"
                  className="w-full h-[49px] pl-10 pr-3 py-[14px] bg-white border-[1.5px] border-[#3014B8]/10 rounded-[12px] font-['Google_Sans'] text-[14px] text-[#0F172A] focus:outline-none focus:border-[#3014B8] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="font-['Google_Sans'] font-bold text-[14px] text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#64748B]" />
                </span>
                <input 
                  // Dynamically switch type between 'password' and 'text'
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full h-[49px] px-10 py-[14px] bg-white border border-[#3014B8]/10 rounded-[12px] font-['Inter'] text-[16px] text-[#64748B] focus:outline-none focus:border-[#3014B8] transition-colors"
                />
                
                {/* Visibility Toggle Button */}
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#3014B8] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center w-full">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded-[2px] border-[#3014B8]/10 accent-[#3014B8] cursor-pointer" 
                />
                <span className="font-['Google_Sans'] text-[14px] text-[#64748B] group-hover:text-[#0F172A] transition-colors">Remember me</span>
              </label>
              <a href="#" className="font-['Google_Sans'] font-bold text-[14px] text-[#3014B8] hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button className="w-full h-[48px] bg-[#3014B8] text-white font-['Google_Sans'] font-bold text-[16px] rounded-[32px] shadow-sm hover:bg-[#261096] transition-all transform active:scale-[0.98]">
              Log In
            </button>
          </form>

          {/* Footer Info */}
          <div className="pt-6 border-t border-[#F6F6F8] flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-[8px] h-[10px] text-[#64748B]" />
                <span className="font-['Inter'] text-[12px] text-[#64748B] uppercase">
                    Secure Encryption
                </span>
            </div>
          </div>
        </div>
      </main>

      <div className="flex flex-col items-center gap-2 mt-8">
              <p className="font-['Inter'] text-[12px] text-[#64748B]">
                © 2026 Esi-SBA. All rights reserved.
              </p>
              <div className="flex gap-4 font-['Inter'] text-[12px] text-[#64748B]">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Support</a>
              </div>
     </div>
    </div>
  );
};
