import { CorrectorSidebar } from "@/components/dashboard/corrector-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/dashboard/RoleGuard"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['CORRECTOR']}>
      <SidebarProvider>
        <CorrectorSidebar />
        <main className="w-full">
          {children}
        </main>
      </SidebarProvider>
    </RoleGuard>
  )
}
