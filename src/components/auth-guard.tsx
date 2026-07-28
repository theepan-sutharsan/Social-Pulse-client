'use client';

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthenticatedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'member'>;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, loading, user, router, allowedRoles]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030718] text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
