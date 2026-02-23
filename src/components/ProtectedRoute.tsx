import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAgent, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !isAgent) {
    return <Navigate to="/agent/login" replace />;
  }

  return <>{children}</>;
}
