import { useContext } from "react"
import { AuthContext } from "@/context/AuthProvider"

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  const { user } = context;

  const role = typeof user?.role === 'string' ? user.role.toUpperCase() : String(user?.role || '').toUpperCase();

  const isAdmin = role === 'ADMIN';
  const isCoordinator = role === 'COORDINATOR';
  const isCorrector = Boolean(
    role === 'STAFF' && 
    user?.sessionStaff?.some((staff: any) => staff.function?.toUpperCase() === 'CORRECTOR')
  );

  return {
    ...context,
    isAdmin,
    isCoordinator,
    isCorrector,
  }
}
