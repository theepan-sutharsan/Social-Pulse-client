import { apiClient } from "@/lib/api-client";

export async function getChannelDetailApi(channelId: string | number) {
  const res = await apiClient.get(`/api/channels/${channelId}`);
  return res.data;
}

export async function getChannelHistoryApi(channelId: string | number) {
  const res = await apiClient.get(`/api/channels/${channelId}/history`);
  return res.data;
}

export async function getChannelGrowthApi(channelId: string | number) {
  const res = await apiClient.get(`/api/channels/${channelId}/growth`);
  return res.data;
}

export async function getChannelRevenueApi(channelId: string | number, lowCpm = 2.0, highCpm = 8.0) {
  const res = await apiClient.get(`/api/channels/${channelId}/revenue`, {
    params: { low_cpm: lowCpm, high_cpm: highCpm },
  });
  return res.data;
}

export async function getChannelPredictionsApi(channelId: string | number) {
  const res = await apiClient.get(`/api/channels/${channelId}/predictions`);
  return res.data;
}

export async function getChannelTopVideosApi(channelId: string | number, sortBy = "views") {
  const res = await apiClient.get(`/api/channels/${channelId}/top-videos`, {
    params: { sort_by: sortBy },
  });
  return res.data;
}
