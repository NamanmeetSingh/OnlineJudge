"use client";

import { useAuth } from "../../lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, redirectTo = "/auth/login" }) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push(redirectTo);
    }
  }, [authenticated, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return children;
}
