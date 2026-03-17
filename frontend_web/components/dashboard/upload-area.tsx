'use client';

import { CloudUpload } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function UploadArea() {
  return (
    <div className="border-2 border-dashed border-[#d1d5db] bg-[#f8f9fc] rounded-xl p-16 flex flex-col items-center justify-center text-center">
      <div className="bg-[#e0e7ff] p-4 rounded-xl mb-4 text-[#3b27b5]">
        <CloudUpload size={32} />
      </div>
      <h3 className="text-lg font-bold mb-2">Drag and drop your candidate list</h3>
      <p className="text-slate-500 text-sm mb-6">Support for CSV, XLSX, and XLS formats up to 20MB.</p>
      <Button className="bg-[#3b27b5] hover:bg-[#321f9c] text-white px-8 py-2 rounded-md">
        Browse Files
      </Button>
    </div>
  );
}