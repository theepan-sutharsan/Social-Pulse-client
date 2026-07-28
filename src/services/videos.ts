import { apiClient } from "@/lib/api-client";
import { Video } from "@/types/video";
import { VideoMetric } from "@/types/video-metric";

export async function getVideosApi(params?: { account_id?: number; tracked_channel_id?: number; platform?: string }) {
  const res = await apiClient.get("/api/videos", { params });
  return res.data.videos as Video[];
}

export async function getVideoDetailApi(id: number) {
  const res = await apiClient.get(`/api/videos/${id}`);
  return res.data.video as Video;
}

export async function getVideoMetricsApi(id: number) {
  const res = await apiClient.get(`/api/videos/${id}/metrics`);
  return res.data.metrics as VideoMetric[];
}
