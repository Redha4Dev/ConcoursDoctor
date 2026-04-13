"use client";

import {
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

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // add this at top
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // drag states
  const [isDragging, setIsDragging] = useState(false);

  // 🔐 Check authentication
  const checkAuth = async () => {
    try {
      await api.get("/api/v1/auth/me");
    } catch (err) {
      router.push("/login/admin");
    }
  };

  // 🚪 Logout
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/api/v1/auth/logout");
      router.push("/login/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Logout failed");
    }
  };

  // 📤 Upload CSV
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        "/api/v1/candidates/82dc12f1-f2f2-41aa-bcd0-bf91569ba275/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("✅ Candidates imported successfully");
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message || "❌ Import failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-900">
      <main className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Candidates</h1>
          <p className="text-slate-500 text-sm">
            Import candidates using CSV file.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-8">
          <button className="flex items-center gap-2 pb-3 border-b-2 border-[#3b27b5] text-[#3b27b5] font-semibold text-sm">
            <FileUp size={16} /> File Upload
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-8">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-16 text-center transition ${
                isDragging
                  ? "border-[#3b27b5] bg-[#eef2ff]"
                  : "border-[#d1d5db]"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);

                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.type === "text/csv") {
                  setFile(droppedFile);
                } else {
                  setMessage("Only CSV files are allowed");
                }
              }}
            >
              <div className="mb-4 text-[#3b27b5] flex justify-center">
                <CloudUpload size={32} />
              </div>

              <h3 className="font-bold mb-2">Drag & drop your CSV file here</h3>

              <p className="text-sm text-slate-500 mb-4">or click to browse</p>

              {/* hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) setFile(selectedFile);
                }}
              />

              {/* click area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="inline-block cursor-pointer"
              >
                <Button type="button">Browse Files</Button>
              </div>

              {/* file name */}
              {file && (
                <p className="mt-4 text-sm text-slate-600">📄 {file.name}</p>
              )}

              {/* message */}
              {message && (
                <p className="mt-4 text-sm text-red-500">{message}</p>
              )}
            </div>

            {/* Preview (still static) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Eye size={18} /> Preview
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell>Example User</TableCell>
                      <TableCell>example@mail.com</TableCell>
                      <TableCell>
                        <Badge>Preview</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Import Card */}
            <Card className="bg-[#31178c] text-white">
              <CardHeader>
                <CardTitle>Ready to Import?</CardTitle>
                <CardDescription className="text-indigo-200">
                  Upload your CSV and import candidates.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-white text-[#31178c]"
                >
                  {loading ? "Uploading..." : "Finalize Import"}
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 font-bold">
                  <HelpCircle size={16} /> Need help?
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Upload a valid CSV file with correct format.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
