import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthenticatedRoute } from "@/components/auth-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <AppShell>{children}</AppShell>
    </AuthenticatedRoute>
  );
}
