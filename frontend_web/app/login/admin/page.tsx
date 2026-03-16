"use client";

import React, { useState } from "react";
import axios from "axios";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#F6F6F8] overflow-hidden isolate">
      <div className="absolute -left-24 -top-24 w-96 h-96 bg-[#3014B8] opacity-5 blur-[32px] rounded-[12px] z-0" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#3014B8] opacity-5 blur-[32px] rounded-[12px] z-0" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-[480px] bg-white shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-[12px] overflow-hidden">
        <header className="flex flex-col items-center pt-10 pb-6 w-full border-b border-white">
          <div className="mb-4 p-3 bg-[#3014B8]/10 rounded-[12px]">
            <ShieldCheck className="w-8 h-7 text-[#3014B8]" />
          </div>

          <h1 className="font-bold text-[18px] text-[#0F172A] text-center px-6">
            Ph.D. Contest Management
          </h1>

          <p className="mt-1 text-[14px] text-[#64748B]">
            Administrator Secure Access Portal
          </p>
        </header>

        <div className="flex flex-col gap-8 p-8 w-full">
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] text-[#0F172A]">
                Username or Email
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-4 w-4 text-[#64748B]" />
                </span>

                <input
                  type="text"
                  placeholder="Enter your credentials"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[49px] pl-10 pr-3 bg-white border-[1.5px] border-[#3014B8]/10 rounded-[12px] text-[14px] text-[#0F172A] focus:outline-none focus:border-[#3014B8]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] text-[#0F172A]">
                Password
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-4 w-4 text-[#64748B]" />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[49px] px-10 bg-white border border-[#3014B8]/10 rounded-[12px] text-[16px] text-[#64748B] focus:outline-none focus:border-[#3014B8]"
                />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#64748B]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#64748B]" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Remember */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#3014B8]" />
                <span className="text-[14px] text-[#64748B]">Remember me</span>
              </label>

              <a href="#" className="font-bold text-[14px] text-[#3014B8]">
                Forgot Password?
              </a>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full h-[48px] bg-[#3014B8] text-white font-bold text-[16px] rounded-[32px] hover:bg-[#261096]"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="pt-6 border-t border-[#F6F6F8] flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-[10px] h-[10px] text-[#64748B]" />
              <span className="text-[12px] text-[#64748B] uppercase">
                Secure Encryption
              </span>
            </div>
          </div>
        </div>
      </main>

      <div className="flex flex-col items-center gap-2 mt-8">
        <p className="text-[12px] text-[#64748B]">
          © 2026 Esi-SBA. All rights reserved.
        </p>

        <div className="flex gap-4 text-[12px] text-[#64748B]">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
