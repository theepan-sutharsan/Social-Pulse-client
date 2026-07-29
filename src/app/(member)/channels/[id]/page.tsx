'use client';

import { AuthenticatedRoute } from "@/components/auth-guard";
import { ChannelDetailView } from "@/sections/channels/channel-detail-view";

export default function ChannelDetailPage() {
  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <ChannelDetailView />
    </AuthenticatedRoute>
  );
}
