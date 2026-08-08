// Types for YouTube Channel Analysis feature

// ─── Per-video analysis ───────────────────────────────────────────────────────

export interface YTVideoAnalysisEntry {
  video_id: string;
  title: string;
  url: string;
  published_at: string | null;
  views: number;
  likes: number;
  comments: number;
  engagement_rate_pct: number;
  analysis: {
    title_score: number;
    thumbnail_score: number;
    seo_score: number;
    content_score: number;
    overall_score: number;
    engagement_analysis: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

// ─── Overall channel insights ─────────────────────────────────────────────────

export interface YTOverallChannelInsights {
  best_performing_videos: string[];
  lowest_performing_videos: string[];
  top_patterns: string[];
  common_problems: string[];
  content_category_performance: string;
  audience_behavior_insights: string;
  recommended_content_strategy: string;
  future_video_ideas: string[];
  seo_improvement_suggestions: string[];
  thumbnail_improvement_suggestions: string[];
  recommendations: string[];
}

// ─── Analysis summary stored in DB ───────────────────────────────────────────

export interface YTAnalysisSummary {
  // New schema
  video_analysis: YTVideoAnalysisEntry[];
  overall_channel_insights: YTOverallChannelInsights;
  total_videos_analyzed: number;
  // Metadata
  ai_provider?: 'claude' | 'gemini';
  video_count_requested?: number;
}

// ─── Channel & Run models ─────────────────────────────────────────────────────

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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videos_analyzed_count: number;
  analysis_summary: YTAnalysisSummary | null;
  generated_ideas: string[] | null;
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
