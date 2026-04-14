"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  ArrowRight, 
  ChevronLeft, 
  Lock, 
  RotateCcw, 
  ShieldCheck 
} from "lucide-react";
// Double-check this path matches your file structure!
import { api } from "@/lib/api";
import { authService } from "@/lib/auth.services";

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Clean, readable API call
      const data = await authService.forgotPassword(email);
      
      setMessage(data.message || "If an account exists, a recovery link has been sent.");
      setEmail(""); 
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-between p-6 antialiased selection:bg-brand/10">
      
      <div className="mb-8 flex flex-col items-center">
        <img 
          src="/LogoDoctora.svg" 
          alt="ConcourDoctora Logo" 
          className="h-10 object-contain"
        />
      </div>

      <main className="w-full max-w-[480px] bg-white rounded-[24px] shadow-login p-10 sm:p-12 z-10 border border-white/50 mb-auto">
        
        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <RotateCcw className="w-7 h-7 text-brand " />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Password Recovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered email to receive a recovery link.
          </p>
        </div>

        {/* Dynamic Error/Success Displays */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-xl text-center border border-green-200">
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
              Email Address
            </label>
            <div className="relative group flex items-center bg-slate-50/50 border border-slate-200 rounded-xl h-[52px] focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 focus-within:bg-white transition-all overflow-hidden">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-brand transition-colors" />
              </div>
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-brand text-white font-semibold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-70 shadow-lg shadow-brand/25 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <Link 
            href="/login/admin" 
            className="flex items-center gap-2 text-sm font-semibold text-brand hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <hr className="my-8 border-slate-100" />

        <div className="flex gap-4 items-start">
          <div className="bg-slate-100 rounded-lg p-2 mt-0.5 shrink-0">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            You will receive an email with password reset instructions shortly. 
            Please check your spam folder if it doesn't appear in your inbox.
          </p>
        </div>
      </main>

      <footer className="w-full max-w-[1200px] flex justify-between items-center text-[12px] text-muted-foreground font-medium pb-2">
        <div className="flex gap-4 items-center">
          <span>© 2026 Esi-SBA</span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
        </div>
        <ShieldCheck className="w-3.5 h-3.5 opacity-50" />
      </footer>
    </div>
  );
}