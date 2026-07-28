'use client';
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardView } from "@/sections/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <DashboardView />
    </AuthenticatedRoute>
  );
}
