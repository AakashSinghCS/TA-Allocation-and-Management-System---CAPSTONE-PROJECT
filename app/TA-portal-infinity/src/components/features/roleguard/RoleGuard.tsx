
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { ReactElement } from 'react';

interface RoleGuardProps {
  role: string;
  children: ReactElement;
}


export default function RoleGuard({ role, children }: RoleGuardProps) {
  const { roles, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/error" replace />;
  }

  return children;
}
