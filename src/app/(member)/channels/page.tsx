'use client';

import { AuthenticatedRoute } from "@/components/auth-guard";
import { ChannelListView } from "@/sections/channels/channel-list-view";

export default function ChannelsPage() {
  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <ChannelListView />
    </AuthenticatedRoute>
  );
}
