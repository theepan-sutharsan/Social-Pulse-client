import { apiClient } from "@/lib/api-client";
import { VideoAnalysis } from "@/types/video-analysis";

export type VideoTranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

export type VideoTranscript = {
  video_id: string;
  transcript: string;
  language?: string | null;
  source: "youtube_transcript_api" | "whisper";
  segments: VideoTranscriptSegment[];
};

export type TranscriptionLanguage = "auto" | "ta" | "en";

export async function analyzeVideoApi(
  youtube_url: string,
  language: TranscriptionLanguage = "auto",
): Promise<VideoAnalysis> {
  const res = await apiClient.post("/api/video-analysis/analyze", { youtube_url, language });
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

export async function deleteVideoAnalysisApi(id: number): Promise<void> {
  await apiClient.delete(`/api/video-analysis/${id}`);
}

export async function getVideoTranscriptApi(
  youtube_url: string,
  language: TranscriptionLanguage = "auto",
): Promise<VideoTranscript> {
  const res = await apiClient.post("/api/video-analysis/transcript", { youtube_url, language });
  return res.data.transcript as VideoTranscript;
}
