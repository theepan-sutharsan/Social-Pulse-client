'use client';

import { AuthenticatedRoute } from "@/components/auth-guard";
import { VideoAnalyticsView } from "@/sections/videos/video-analytics-view";

export default function VideoAnalyticsPage() {
  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <VideoAnalyticsView />
    </AuthenticatedRoute>
  );
}
