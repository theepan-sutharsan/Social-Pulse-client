'use client';

import { useState } from 'react';
import { VideoAnalysis } from "@/types/video-analysis";
import { 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Eye, 
  ListChecks, 
  Clock, 
  FileText, 
  ExternalLink,
  Zap,
  Tag,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VideoAnalysisDashboardProps {
  analysis: VideoAnalysis;
}

const analysisTabs = [
  { id: 'overview', label: 'Executive Summary', icon: Sparkles },
  { id: 'seo', label: 'SEO & Keywords', icon: Search },
  { id: 'retention', label: 'Retention & Pacing', icon: Clock },
  { id: 'thumbnail', label: 'Thumbnail Vision', icon: Eye },
  { id: 'transcript', label: 'Full Transcript', icon: FileText },
] as const;

type AnalysisTab = (typeof analysisTabs)[number]['id'];

export function VideoAnalysisDashboard({ analysis }: VideoAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  const content = analysis.analysis_json || {};
  const thumbnail = analysis.thumbnail_analysis_json || {};

  const overallScore = analysis.overall_score || content.overall_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    if (score >= 6) return "border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    return "border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="relative overflow-hidden rounded-2xl border-border bg-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" /> AI Video Audit Complete
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {analysis.video_title || "YouTube Video Analysis"}
            </h1>
            <a 
              href={analysis.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <span>{analysis.youtube_url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Badge className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${getScoreColor(overallScore)}`}>
              <span className="text-xs uppercase font-bold tracking-wider opacity-80">Overall Score</span>
              <div className="text-3xl font-black">{overallScore.toFixed(1)}<span className="text-sm font-normal opacity-70">/10</span></div>
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-border pt-4">
          {analysisTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                aria-pressed={isActive}
                className="whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary & Action Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border bg-card p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                <FileText className="h-5 w-5 text-primary" /> Executive Summary
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {content.summary || "Analysis generated successfully based on audio transcript and visual parameters."}
              </p>
            </Card>

            {/* Top 3 Action Items */}
            <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <ListChecks className="h-5 w-5 text-primary" /> Top 3 Growth Action Items
              </h2>
              <div className="space-y-3">
                {(content.top_3_action_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Hook & Content Structure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hook Analysis */}
              <Card className="space-y-3 rounded-2xl border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Hook Analysis (0-30s)
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(content.hook_analysis?.score || 0)}`}>
                    {content.hook_analysis?.score || 0}/10
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{content.hook_analysis?.feedback}</p>
                {content.hook_analysis?.suggestion && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong>Suggestion:</strong> {content.hook_analysis.suggestion}
                  </div>
                )}
              </Card>

              {/* Content Structure */}
              <Card className="space-y-3 rounded-2xl border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" /> Structure & Pacing
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(content.content_structure?.score || 0)}`}>
                    {content.content_structure?.score || 0}/10
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{content.content_structure?.feedback}</p>
                {content.content_structure?.suggestion && (
                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-xs text-foreground">
                    <strong>Suggestion:</strong> {content.content_structure.suggestion}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column Metrics Card */}
          <div className="space-y-6">
            {/* Engagement Triggers */}
            <Card className="space-y-4 rounded-2xl border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Engagement & CTA Audit
              </h3>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
                <span className="text-xs font-semibold text-muted-foreground">Call to Action (CTA) Present:</span>
                <span className={`rounded border px-2 py-0.5 text-xs font-bold ${content.engagement_triggers?.cta_present ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                  {content.engagement_triggers?.cta_present ? 'Yes' : 'No'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {content.engagement_triggers?.cta_feedback}
              </p>
            </Card>

            {/* Thumbnail Quick Preview */}
            <Card className="space-y-3 rounded-2xl border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Thumbnail Score
              </h3>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Visual Appeal Rating:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getScoreColor(thumbnail.thumbnail_score || 0)}`}>
                  {thumbnail.thumbnail_score || 0}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {thumbnail.visual_appeal || "Thumbnail visual analysis generated."}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & KEYWORDS */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <Card className="space-y-6 rounded-2xl border-border bg-card p-6">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
                <Tag className="h-5 w-5 text-primary" /> Suggested Optimized Title
              </h2>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-semibold text-foreground">
                &quot;{content.seo_keywords?.suggested_title || analysis.video_title}&quot;
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Extracted Keywords */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Extracted Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {(content.seo_keywords?.extracted_keywords || []).map((kw, i) => (
                    <span key={i} className="rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Opportunities */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" /> Missing SEO Opportunities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(content.seo_keywords?.missing_opportunities || []).map((opp, i) => (
                    <span key={i} className="rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      + {opp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Recommended Video Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(content.seo_keywords?.suggested_tags || []).map((tag, i) => (
                  <span key={i} className="rounded border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: RETENTION & PACING */}
      {activeTab === 'retention' && (
        <Card className="space-y-6 rounded-2xl border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Clock className="h-5 w-5 text-rose-600 dark:text-rose-400" /> Retention Risk Points & Fixes
          </h2>
          <div className="space-y-4">
            {(content.retention_risk_points || []).map((point, idx) => (
              <div key={idx} className="space-y-2 rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 font-mono text-xs font-bold text-destructive">
                    Timestamp {point.timestamp}
                  </span>
                  <span className="text-xs font-semibold text-foreground">Risk Point #{idx + 1}</span>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Issue:</strong> {point.issue}</p>
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <strong>Recommended Fix:</strong> {point.fix}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: THUMBNAIL VISION */}
      {activeTab === 'thumbnail' && (
        <Card className="space-y-6 rounded-2xl border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Vision Thumbnail Feedback
            </h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${getScoreColor(thumbnail.thumbnail_score || 0)}`}>
              Score: {thumbnail.thumbnail_score || 0}/10
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-xs font-bold uppercase text-muted-foreground">Visual Appeal</span>
                <p className="text-xs text-foreground">{thumbnail.visual_appeal}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-xs font-bold uppercase text-muted-foreground">Text Readability</span>
                <p className="text-xs text-foreground">{thumbnail.text_readability}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-xs font-bold uppercase text-muted-foreground">Composition & Framing</span>
                <p className="text-xs text-foreground">{thumbnail.composition_feedback}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-xs font-bold uppercase text-muted-foreground">Emotional Impact</span>
                <p className="text-xs text-foreground">{thumbnail.emotion_impact}</p>
              </div>
              
              <div className="space-y-2 rounded-xl border border-purple-500/30 bg-purple-50 p-4 dark:bg-purple-950/30">
                <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300">Thumbnail Design Suggestions</span>
                <ul className="list-inside list-disc space-y-1.5 text-xs text-purple-800 dark:text-purple-200">
                  {(thumbnail.improvement_suggestions || []).map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: TRANSCRIPT */}
      {activeTab === 'transcript' && (
        <Card className="space-y-4 rounded-2xl border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <FileText className="h-5 w-5 text-primary" /> Transcribed Audio Text
          </h2>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {analysis.transcript || "No transcript available."}
          </div>
        </Card>
      )}
    </div>
  );
}
