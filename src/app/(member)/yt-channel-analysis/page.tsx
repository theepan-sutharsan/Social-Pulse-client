'use client';

import { useState, useEffect } from 'react';
import { AuthenticatedRoute } from '@/components/auth-guard';
import {
  startChannelAnalysisApi,
  getChannelAnalysisHistoryApi,
  getChannelAnalysisRunApi,
} from '@/services/yt-channel-analysis';
import { YTAnalysisRun, YTVideoIdea } from '@/types/yt-channel-analysis';
import { toast } from 'sonner';
import {
  BarChart3,
  Sparkles,
  Loader2,
  History,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  FileText,
  Clock,
  Tag,
  TrendingUp,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Cpu,
  Bot,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  index,
  isTop,
}: {
  idea: YTVideoIdea;
  index: number;
  isTop: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`rounded-2xl border p-5 space-y-3 transition-all ${
        isTop
          ? 'border-indigo-500/50 bg-indigo-950/30 shadow-lg shadow-indigo-900/20'
          : 'border-slate-800/60 bg-slate-900/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isTop ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {index + 1}
          </span>
          {isTop && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-full">
              Top Pick
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <h3 className="text-white font-semibold text-sm leading-snug">{idea.title}</h3>

      {expanded && (
        <div className="space-y-3 pt-1">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
              Hook (First 10 Seconds)
            </p>
            <p className="text-slate-300 text-xs leading-relaxed italic">"{idea.hook}"</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
              Why This Will Work
            </p>
            <p className="text-slate-300 text-xs leading-relaxed">{idea.rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptOutlineBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-slate-800/40">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <FileText className="w-4 h-4 text-indigo-400" />
          Full Script Outline — Top Pick
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700/50"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy</>
          )}
        </button>
      </div>
      <pre className="p-5 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
        {text}
      </pre>
    </div>
  );
}

function AnalysisResult({ run }: { run: YTAnalysisRun }) {
  const summary = run.analysis_summary;
  const ideas = run.generated_ideas || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Videos Analyzed',
            value: run.videos_analyzed_count,
            icon: <BarChart3 className="w-4 h-4 text-red-400" />,
          },
          {
            label: 'Ideas Generated',
            value: ideas.length,
            icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
          },
          {
            label: 'Optimal Duration',
            value: formatDuration(summary?.optimal_duration_seconds ?? 0),
            icon: <Clock className="w-4 h-4 text-indigo-400" />,
          },
          {
            label: 'Topic Clusters',
            value: (summary?.topic_clusters ?? []).length,
            icon: <Tag className="w-4 h-4 text-emerald-400" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs">{s.icon}{s.label}</div>
            <span className="text-white font-bold text-xl">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      {summary?.performance_insights && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Performance Insights
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{summary.performance_insights}</p>
        </div>
      )}

      {/* Title Patterns + Content Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary?.title_patterns && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Title Patterns</p>
            <p className="text-slate-300 text-sm leading-relaxed">{summary.title_patterns}</p>
          </div>
        )}
        {summary?.content_gaps && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Content Gaps</p>
            <p className="text-slate-300 text-sm leading-relaxed">{summary.content_gaps}</p>
          </div>
        )}
      </div>

      {/* Topic Clusters */}
      {(summary?.topic_clusters ?? []).length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Topic Clusters</p>
          <div className="flex flex-wrap gap-2">
            {(summary!.topic_clusters).map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Video Ideas */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-semibold text-sm">Generated Video Ideas</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {ideas.map((idea, idx) => (
              <IdeaCard key={idx} idea={idea} index={idx} isTop={idx === 0} />
            ))}
          </div>
        </div>
      )}

      {/* Script Outline */}
      {run.script_outline && (
        <ScriptOutlineBlock text={run.script_outline} />
      )}
    </div>
  );
}

function HistoryPanel({
  history,
  onSelect,
}: {
  history: YTAnalysisRun[];
  onSelect: (run: YTAnalysisRun) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm">
        No past analyses yet. Submit a channel URL above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((run) => {
        const ch = run.channel;
        return (
          <button
            key={run.id}
            onClick={() => onSelect(run)}
            className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-700/50 hover:bg-indigo-950/20 transition-all group"
          >
            {ch?.thumbnail_url && (
              <img
                src={ch.thumbnail_url}
                alt={ch.channel_title}
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {ch?.channel_title || `Run #${run.id}`}
              </p>
              <p className="text-slate-500 text-xs">
                {run.videos_analyzed_count} videos · {timeAgo(run.created_at)}
              </p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                run.status === 'completed'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  : run.status === 'failed'
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                  : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
              }`}
            >
              {run.status}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function YTChannelAnalysisPage() {
  const [channelUrl, setChannelUrl] = useState('');
  const [provider, setProvider] = useState<'claude' | 'gemini'>('claude');
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
      const res = await startChannelAnalysisApi(channelUrl.trim(), provider, videoCount);
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

  const stepLabels: Record<typeof step, string> = {
    idle: '',
    fetching: `Fetching last ${videoCount} videos via YouTube API...`,
    transcribing: 'Extracting video transcripts...',
    analyzing: provider === 'gemini'
      ? 'Gemini AI is analyzing patterns & generating ideas...'
      : 'Claude AI is analyzing patterns & generating ideas...',
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-[#030718]">
        {/* Header */}
        <div className="border-b border-slate-800/60 bg-[#040a1e]/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  YT Channel Analyzer
                </h1>
                <p className="text-slate-400 text-sm">
                  AI-powered video idea generator & script creator
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Provider Selector */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">AI Provider</span>
              <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-800/60 rounded-xl">
                <button
                  id="provider-claude"
                  type="button"
                  onClick={() => setProvider('claude')}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    provider === 'claude'
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Claude
                </button>
                <button
                  id="provider-gemini"
                  type="button"
                  onClick={() => setProvider('gemini')}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    provider === 'gemini'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow shadow-blue-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Gemini
                </button>
              </div>
            </div>

            {/* Video Count Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Videos to Analyze</span>
              <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-800/60 rounded-xl">
                {VIDEO_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    id={`video-count-${count}`}
                    type="button"
                    onClick={() => setVideoCount(count)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      videoCount === count
                        ? 'bg-slate-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              {videoCount < 50 && (
                <span className="text-[10px] text-amber-500/80 font-medium">
                  Fewer = faster analysis
                </span>
              )}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="yt-channel-url"
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@channelhandle or channel ID"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 transition-all"
                />
              </div>
              <button
                id="analyze-channel-btn"
                type="submit"
                disabled={loading || !channelUrl.trim()}
                className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all shrink-0"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Channel</>
                )}
              </button>
            </div>

            {/* Progress status */}
            {loading && step !== 'idle' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                <p className="text-indigo-300 text-sm">{stepLabels[step]}</p>
              </div>
            )}

            {/* Error */}
            {errorMsg && !loading && (
              <div className="flex items-start gap-3 px-4 py-3 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300 text-sm">{errorMsg}</p>
              </div>
            )}
          </form>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800/60 rounded-xl w-fit">
            {(['analyze', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
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
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'analyze' && (
            <>
              {!currentRun && !loading && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center mx-auto">
                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Enter a YouTube channel URL above. The system will fetch the last 50 videos,
                    analyze transcripts, and use your selected AI to generate content ideas and a full script.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                    <span>Powered by</span>
                    <span className={`font-semibold ${
                      provider === 'gemini' ? 'text-teal-400' : 'text-indigo-400'
                    }`}>
                      {provider === 'gemini' ? '✦ Google Gemini' : '◆ Anthropic Claude'}
                    </span>
                  </div>
                </div>
              )}
              {currentRun && currentRun.status === 'completed' && (
                <div className="space-y-4">
                  {/* Provider badge */}
                  {currentRun.analysis_summary?.ai_provider && (
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                      currentRun.analysis_summary.ai_provider === 'gemini'
                        ? 'bg-teal-950/50 text-teal-400 border-teal-800/40'
                        : 'bg-indigo-950/50 text-indigo-400 border-indigo-800/40'
                    }`}>
                      {currentRun.analysis_summary.ai_provider === 'gemini'
                        ? <><Cpu className="w-3 h-3" /> Analyzed by Gemini</>
                        : <><Bot className="w-3 h-3" /> Analyzed by Claude</>
                      }
                    </div>
                  )}
                  <AnalysisResult run={currentRun} />
                </div>
              )}
              {currentRun && currentRun.status === 'failed' && (
                <div className="flex items-start gap-3 px-5 py-4 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-rose-300 font-medium text-sm">Analysis Failed</p>
                    <p className="text-rose-400/80 text-xs mt-1">{currentRun.error_message}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : (
                <HistoryPanel
                  history={history}
                  onSelect={(run) => {
                    setCurrentRun(run);
                    setActiveTab('analyze');
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
