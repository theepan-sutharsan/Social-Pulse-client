import { apiClient } from "@/lib/api-client";
import type {
  AudienceCommentsResponse,
  AudienceRun,
  AudienceUsage,
} from "@/types/youtube-audience-intelligence";

export async function estimateAudienceAnalysisApi(
  video_url: string,
  requested_count: number | "all",
): Promise<{ video_id: string; usage: AudienceUsage }> {
  const res = await apiClient.post("/api/youtube-audience/estimate", {
    video_url,
    requested_count,
  });
  return res.data as { video_id: string; usage: AudienceUsage };
}

export async function startAudienceAnalysisApi(
  video_url: string,
  requested_count: number | "all",
  provider = "auto",
): Promise<{ run: AudienceRun; usage: AudienceUsage }> {
  const res = await apiClient.post("/api/youtube-audience/analyze", {
    video_url,
    requested_count,
    provider,
  });
  return res.data as { run: AudienceRun; usage: AudienceUsage };
}

export async function getAudienceRunApi(run_id: number): Promise<AudienceRun> {
  const res = await apiClient.get(`/api/youtube-audience/runs/${run_id}`);
  return res.data.run as AudienceRun;
}

export async function getAudienceHistoryApi(): Promise<AudienceRun[]> {
  const res = await apiClient.get("/api/youtube-audience/history");
  return (res.data.history || []) as AudienceRun[];
}

export async function getAudienceCommentsApi(
  run_id: number,
  params: Record<string, string | number | undefined> = {},
): Promise<AudienceCommentsResponse> {
  const res = await apiClient.get(`/api/youtube-audience/runs/${run_id}/comments`, { params });
  return res.data as AudienceCommentsResponse;
}

export async function purgeAudienceCommentsApi(video_id: string): Promise<void> {
  await apiClient.delete(`/api/youtube-audience/videos/${encodeURIComponent(video_id)}/comments`);
}
