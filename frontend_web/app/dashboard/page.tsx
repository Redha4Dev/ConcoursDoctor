"use client";

import {
  LayoutDashboard,
  Users,
  UserCog,
  CheckSquare,
  FileText,
  BarChart,
  Settings,
  LogOut,
  GraduationCap,
  CloudUpload,
  Eye,
  Link as LinkIcon,
  RefreshCw,
  HelpCircle,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/dashboard/sidebar";
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function  Dashbaord () {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const checkAuth = async () => {
      try {
        await api.get("/api/v1/auth/me"); // cookie sent automatically
        setLoading(false);
      } catch (err) {
        router.push("/login/admin"); // redirect if not authenticated
      }
    };
  const handleLogout = async (e: React.FormEvent) => {
      e.preventDefault();
  

  
      try {
        await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
        checkAuth();
        
      } catch (err: any) {
        setError(err?.response?.data?.message || "Invalid email or password");
      }
  
      setLoading(false);
    };
  

  const router = useRouter();

  useEffect(() => {
    

    checkAuth();
  }, [router]);
  return (
    <div className="flex font-sans min-h-screen bg-[#F8F9FA]  text-slate-900">
      {/* <Sidebar/> */}

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Import Candidates
          </h1>
          <p className="text-slate-500 text-sm">
            Centralize your recruitment process by importing external talent
            lists.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-8">
          <button className="flex items-center gap-2 pb-3 border-b-2 border-[#3b27b5] text-[#3b27b5] font-semibold text-sm">
            <FileUp size={16} /> File Upload
          </button>
          <button className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-700 font-medium text-sm">
            <RefreshCw size={16} /> API Sync
          </button>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (Upload & Table) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#d1d5db] bg-[#f8f9fc] rounded-xl p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-[#e0e7ff] p-4 rounded-xl mb-4 text-[#3b27b5]">
                <CloudUpload size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Drag and drop your candidate list
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Support for CSV, XLSX, and XLS formats up to 20MB.
              </p>
              <Button className="bg-[#3b27b5] hover:bg-[#321f9c] text-white px-8 py-2 rounded-md">
                Browse Files
              </Button>
            </div>

            {/* Data Preview */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-white pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="text-[#3b27b5]" size={20} /> Data Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#f8f9fa]">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-600">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Phone
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Alex Rivera</TableCell>
                      <TableCell className="text-slate-500">
                        alex.r@example.com
                      </TableCell>
                      <TableCell className="text-slate-500">
                        +1 (555) 0123
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">
                          Valid
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Jordan Smith
                      </TableCell>
                      <TableCell className="text-slate-500">
                        j.smith@web.io
                      </TableCell>
                      <TableCell className="text-slate-500">
                        +1 (555) 9876
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">
                          Valid
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sarah Chen</TableCell>
                      <TableCell className="text-slate-500">
                        sarah@chen.tech
                      </TableCell>
                      <TableCell className="text-slate-500">
                        +1 (555) 4567
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-medium">
                          Review
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Cards) */}
          <div className="space-y-6">
            {/* API Configuration */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="text-[#3b27b5]" size={20} /> API
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Endpoint URL
                  </label>
                  <Input
                    readOnly
                    value="https://api.talentcloud.com/v1/candidates"
                    className="bg-slate-50 text-slate-500 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    API Key
                  </label>
                  <Input
                    type="password"
                    readOnly
                    value="••••••••••••••••"
                    className="bg-slate-50 text-slate-500 border-slate-200 tracking-widest"
                  />
                </div>
                <Button
                  variant="secondary"
                  className="w-full mt-2 bg-[#f0f0f9] text-[#3b27b5] hover:bg-[#e4e4f5]"
                >
                  <RefreshCw size={16} className="mr-2" /> Test Connection
                </Button>
              </CardContent>
            </Card>

            {/* Ready to Import (Dark Card) */}
            <Card className="bg-[#31178c] text-white border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Ready to Import?</CardTitle>
                <CardDescription className="text-indigo-200 mt-2 text-sm leading-relaxed">
                  We've detected 1,248 candidates from your selection. All
                  required fields are mapped and validated.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200 font-medium">
                    Total Candidates
                  </span>
                  <span className="font-bold">1,248</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200 font-medium">Source</span>
                  <span className="font-bold">Excel Upload</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200 font-medium">
                    Mapping Score
                  </span>
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
                  Download our{" "}
                  <a
                    href="#"
                    className="text-[#3b27b5] font-bold underline underline-offset-2"
                  >
                    CSV Template
                  </a>{" "}
                  to ensure perfect data mapping every time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper component for Sidebar items
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#efeffd] text-[#3b27b5]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}
