'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

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
      <div className="flex min-h-screen items-center justify-center bg-[#030718] p-4 text-indigo-400">
        <Card className="w-full max-w-xs">
          <CardContent className="flex flex-col items-center px-6 py-8 text-center" role="status" aria-live="polite">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
              <ShieldCheck className="h-5 w-5" />
              <LoaderCircle className="absolute h-12 w-12 animate-spin text-indigo-500" />
            </div>
            <p className="text-sm font-semibold text-white">Verifying your session</p>
            <p className="mt-1 text-xs text-slate-400">Preparing your secure workspace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
