
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { ReactElement } from 'react';
import type { UserRole } from '../../../interfaces/enum/UserRole';

interface RoleGuardProps {
  role: UserRole;
  children: ReactElement;
}

export default function RoleGuard({ role, children }: RoleGuardProps) {
  const { userRoles, isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  // if (!userRoles.includes(role)) {
  //   return <Navigate to="/user/error" replace />;
  // }

  return children;
}