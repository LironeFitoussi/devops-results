import { useAuth0 } from "@auth0/auth0-react";
import { useAppSelector } from "@/redux/hooks";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = <div>Access denied. You don't have permission to view this page.</div> 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth0();
  const { user } = useAppSelector((state) => state.user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && user?.role !== requiredRole) {
    return fallback;
  }

  return <>{children}</>;
}
