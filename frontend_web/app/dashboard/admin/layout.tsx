import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/dashboard/RoleGuard"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          {children}
        </main>
      </SidebarProvider>
    </RoleGuard>
  )
}