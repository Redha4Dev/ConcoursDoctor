"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardRoot() {
  const { user, isAdmin, isCoordinator, isCorrector, loading } = useAuth();
  const router = useRouter();
  console.log("🚀 ~ file: page.tsx:18 ~ DashboardRoot ~ user:", user);

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        router.replace("/dashboard/admin");
      } else if (isCoordinator) {
        router.replace("/dashboard/coordinator");
      } else if (isCorrector) {
        router.replace("/dashboard/corrector");
      } else if (user) {
        // Stop infinite loop: If user is logged in but has no valid role, don't redirect to /
        console.warn("User logged in but role unhandled:", user.role);
      } else {
        router.replace("/");
      }
    }
  }, [isAdmin, isCoordinator, isCorrector, loading, router, user]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-t-[#3b27b5] border-[#E2E8F0] animate-spin" />
        <p className="text-[#64748B] font-['Google_Sans']">Loading dashboard...</p>
      </div>
    </div>
  );
}
