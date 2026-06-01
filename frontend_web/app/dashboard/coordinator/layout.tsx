import { CoordinatorSidebar } from "@/components/dashboard/coordinator-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/dashboard/RoleGuard"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['COORDINATOR']}>
      <SidebarProvider>
        <CoordinatorSidebar />
        <main className="w-full">
          {children}
        </main>
      </SidebarProvider>
    </RoleGuard>
  )
}
