import { apiClient } from "@/lib/api-client";

export async function compareCompetitorsApi(userAccountId?: number, competitorChannelId?: string) {
  const res = await apiClient.post("/api/competitors/compare", {
    user_account_id: userAccountId,
    competitor_channel_id: competitorChannelId,
  });
  return res.data;
}

export async function getVideoAnalyticsApi(videoId: number) {
  const res = await apiClient.get(`/api/videos/${videoId}/analytics`);
  return res.data;
}

export async function getVideoSeoApi(videoId: number) {
  const res = await apiClient.get(`/api/videos/${videoId}/seo`);
  return res.data;
}

export async function getVideoPredictionApi(videoId: number) {
  const res = await apiClient.get(`/api/videos/${videoId}/prediction`);
  return res.data;
}

export async function getVideoViralScoreApi(videoId: number) {
  const res = await apiClient.get(`/api/videos/${videoId}/viral-score`);
  return res.data;
}
