"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  UserCog,
  ClipboardCheck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";

const navItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Candidates", icon: Users, url: "/candidates" },
  { title: "Manage Teachers", icon: UserCog, url: "/teachers" },
  { title: "Correctors", icon: ClipboardCheck, url: "/correctors" },
  { title: "Exams", icon: FileText, url: "/exams" },
  { title: "Results", icon: BarChart3, url: "/results" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();
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
      setError(
        err?.response?.data?.message ||
          "Something went wrong when trying to logout",
      );
    }

    setLoading(false);
  };

  return (
    <Sidebar className="border-r border-slate-100 bg-white">
      {/* Logo Section */}
      <SidebarHeader className="p-6">
        <img
          src="/LogoDoctora.svg"
          alt="ConcourDoctora Logo"
          width={180}
          height={40}
          className="h-auto w-auto"
        />
      </SidebarHeader>
      <hr />
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              // In a real app, you'd check if pathname === item.url
              // For this demo, let's keep 'Candidates' active as requested
              const isActive = item.title === "Candidates";

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`h-11 px-4 transition-all duration-200 ${
                      isActive
                        ? "!bg-[#EEEBFF] !text-[#3b27b5] shadow-sm font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <a href={item.url}>
                      <item.icon
                        size={22}
                        className={
                          isActive ? "text-[#3b27b5]" : "text-slate-700"
                        }
                      />
                      <span className="text-[15px]">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4 mx-4 opacity-50" />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-11 px-4 text-slate-600 hover:bg-slate-50">
                <Settings size={22} className="text-slate-700" />
                <span className="text-[15px]">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-50">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Dr. Alodf H."
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-900 leading-tight">
                Dr. Alodf H.
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Super Admin
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-300 hover:text-slate-500 transition-colors">
            <LogOut size={18} className="rotate-180" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
