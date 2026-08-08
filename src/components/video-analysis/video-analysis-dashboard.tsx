'use client';

import { useState } from 'react';
import { VideoAnalysis } from "@/types/video-analysis";
import { 
  Sparkles, 
  CheckCircle2, 
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

interface VideoAnalysisDashboardProps {
  analysis: VideoAnalysis;
}

export function VideoAnalysisDashboard({ analysis }: VideoAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'retention' | 'thumbnail' | 'transcript'>('overview');

  const content = analysis.analysis_json || {};
  const thumbnail = analysis.thumbnail_analysis_json || {};

  const overallScore = analysis.overall_score || content.overall_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
    if (score >= 6) return "text-amber-400 border-amber-500/40 bg-amber-950/40";
    return "text-rose-400 border-rose-500/40 bg-rose-950/40";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Video Audit Complete
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analysis.video_title || "YouTube Video Analysis"}
            </h1>
            <a 
              href={analysis.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <span>{analysis.youtube_url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${getScoreColor(overallScore)}`}>
              <span className="text-xs uppercase font-bold tracking-wider opacity-80">Overall Score</span>
              <div className="text-3xl font-black">{overallScore.toFixed(1)}<span className="text-sm font-normal opacity-70">/10</span></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Summary', icon: Sparkles },
            { id: 'seo', label: 'SEO & Keywords', icon: Search },
            { id: 'retention', label: 'Retention & Pacing', icon: Clock },
            { id: 'thumbnail', label: 'Thumbnail Vision', icon: Eye },
            { id: 'transcript', label: 'Full Transcript', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary & Action Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Executive Summary
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {content.summary || "Analysis generated successfully based on audio transcript and visual parameters."}
              </p>
            </div>

            {/* Top 3 Action Items */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-400" /> Top 3 Growth Action Items
              </h2>
              <div className="space-y-3">
                {(content.top_3_action_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="h-6 w-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hook & Content Structure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hook Analysis */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Hook Analysis (0-30s)
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(content.hook_analysis?.score || 0)}`}>
                    {content.hook_analysis?.score || 0}/10
                  </span>
                </div>
                <p className="text-xs text-slate-300">{content.hook_analysis?.feedback}</p>
                {content.hook_analysis?.suggestion && (
                  <div className="text-xs p-2.5 bg-amber-950/30 border border-amber-800/40 text-amber-200 rounded-lg">
                    <strong>Suggestion:</strong> {content.hook_analysis.suggestion}
                  </div>
                )}
              </div>

              {/* Content Structure */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Structure & Pacing
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(content.content_structure?.score || 0)}`}>
                    {content.content_structure?.score || 0}/10
                  </span>
                </div>
                <p className="text-xs text-slate-300">{content.content_structure?.feedback}</p>
                {content.content_structure?.suggestion && (
                  <div className="text-xs p-2.5 bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 rounded-lg">
                    <strong>Suggestion:</strong> {content.content_structure.suggestion}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column Metrics Card */}
          <div className="space-y-6">
            {/* Engagement Triggers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Engagement & CTA Audit
              </h3>
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400">Call to Action (CTA) Present:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${content.engagement_triggers?.cta_present ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'}`}>
                  {content.engagement_triggers?.cta_present ? 'Yes' : 'No'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {content.engagement_triggers?.cta_feedback}
              </p>
            </div>

            {/* Thumbnail Quick Preview */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> Thumbnail Score
              </h3>
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Visual Appeal Rating:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getScoreColor(thumbnail.thumbnail_score || 0)}`}>
                  {thumbnail.thumbnail_score || 0}/10
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {thumbnail.visual_appeal || "Thumbnail visual analysis generated."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & KEYWORDS */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" /> Suggested Optimized Title
              </h2>
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-indigo-200 text-sm font-semibold">
                "{content.seo_keywords?.suggested_title || analysis.video_title}"
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Extracted Keywords */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300">Extracted Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {(content.seo_keywords?.extracted_keywords || []).map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Opportunities */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Missing SEO Opportunities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(content.seo_keywords?.missing_opportunities || []).map((opp, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs font-medium rounded-lg">
                      + {opp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Recommended Video Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(content.seo_keywords?.suggested_tags || []).map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 text-xs font-mono rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RETENTION & PACING */}
      {activeTab === 'retention' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" /> Retention Risk Points & Fixes
          </h2>
          <div className="space-y-4">
            {(content.retention_risk_points || []).map((point, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-rose-950 border border-rose-800/50 text-rose-400 text-xs font-mono font-bold rounded">
                    Timestamp {point.timestamp}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">Risk Point #{idx + 1}</span>
                </div>
                <p className="text-xs text-slate-300"><strong>Issue:</strong> {point.issue}</p>
                <p className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg">
                  <strong>Recommended Fix:</strong> {point.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: THUMBNAIL VISION */}
      {activeTab === 'thumbnail' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" /> Vision Thumbnail Feedback
            </h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${getScoreColor(thumbnail.thumbnail_score || 0)}`}>
              Score: {thumbnail.thumbnail_score || 0}/10
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Visual Appeal</span>
                <p className="text-xs text-slate-200">{thumbnail.visual_appeal}</p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Text Readability</span>
                <p className="text-xs text-slate-200">{thumbnail.text_readability}</p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Composition & Framing</span>
                <p className="text-xs text-slate-200">{thumbnail.composition_feedback}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Emotional Impact</span>
                <p className="text-xs text-slate-200">{thumbnail.emotion_impact}</p>
              </div>
              
              <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-2">
                <span className="text-xs font-bold text-purple-300 uppercase">Thumbnail Design Suggestions</span>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-purple-200">
                  {(thumbnail.improvement_suggestions || []).map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRANSCRIPT */}
      {activeTab === 'transcript' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Transcribed Audio Text
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {analysis.transcript || "No transcript available."}
          </div>
        </div>
      )}
    </div>
  );
}
