import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthenticatedRoute } from "@/components/auth-guard";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedRoute>
      <AppShell>{children}</AppShell>
    </AuthenticatedRoute>
  );
}
