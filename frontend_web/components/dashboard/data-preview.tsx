'use client';

import { Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DataPreview() {
  const candidates = [
    { name: "Alex Rivera", email: "alex.r@example.com", phone: "+1 (555) 0123", status: "Valid" },
    { name: "Jordan Smith", email: "j.smith@web.io", phone: "+1 (555) 9876", status: "Valid" },
    { name: "Sarah Chen", email: "sarah@chen.tech", phone: "+1 (555) 4567", status: "Review" },
  ];

  return (
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
              <TableHead className="font-semibold text-slate-600">Name</TableHead>
              <TableHead className="font-semibold text-slate-600">Email</TableHead>
              <TableHead className="font-semibold text-slate-600">Phone</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-slate-500">{c.email}</TableCell>
                <TableCell className="text-slate-500">{c.phone}</TableCell>
                <TableCell>
                  <Badge className={`border-none font-medium ${
                    c.status === 'Valid' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                  }`}>
                    {c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}