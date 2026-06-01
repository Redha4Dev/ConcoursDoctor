"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { GradingMatrix } from "@/components/dashboard/corrector/GradingMatrix";

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();

  // 🌟 Extraction directe et propre grâce au dossier /[sessionId]/[subjectId]
  const sessionId = params?.sessionId as string;
  const subjectId = params?.subjectId as string;

  console.log("🔍 [GradingPage] Route Parameters:", {
    sessionId,
    subjectId,
  });

  const handleBack = () => {
    router.push("/dashboard/corrector/assignments");
  };

  // Sécurité si l'un des deux paramètres est corrompu ou manquant
  if (!subjectId || !sessionId || subjectId === "undefined" || sessionId === "undefined") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] p-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md text-center">
          <p className="text-red-500 font-semibold mb-2">Identifiants manquants ou invalides</p>
          <p className="text-sm text-slate-500 mb-4">
            La session ou l'épreuve n'a pas pu être extraite correctement de l'URL.
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

  // 🌟 On transmet à la fois le subjectId ET le sessionId au composant de notation
  return <GradingMatrix subjectId={subjectId} sessionId={sessionId} onBack={handleBack} />;
}