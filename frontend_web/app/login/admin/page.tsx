"use client";

import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/v1/auth/login", { email, password });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans  bg-[#F4F7FF] flex flex-col justify-center items-center p-4 selection:bg-[#3014B8]/20">
      
      {/* Login Card */}
      <main className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-10 z-10">
        
        {/* Header/Logo */}
        <header className="flex flex-col items-center mb-10">
          <img 
            src="/LogoDoctora.svg" 
            alt="ConcourDoctora" 
            className="h-14 object-contain mb-2"
          />
          <p className="text-[13px] text-slate-400 font-medium tracking-wide">
            Administrator Secure Access Portal
          </p>
        </header>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Username/Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-slate-800">
              Username or Email
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400 group-focus-within:text-[#3014B8] transition-colors" />
              <input
                type="text"
                placeholder="Enter your credentials"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3014B8] focus:ring-1 focus:ring-[#3014B8]/10 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-slate-800">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400 group-focus-within:text-[#3014B8] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-10 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3014B8] focus:ring-1 focus:ring-[#3014B8]/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-[#3014B8] focus:ring-[#3014B8] cursor-pointer transition-all" 
              />
              <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-[#3014B8] hover:text-[#251090] transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-[#3014B8] text-white font-bold rounded-2xl hover:bg-[#251090] active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-[#3014B8]/20 mt-2"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Encrypted Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-50 flex justify-center items-center gap-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-[2px]">
            Encrypted Session
          </span>
        </footer>
      </main>

      {/* External Footer */}
      <footer className="mt-8 flex flex-col items-center gap-2 text-[#94A3B8]">
        <p className="text-[12px]">© 2026 Esi-SBA. All rights reserved.</p>
        <div className="flex gap-4 text-[12px] font-medium">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}