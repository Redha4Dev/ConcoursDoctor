"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  GraduationCap,
  Settings,
  LogOut,
  DoorOpen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Programs", icon: GraduationCap, url: "/dashboard/programs" },
  { title: "Manage Teachers", icon: Users, url: "/dashboard/teachersGestion" },
  { title: "Manage Rooms", icon: DoorOpen, url: "/dashboard/roomsGestion" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();
  const { user } = useAuth();
  
  const checkAuth = async () => {
    try {
      await api.get("/api/v1/auth/me");
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

  // Helper function for active styles to avoid repetition
  const getActiveClasses = (isActive: boolean) =>
    isActive
      ? "!bg-[#EEEBFF] !text-[#3b27b5] shadow-sm font-semibold"
      : "text-slate-600 hover:bg-slate-50";

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
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`h-11 px-4 transition-all duration-200 ${getActiveClasses(isActive)}`}
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-50">
        <div className="flex items-center justify-between px-2 py-2">
          {/* Check if user exists, otherwise show skeleton */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  alt="User Avatar"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900 leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {user.role}
                </span>
              </div>
            </div>
          ) : (
            /* Skeleton Loader */
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-200 animate-pulse" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-slate-300 hover:text-slate-500 transition-colors ml-2"
          >
            <LogOut size={18} className="rotate-180" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}