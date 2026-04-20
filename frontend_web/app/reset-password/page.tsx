"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation"; // Added for routing and params
import {
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { api } from "@/lib/api";
import { authService } from "@/lib/auth.services";

export default function SetNewPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract token from URL (?token=...)
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validation Logic
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }
    if (!hasMinLength || !hasNumber || !hasSpecialChar) {
      setError("Please meet all password requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Clean, readable API call
      await authService.resetPassword(token, password);

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Set a New Password
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Please choose a password you haven't used before.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl text-center border border-destructive/20">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-xl text-center border border-green-200">
            Password reset successfully! Redirecting to login...
          </div>
        )}

        {/* Warning if token is missing */}
        {!token && !success && (
          <div className="mb-6 p-3 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl text-center border border-amber-200">
            Warning: No reset token found in the URL.
          </div>
        )}

        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-foreground">
              New Password
            </label>
            <div className="relative group flex items-center bg-slate-50/80 border border-slate-200/60 rounded-xl h-[52px] focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 focus-within:bg-white transition-all overflow-hidden">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <Lock className="w-[18px] h-[18px] text-muted-foreground group-focus-within:text-brand transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                required
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="px-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-foreground">
              Confirm Password
            </label>
            <div className="relative group flex items-center bg-slate-50/80 border border-slate-200/60 rounded-xl h-[52px] focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 focus-within:bg-white transition-all overflow-hidden">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <Lock className="w-[18px] h-[18px] text-muted-foreground group-focus-within:text-brand transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="mt-2 bg-slate-50/80 border border-slate-100 rounded-xl p-5 flex flex-col gap-3">
            <RequirementItem met={hasMinLength} text="At least 8 characters" />
            <RequirementItem met={hasNumber} text="Contains a number" />
            <RequirementItem
              met={hasSpecialChar}
              text="Contains a special character"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              success ||
              !hasMinLength ||
              !hasNumber ||
              !hasSpecialChar ||
              !passwordsMatch ||
              !token
            }
            className="w-full h-[52px] bg-brand text-white font-semibold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-brand/20 mt-4"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <Link
            href="/login/admin"
            className="flex items-center gap-2 text-[13px] font-semibold text-brand hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-[1200px] flex flex-col items-center gap-3 text-[11px] text-muted-foreground font-medium pb-4 uppercase tracking-widest">
        <p>© 2026 Esi-SBA. All rights reserved.</p>
        <div className="flex gap-6 items-center">
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-3 text-[13px] transition-colors duration-300 ${met ? "text-foreground font-medium" : "text-muted-foreground"}`}
    >
      {met ? (
        <CheckCircle2 className="w-[18px] h-[18px] text-green-500" />
      ) : (
        <Circle className="w-[18px] h-[18px] opacity-40" />
      )}
      <span>{text}</span>
    </div>
  );
}
