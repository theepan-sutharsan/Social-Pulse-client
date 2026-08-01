export interface HookAnalysis {
  score: number;
  feedback: string;
  suggestion: string;
}

export interface ContentStructure {
  score: number;
  feedback: string;
  suggestion: string;
}

export interface SEOKeywords {
  extracted_keywords: string[];
  missing_opportunities: string[];
  suggested_title: string;
  suggested_tags: string[];
}

export interface EngagementTriggers {
  cta_present: boolean;
  cta_feedback: string;
}

export interface RetentionRiskPoint {
  timestamp: string;
  issue: string;
  fix: string;
}

export interface AnalysisJSON {
  overall_score: number;
  summary: string;
  hook_analysis: HookAnalysis;
  content_structure: ContentStructure;
  seo_keywords: SEOKeywords;
  engagement_triggers: EngagementTriggers;
  retention_risk_points: RetentionRiskPoint[];
  top_3_action_items: string[];
}

export interface ThumbnailAnalysisJSON {
  thumbnail_score: number;
  visual_appeal: string;
  text_readability: string;
  composition_feedback: string;
  emotion_impact: string;
  improvement_suggestions: string[];
}

export interface VideoAnalysis {
  id: number;
  user_id: number;
  youtube_url: string;
  video_title: string;
  transcript: string;
  analysis_json: AnalysisJSON;
  thumbnail_analysis_json: ThumbnailAnalysisJSON;
  overall_score: number;
  created_at: string;
}
