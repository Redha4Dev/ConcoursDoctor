"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'COORDINATOR' | 'CORRECTOR')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAdmin, isCoordinator, isCorrector, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      const canAccess =
        (allowedRoles.includes('ADMIN') && isAdmin) ||
        (allowedRoles.includes('COORDINATOR') && isCoordinator) ||
        (allowedRoles.includes('CORRECTOR') && isCorrector);

      if (!canAccess) {
        router.replace("/dashboard");
      } else {
        setAuthorized(true);
      }
    }
  }, [isAdmin, isCoordinator, isCorrector, loading, allowedRoles, router]);

  if (loading || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-[#3b27b5] border-[#E2E8F0] animate-spin" />
          <p className="text-[#64748B] font-['Google_Sans']">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
