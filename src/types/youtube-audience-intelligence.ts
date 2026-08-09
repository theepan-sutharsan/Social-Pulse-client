export type AudienceRunStatus =
  | "PENDING"
  | "FETCHING"
  | "PREPROCESSING"
  | "CLASSIFYING"
  | "CLUSTERING"
  | "ANALYZING"
  | "AGGREGATING"
  | "SUMMARIZING"
  | "COMPLETED"
  | "FAILED";

export type AudienceStage = AudienceRunStatus;

export type AudienceUsage = {
  requested_comments: number | null;
  requested_label: string;
  estimated_api_pages: number;
  estimated_ai_batches: number;
  estimated_duration_seconds: number;
  estimated_duration_label: string;
  quota_units_estimated: number;
  label: string;
};

export type AudienceVideo = {
  id?: number;
  external_id: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  channel_name?: string;
  channel_id?: string;
  published_at?: string | null;
  duration?: string;
  views?: number;
  likes?: number;
  comments?: number;
};

export type AudienceDistribution = {
  label: string;
  count: number;
  percentage: number;
};

export type AudienceInsightRow = {
  label: string;
  count?: number;
  frequency?: number;
  percentage?: number;
  sentiment?: string;
  confidence?: number;
  examples?: string[];
  supporting_comments?: string[];
  demand_score?: number;
  opportunity_score?: number;
  engagement?: number;
  severity?: string;
  impact?: string;
  recommended_action?: string;
};

export type AudienceReport = {
  executive_summary: string;
  summary: Record<string, string>;
  audience_score: number;
  audience_score_label: string;
  kpis: {
    positive_percentage: number;
    neutral_percentage: number;
    negative_percentage: number;
    mixed_percentage: number;
    engagement_rate: number;
    average_comment_quality: number;
  };
  sentiment: AudienceDistribution[];
  emotions: AudienceDistribution[];
  languages: AudienceDistribution[];
  top_topics: AudienceInsightRow[];
  topic_sentiment: Array<{
    topic: string;
    comment_count: number;
    positive_percentage: number;
    neutral_percentage: number;
    negative_percentage: number;
    mixed_percentage: number;
  }>;
  questions: AudienceInsightRow[];
  complaints: AudienceInsightRow[];
  pain_points: AudienceInsightRow[];
  suggestions: AudienceInsightRow[];
  positive_feedback: AudienceInsightRow[];
  negative_feedback: AudienceInsightRow[];
  audience_intent: AudienceDistribution[];
  audience_personas: AudienceDistribution[];
  comment_clusters: AudienceInsightRow[];
  comment_quality: {
    average: number;
    distribution: AudienceDistribution[];
    high_value_comments: string[];
  };
  spam_analysis: Record<string, unknown>;
  bot_analysis: Record<string, unknown>;
  toxicity: Record<string, unknown>;
  sarcasm: Record<string, unknown>;
  engagement: Record<string, number>;
  timeline: Array<Record<string, string | number>>;
  audience_demand: AudienceInsightRow[];
  content_opportunities: Array<Record<string, unknown>>;
  next_video_recommendations: Array<Record<string, unknown>>;
  reply_opportunities: Array<Record<string, unknown>>;
  priority_actions: Array<Record<string, unknown>>;
  business_insights: Array<Record<string, unknown>>;
  creator_recommendations: string[];
  historical_comparison: Record<string, unknown>;
  confidence: Record<string, number>;
  failed_batches: unknown[];
  video: AudienceVideo;
  analysis_metadata: Record<string, unknown>;
  ai_enrichment?: Record<string, unknown>;
};

export type AudienceRun = {
  id: number;
  video_id: string;
  video_fk_id: number;
  video_url: string;
  status: AudienceRunStatus;
  requested_count: number | null;
  requested_all: boolean;
  available_count: number;
  fetched_count: number;
  unique_count: number;
  analyzed_count: number;
  skipped_count: number;
  failed_count: number;
  current_stage: AudienceStage;
  progress_pct: number;
  current_batch: number;
  total_batches: number;
  model_used?: string | null;
  configuration?: { provider?: string; usage?: AudienceUsage };
  report?: AudienceReport | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  video?: AudienceVideo | null;
};

export type AudienceComment = {
  id: number;
  comment_id: string;
  parent_comment_id?: string | null;
  author?: string | null;
  author_channel_id?: string | null;
  text: string;
  published_at?: string | null;
  updated_at?: string | null;
  likes: number;
  replies: number;
  language?: string | null;
  sentiment?: string | null;
  emotion?: string | null;
  topic?: string | null;
  intent?: string | null;
  persona?: string | null;
  cluster?: string | null;
  spam?: boolean;
  toxicity?: boolean;
  sarcasm?: boolean;
  quality_score?: number;
  confidence?: number;
};

export type AudienceCommentsResponse = {
  page: number;
  per_page: number;
  total: number;
  comments: AudienceComment[];
};
