'use client';

import { Link as LinkIcon, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function RightWidgets() {
  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="text-[#3b27b5]" size={20} /> API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Endpoint URL</label>
            <Input readOnly value="https://api.talentcloud.com/v1/candidates" className="bg-slate-50 text-slate-500 border-slate-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">API Key</label>
            <Input type="password" readOnly value="••••••••••••••••" className="bg-slate-50 text-slate-500 border-slate-200 tracking-widest" />
          </div>
          <Button variant="secondary" className="w-full mt-2 bg-[#f0f0f9] text-[#3b27b5] hover:bg-[#e4e4f5]">
            <RefreshCw size={16} className="mr-2" /> Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Ready to Import */}
      <Card className="bg-[#31178c] text-white border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Ready to Import?</CardTitle>
          <CardDescription className="text-indigo-200 mt-2 text-sm leading-relaxed">
            We've detected 1,248 candidates from your selection. All required fields are mapped and validated.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-200 font-medium">Total Candidates</span>
            <span className="font-bold">1,248</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-200 font-medium">Source</span>
            <span className="font-bold">Excel Upload</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-200 font-medium">Mapping Score</span>
            <span className="font-bold">98%</span>
          </div>
          <Button className="w-full mt-6 bg-white text-[#31178c] hover:bg-slate-100 font-bold py-6">
            Finalize Import
          </Button>
        </CardContent>
      </Card>

      {/* Need Help Card */}
      <Card className="bg-slate-50 border-slate-200 shadow-sm">
        <CardContent className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <HelpCircle size={18} className="text-slate-500" /> Need help?
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Download our <a href="#" className="text-[#3b27b5] font-bold underline underline-offset-2">CSV Template</a> to ensure perfect data mapping every time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}