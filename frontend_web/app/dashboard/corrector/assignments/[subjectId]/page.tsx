"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { GradingMatrix } from "@/components/dashboard/corrector/GradingMatrix";

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = (params?.subjectId || params?.id) as string;

  // Safely evaluate if it's a UUID or if it genuinely needs splitting
  const cleanSubjectId = React.useMemo(() => {
    if (!rawId) return "";

    // Regex checking for standard 8-4-4-4-12 UUID format
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId);
    
    if (isUUID) {
      return rawId; // Keep the complete UUID string untouched
    }

    // Only fallback to segment splitting if it's not a standard UUID
    if (rawId.includes("-")) {
      const segments = rawId.split("-");
      const isMongoId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);
      return segments.find(isMongoId) || rawId;
    }

    return rawId;
  }, [rawId]);

  console.log("🔍 [GradingPage] Corrected Route Param parsing:", {
    incomingParams: params,
    detectedRawId: rawId,
    extractedCleanId: cleanSubjectId
  });

  const handleBack = () => {
    router.push("/dashboard/corrector/assignments");
  };

  if (!cleanSubjectId || cleanSubjectId === "undefined") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] p-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md text-center">
          <p className="text-red-500 font-semibold mb-2">Identifiant manquant ou invalide</p>
          <p className="text-sm text-slate-500 mb-4">
            Le paramètre de l'épreuve n'a pas pu être extrait de l'URL correctement.
          </p>
          <button 
            onClick={handleBack}
            className="text-xs font-bold text-white bg-[#3014B8] px-4 py-2 rounded-xl"
          >
            Retour aux affectations
          </button>
        </div>
      </div>
    );
  }

  return <GradingMatrix subjectId={cleanSubjectId} onBack={handleBack} />;
}