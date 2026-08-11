'use client';

import { useState, useEffect } from 'react';
import { AuthenticatedRoute } from '@/components/auth-guard';
import {
  startChannelAnalysisApi,
  getChannelAnalysisHistoryApi,
  getChannelAnalysisRunApi,
  deleteChannelAnalysisRunApi,
} from '@/services/yt-channel-analysis';
import { YTAnalysisRun, YTVideoAnalysisEntry, YTOverallChannelInsights, YTContentSuggestion } from '@/types/yt-channel-analysis';
import { toast } from 'sonner';
import { YouTubeIcon } from '@/components/icons/youtube-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
  BarChart3,
  Sparkles,
  Loader2,
  History,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  ThumbsUp,
  MessageSquare,
  Eye,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
  Zap,
  BarChart2,
  Globe,
  Target,
  FileText,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatDuration(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Score bar helper ────────────────────────────────────────────────────────

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${
        pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
      }`}>{score}/10</span>
    </div>
  );
}

// ─── Per-video card ───────────────────────────────────────────────────────────

function VideoCard({ video, rank }: { video: YTVideoAnalysisEntry; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const a = video.analysis;
  const avg = a.overall_score ||
    parseFloat(((a.title_score + a.thumbnail_score + a.seo_score + a.content_score) / 4).toFixed(1));
  const avgColor = avg >= 8 ? 'text-emerald-700 dark:text-emerald-400' : avg >= 6 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400';
  const avgBg = avg >= 8 ? 'bg-emerald-50 border-emerald-500/30 dark:bg-emerald-950/40' : avg >= 6 ? 'bg-amber-50 border-amber-500/30 dark:bg-amber-950/40' : 'bg-rose-50 border-rose-500/30 dark:bg-rose-950/40';

  return (
    <div className={`rounded-2xl border transition-all ${
      expanded ? 'border-primary/50 bg-card' : 'border-border bg-card hover:border-primary/30'
    }`}>
      {/* Header row — always visible */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
          {rank}
        </span>

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{video.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {video.published_at ? new Date(video.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views.toLocaleString()}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{video.likes.toLocaleString()}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{video.comments.toLocaleString()}</span>
          <span className="font-medium text-primary">{video.engagement_rate_pct}%</span>
        </div>

        {/* Overall score badge */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${avgBg} ${avgColor}`}>
          {avg.toFixed(1)}
        </span>

        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded analysis */}
      {expanded && (
        <div className="space-y-5 border-t border-border px-5 pb-5 pt-4">
          {/* Score bars */}
          <div className="grid grid-cols-2 gap-4">
            {([
              { label: 'Title Quality', score: a.title_score },
              { label: 'Thumbnail', score: a.thumbnail_score },
              { label: 'SEO', score: a.seo_score },
              { label: 'Content Quality', score: a.content_score },
            ] as { label: string; score: number }[]).map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                <ScoreBar score={item.score} />
              </div>
            ))}
          </div>

          {/* Engagement analysis */}
          {a.engagement_analysis && (
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">Engagement Analysis</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{a.engagement_analysis}</p>
            </div>
          )}

          {/* Strengths / Weaknesses / Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {a.strengths?.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> Strengths</p>
                <ul className="space-y-1">
                  {a.strengths.map((s, i) => <li key={i} className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground"><span className="mt-0.5 text-emerald-500">•</span>{s}</li>)}
                </ul>
              </div>
            )}
            {a.weaknesses?.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400"><XCircle className="w-3 h-3" /> Weaknesses</p>
                <ul className="space-y-1">
                  {a.weaknesses.map((s, i) => <li key={i} className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground"><span className="mt-0.5 text-rose-500">•</span>{s}</li>)}
                </ul>
              </div>
            )}
            {a.suggestions?.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><Zap className="w-3 h-3" /> Suggestions</p>
                <ul className="space-y-1">
                  {a.suggestions.map((s, i) => <li key={i} className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground"><span className="mt-0.5 text-amber-500">•</span>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Video link */}
          {video.url && (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
            >
              <ExternalLink className="w-3 h-3" /> Watch on YouTube
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Channel insights panel ───────────────────────────────────────────────────

function ChannelInsights({ insights }: { insights: YTOverallChannelInsights }) {
  const sections = [
    {
      icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: 'Best Performing Videos',
      color: 'text-emerald-600 dark:text-emerald-400',
      items: insights.best_performing_videos,
    },
    {
      icon: <BarChart2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      label: 'Lowest Performing Videos',
      color: 'text-rose-600 dark:text-rose-400',
      items: insights.lowest_performing_videos,
    },
    {
      icon: <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
      label: 'Successful Patterns',
      color: 'text-yellow-600 dark:text-yellow-400',
      items: insights.top_patterns,
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: 'Common Problems',
      color: 'text-amber-600 dark:text-amber-400',
      items: insights.common_problems,
    },
    {
      icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      label: 'SEO Improvements',
      color: 'text-blue-600 dark:text-blue-400',
      items: insights.seo_improvement_suggestions,
    },
    {
      icon: <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      label: 'Thumbnail Improvements',
      color: 'text-purple-600 dark:text-purple-400',
      items: insights.thumbnail_improvement_suggestions,
    },
    {
      icon: <Lightbulb className="w-4 h-4 text-primary" />,
      label: 'Future Video Ideas',
      color: 'text-primary',
      items: insights.future_video_ideas,
    },
    {
      icon: <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      label: 'Recommendations',
      color: 'text-teal-600 dark:text-teal-400',
      items: insights.recommendations,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Text sections */}
      {([
        { label: 'Content Category Performance', text: insights.content_category_performance, color: 'text-primary' },
        { label: 'Audience Behavior Insights', text: insights.audience_behavior_insights, color: 'text-purple-600 dark:text-purple-400' },
        { label: 'Recommended Content Strategy', text: insights.recommended_content_strategy, color: 'text-emerald-600 dark:text-emerald-400' },
      ] as { label: string; text: string; color: string }[]).filter(s => s.text).map((s) => (
        <div key={s.label} className="space-y-2 rounded-2xl border border-border bg-card p-5">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${s.color}`}>{s.label}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
        </div>
      ))}

      {/* List sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.filter(s => s.items?.length > 0).map((s) => (
          <div key={s.label} className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <p className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${s.color}`}>
              {s.icon}{s.label}
            </p>
            <ul className="space-y-1.5">
              {s.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className={`mt-0.5 shrink-0 ${s.color}`}>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Script Outline Block ──────────────────────────────────────────────────────

function ScriptOutlineBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Full Script Outline — Top Pick
        </div>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Copied</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy</>
          )}
        </Button>
      </div>
      <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed text-muted-foreground">
        {text}
      </pre>
    </div>
  );
}

// ─── Suggestions panel ────────────────────────────────────────────────────────

function SuggestionsPanel({
  suggestions,
  scriptOutline,
}: {
  suggestions: YTContentSuggestion[];
  scriptOutline?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm font-semibold text-foreground">Top 5 Content Suggestions</p>
        </div>
        {suggestions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No content suggestions available for this run.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((item, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    isTop
                      ? 'border-primary/50 bg-primary/10 shadow-sm'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isTop ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {isTop && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Top Pick
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-foreground">{item.title}</h3>

                  <div className="space-y-3 pt-1">
                    {item.hook && (
                      <div className="rounded-xl border border-border bg-muted/50 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          Hook (First 10 Seconds)
                        </p>
                        <p className="text-xs italic leading-relaxed text-muted-foreground">"{item.hook}"</p>
                      </div>
                    )}
                    {item.rationale && (
                      <div className="rounded-xl border border-border bg-muted/50 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Why This Will Work
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{item.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {scriptOutline && <ScriptOutlineBlock text={scriptOutline} />}
    </div>
  );
}

// ─── Main analysis result ─────────────────────────────────────────────────────

function AnalysisResult({ run }: { run: YTAnalysisRun }) {
  const summary = run.analysis_summary;
  const videos = summary?.video_analysis ?? [];
  const insights = summary?.overall_channel_insights;
  const [activeSection, setActiveSection] = useState<'videos' | 'insights' | 'suggestions'>('videos');
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions: YTContentSuggestion[] = (summary?.top_5_content_suggestions && summary.top_5_content_suggestions.length > 0)
    ? summary.top_5_content_suggestions
    : (run.generated_ideas || []).map((idea: any) =>
        typeof idea === 'string'
          ? { title: idea, hook: 'High-CTR hook script based on channel pattern analysis.', rationale: 'Recommended content direction.' }
          : idea
      );

  const scriptOutline = summary?.top_pick_script_outline || run.script_outline || undefined;

  const filtered = searchQuery
    ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : videos;

  const avgOverall = videos.length
    ? (videos.reduce((sum, v) => {
        const a = v.analysis;
        return sum + (a.overall_score || (a.title_score + a.thumbnail_score + a.seo_score + a.content_score) / 4);
      }, 0) / videos.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Videos Analyzed', value: run.videos_analyzed_count, icon: <BarChart3 className="w-4 h-4 text-red-400" />, },
          { label: 'Avg Score', value: avgOverall, icon: <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />, },
          { label: 'Total Views', value: videos.reduce((s, v) => s + v.views, 0).toLocaleString(), icon: <Eye className="w-4 h-4 text-primary" />, },
          { label: 'Avg Engagement', value: videos.length ? (videos.reduce((s, v) => s + v.engagement_rate_pct, 0) / videos.length).toFixed(2) + '%' : '—', icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">{s.icon}{s.label}</div>
            <span className="text-xl font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveSection('videos')}
          variant={activeSection === 'videos' ? 'default' : 'outline'}
          size="sm"
          className="rounded-xl px-4 py-2 text-xs font-semibold"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Per-Video Analysis ({videos.length})
        </Button>
        <Button
          onClick={() => setActiveSection('insights')}
          variant={activeSection === 'insights' ? 'default' : 'outline'}
          size="sm"
          className="rounded-xl px-4 py-2 text-xs font-semibold"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Channel Insights
        </Button>
        <Button
          onClick={() => setActiveSection('suggestions')}
          variant={activeSection === 'suggestions' ? 'default' : 'outline'}
          size="sm"
          className="rounded-xl px-4 py-2 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
          Content Suggestions ({suggestions.length})
        </Button>
      </div>

      {/* Per-video section */}
      {activeSection === 'videos' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            {filtered.map((v, idx) => (
              <VideoCard key={v.video_id || idx} video={v} rank={idx + 1} />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No videos match your search.</p>
            )}
          </div>
        </div>
      )}

      {/* Channel insights section */}
      {activeSection === 'insights' && insights && (
        <ChannelInsights insights={insights} />
      )}

      {/* Content Suggestions section */}
      {activeSection === 'suggestions' && (
        <SuggestionsPanel suggestions={suggestions} scriptOutline={scriptOutline} />
      )}
    </div>
  );
}

function HistoryPanel({
  history,
  onSelect,
  onDelete,
}: {
  history: YTAnalysisRun[];
  onSelect: (run: YTAnalysisRun) => void;
  onDelete: (run: YTAnalysisRun) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No past analyses yet. Submit a channel URL above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((run) => {
        const ch = run.channel;
        return (
          <div
            key={run.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(run)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(run);
              }
            }}
            className="group flex h-auto w-full cursor-pointer items-center justify-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ch?.thumbnail_url && (
              <img
                src={ch.thumbnail_url}
                alt={ch.channel_title}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {ch?.channel_title || `Run #${run.id}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {run.videos_analyzed_count} videos · {timeAgo(run.created_at)}
              </p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                run.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : run.status === 'failed'
                  ? 'bg-destructive/10 text-destructive border border-destructive/30'
                  : 'bg-amber-50 text-amber-700 border border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {run.status}
            </span>
            <button
              type="button"
              aria-label={`Delete ${ch?.channel_title || `analysis run ${run.id}`}`}
              title="Delete analysis"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(run);
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function YTChannelAnalysisPage() {
  const [channelUrl, setChannelUrl] = useState('');
  const [videoCount, setVideoCount] = useState<10 | 20 | 30 | 50>(50);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'fetching' | 'transcribing' | 'analyzing'>('idle');
  const [currentRun, setCurrentRun] = useState<YTAnalysisRun | null>(null);
  const [history, setHistory] = useState<YTAnalysisRun[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');

  const VIDEO_COUNT_OPTIONS: (10 | 20 | 30 | 50)[] = [10, 20, 30, 50];

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getChannelAnalysisHistoryApi();
      setHistory(data.history || []);
    } catch {
      // silently ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl.trim()) {
      toast.error('Please enter a YouTube channel URL.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCurrentRun(null);
    setStep('fetching');

    const t1 = setTimeout(() => setStep('transcribing'), 8000);
    const t2 = setTimeout(() => setStep('analyzing'), 20000);

    try {
      const res = await startChannelAnalysisApi(channelUrl.trim(), videoCount);
      clearTimeout(t1);
      clearTimeout(t2);

      setCurrentRun(res.run);
      setChannelUrl('');
      toast.success('Channel analysis complete!');
      loadHistory();
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      const msg =
        err.response?.data?.error || err.message || 'Analysis failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const handleDelete = async (run: YTAnalysisRun) => {
    if (!window.confirm('Delete this saved channel analysis? This cannot be undone.')) return;
    try {
      await deleteChannelAnalysisRunApi(run.id);
      setHistory((items) => items.filter((item) => item.id !== run.id));
      if (currentRun?.id === run.id) setCurrentRun(null);
      toast.success('Channel analysis deleted.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete channel analysis.');
    }
  };

  const stepLabels: Record<typeof step, string> = {
    idle: '',
    fetching: `Fetching last ${videoCount} videos via YouTube API...`,
    transcribing: 'Extracting video transcripts...',
    analyzing: 'Analyzing patterns and generating ideas...',
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <PageHeader
              eyebrow="Content intelligence"
              title="YouTube Channel Analyzer"
              description="Analyze recent uploads, uncover channel patterns, and turn performance data into actionable content ideas."
              icon={<YouTubeIcon className="h-6 w-6 text-red-400" />}
            />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Video Count Selector */}
            <div className="flex items-center gap-3">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Videos to Scan</span>
                <span className="text-[10px] text-muted-foreground/80">from latest uploads</span>
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
                {VIDEO_COUNT_OPTIONS.map((count) => (
                  <Button
                    key={count}
                    id={`video-count-${count}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoCount(count)}
                    disabled={loading}
                    className={`h-8 px-3 ${
                      videoCount === count
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {count}
                  </Button>
                ))}
              </div>
              {videoCount < 50 && (
                <span className="text-[10px] text-amber-500/80 font-medium">
                  Faster analysis
                </span>
              )}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="yt-channel-url"
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@channelhandle or channel ID"
                  disabled={loading}
                  className="h-12 rounded-2xl border-input bg-background pl-10 pr-4 text-foreground"
                />
              </div>
              <Button
                id="analyze-channel-btn"
                type="submit"
                size="lg"
                disabled={loading || !channelUrl.trim()}
                className="h-12 rounded-2xl"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Channel</>
                )}
              </Button>
            </div>

            {/* Progress status */}
            {loading && step !== 'idle' && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                <p className="text-sm text-primary">{stepLabels[step]}</p>
              </div>
            )}

            {/* Error */}
            {errorMsg && !loading && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errorMsg}</p>
              </div>
            )}
          </form>

          {/* Tabs */}
          <div className="flex w-fit gap-1 rounded-xl border border-border bg-muted/50 p-1">
            {(['analyze', 'history'] as const).map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={`h-9 rounded-lg px-5 capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'analyze' ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Results
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> History
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'analyze' && (
            <>
              {!currentRun && !loading && (
                <Card className="border-border bg-card">
                  <CardContent className="space-y-4 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    Enter a YouTube channel URL above. The system will fetch the last 50 videos,
                    analyze transcripts, and generate content ideas with a full script.
                  </p>
                  </CardContent>
                </Card>
              )}
              {currentRun && currentRun.status === 'completed' && (
                <div>
                  <AnalysisResult run={currentRun} />
                </div>
              )}
              {currentRun && currentRun.status === 'failed' && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                    <p className="mt-1 text-xs text-destructive/80">{currentRun.error_message}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <HistoryPanel
                  history={history}
                  onSelect={(run) => {
                    setCurrentRun(run);
                    setActiveTab('analyze');
                  }}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
