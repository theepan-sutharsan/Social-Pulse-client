'use client';

import { AuthenticatedRoute } from "@/components/auth-guard";
import { CompetitorComparisonView } from "@/sections/competitors/competitor-comparison-view";

export default function CompetitorsPage() {
  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <CompetitorComparisonView />
    </AuthenticatedRoute>
  );
}
