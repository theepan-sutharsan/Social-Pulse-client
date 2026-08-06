import { apiClient } from "@/lib/api-client";
import {
  YTAnalysisStartResponse,
  YTAnalysisRun,
  YTAnalysisHistoryResponse,
} from "@/types/yt-channel-analysis";

export async function startChannelAnalysisApi(
  channel_url: string
): Promise<YTAnalysisStartResponse> {
  const res = await apiClient.post("/api/yt-channel-analysis/start", {
    channel_url,
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
