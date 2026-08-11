import { apiClient } from "@/lib/api-client";
import {
  YTAnalysisStartResponse,
  YTAnalysisRun,
  YTAnalysisHistoryResponse,
} from "@/types/yt-channel-analysis";

export async function startChannelAnalysisApi(
  channel_url: string,
  video_count: 10 | 20 | 30 | 50 = 50
): Promise<YTAnalysisStartResponse> {
  const res = await apiClient.post("/api/yt-channel-analysis/start", {
    channel_url,
    video_count,
  });
  return res.data as YTAnalysisStartResponse;
}

export async function getChannelAnalysisRunApi(
  run_id: number
): Promise<{ run: YTAnalysisRun; channel: any }> {
  const res = await apiClient.get(`/api/yt-channel-analysis/${run_id}`);
  return res.data;
}

export async function getChannelAnalysisHistoryApi(): Promise<YTAnalysisHistoryResponse> {
  const res = await apiClient.get("/api/yt-channel-analysis/history");
  return res.data as YTAnalysisHistoryResponse;
}

export async function deleteChannelAnalysisRunApi(run_id: number): Promise<void> {
  await apiClient.delete(`/api/yt-channel-analysis/${run_id}`);
}
