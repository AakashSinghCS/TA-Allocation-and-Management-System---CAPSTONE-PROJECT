import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import type { UserRole } from "../AuthContext";

interface RequireAuthProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RequireAuth({
  allowedRoles,
  redirectTo = "/login",
}: RequireAuthProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet/>;
}
