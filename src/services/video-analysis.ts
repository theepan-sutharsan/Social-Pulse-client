import { apiClient } from "@/lib/api-client";
import { VideoAnalysis } from "@/types/video-analysis";

export async function analyzeVideoApi(youtube_url: string, provider?: string): Promise<VideoAnalysis> {
  const res = await apiClient.post("/api/video-analysis/analyze", { youtube_url, provider });
  return res.data.analysis as VideoAnalysis;
}

export async function getVideoAnalysisHistoryApi(): Promise<VideoAnalysis[]> {
  const res = await apiClient.get("/api/video-analysis/history");
  return res.data.history as VideoAnalysis[];
}

export async function getVideoAnalysisDetailApi(id: number): Promise<VideoAnalysis> {
  const res = await apiClient.get(`/api/video-analysis/${id}`);
  return res.data.analysis as VideoAnalysis;
}
