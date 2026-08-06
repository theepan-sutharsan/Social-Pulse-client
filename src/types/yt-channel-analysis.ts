// Types for YouTube Channel Analysis feature

export interface YTVideoIdea {
  title: string;
  hook: string;
  rationale: string;
}

export interface YTAnalysisSummary {
  performance_insights: string;
  title_patterns: string;
  topic_clusters: string[];
  content_gaps: string;
  optimal_duration_seconds: number;
  ai_provider?: "claude" | "gemini";
}

export interface YTAnalyzedChannel {
  id: number;
  user_id: number;
  channel_id: string;
  channel_handle: string;
  channel_title: string;
  subscriber_count: number;
  thumbnail_url: string | null;
  last_analyzed_at: string | null;
  created_at: string;
}

export interface YTAnalysisRun {
  id: number;
  user_id: number;
  channel_fk_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  videos_analyzed_count: number;
  analysis_summary: YTAnalysisSummary | null;
  generated_ideas: YTVideoIdea[] | null;
  script_outline: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  channel?: YTAnalyzedChannel | null;
}

export interface YTAnalysisStartResponse {
  message: string;
  run: YTAnalysisRun;
  channel: YTAnalyzedChannel;
}

export interface YTAnalysisHistoryResponse {
  count: number;
  history: YTAnalysisRun[];
}
