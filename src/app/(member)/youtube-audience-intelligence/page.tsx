'use client';

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BrainCircuit,
  Clock3,
  Filter,
  History,
  LoaderCircle,
  MessageCircleQuestion,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ExportButton } from "@/components/export-button";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { API_URL } from "@/lib/api-client";
import {
  estimateAudienceAnalysisApi,
  getAudienceCommentsApi,
  getAudienceHistoryApi,
  getAudienceRunApi,
  deleteAudienceRunApi,
  purgeAudienceCommentsApi,
  startAudienceAnalysisApi,
} from "@/services/youtube-audience-intelligence";
import type {
  AudienceComment,
  AudienceDistribution,
  AudienceReport,
  AudienceRun,
  AudienceRunStatus,
  AudienceUsage,
} from "@/types/youtube-audience-intelligence";

const ACTIVE_STATUSES: AudienceRunStatus[] = ["PENDING", "FETCHING", "PREPROCESSING", "CLASSIFYING", "CLUSTERING", "ANALYZING", "AGGREGATING", "SUMMARIZING"];
const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#e11d48", "#8b5cf6"];

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function formatNumber(value: unknown) {
  return number(value).toLocaleString();
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: AudienceRunStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase().replaceAll("_", " ");
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) {
  return (
    <Card className="gap-3 py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
        {detail && <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="min-h-[300px]">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="min-h-[235px] flex-1 px-4 pt-4">{children}</CardContent>
    </Card>
  );
}

function DistributionChart({ data, color = COLORS[0] }: { data: AudienceDistribution[]; color?: string }) {
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No classified data yet.</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 6, bottom: 6 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="label" width={100} fontSize={11} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(value: unknown) => [`${number(value)}%`, "Share"]} />
        <Bar dataKey="percentage" radius={[0, 6, 6, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopicChart({ report }: { report: AudienceReport }) {
  const data = report.top_topics.slice(0, 8).map((item) => ({ name: item.label, comments: number(item.count) }));
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No topics detected yet.</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 6, bottom: 36 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={55} fontSize={10} stroke="hsl(var(--muted-foreground))" />
        <YAxis allowDecimals={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
        <Tooltip />
        <Bar dataKey="comments" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopicSentimentChart({ report }: { report: AudienceReport }) {
  const data = report.topic_sentiment.slice(0, 8).map((item) => ({
    topic: item.topic,
    positive: item.positive_percentage,
    negative: item.negative_percentage,
  }));
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Topic sentiment appears after classification.</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 6, bottom: 36 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="topic" angle={-25} textAnchor="end" interval={0} height={55} fontSize={10} stroke="hsl(var(--muted-foreground))" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={10} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(value: unknown) => [`${number(value)}%`, "Share"]} />
        <Bar dataKey="positive" name="Positive" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" name="Negative" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TimelineChart({ report }: { report: AudienceReport }) {
  const data = report.timeline.slice(-24).map((item) => ({
    bucket: text(item.bucket).replace(/T.*/, ""),
    comments: number(item.comment_volume),
    positive: number(item.positive),
    negative: number(item.negative),
  }));
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Timeline appears when comments include timestamps.</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 4, right: 8, top: 6, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="bucket" hide />
        <YAxis allowDecimals={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
        <Tooltip />
        <Line type="monotone" dataKey="comments" stroke={COLORS[0]} strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="positive" stroke={COLORS[2]} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="negative" stroke={COLORS[4]} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AudienceScore({ report }: { report: AudienceReport }) {
  const value = Math.max(0, Math.min(100, number(report.audience_score)));
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
      <CardContent className="flex items-center gap-5 px-5 py-5">
        <div className="relative flex size-28 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#4f46e5 ${value}%, hsl(var(--muted)) 0)` }}>
          <div className="flex size-20 flex-col items-center justify-center rounded-full bg-card">
            <span className="text-3xl font-black text-foreground">{value}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Audience reaction score</p>
          <h2 className="mt-1 text-xl font-black text-foreground">{report.audience_score_label || "Uncertain"}</h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{report.executive_summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceList({ title, rows, empty }: { title: string; rows: Array<Record<string, unknown>>; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length ? rows.slice(0, 6).map((row, index) => (
          <div key={`${text(row.label, text(row.opportunity, String(index)))}`} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{text(row.label, text(row.opportunity, text(row.video_idea, text(row.signal, text(row.action, `Insight ${index + 1}`)))))}</p>
              <Badge variant={text(row.priority) === "HIGH" ? "destructive" : "secondary"}>{text(row.priority, text(row.severity, "Evidence"))}</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{text(row.reason, text(row.recommended_action, "Evidence-linked insight from stored comments."))}</p>
            {Array.isArray(row.supporting_comments) ? <p className="mt-2 text-[11px] text-primary">{number(row.frequency)} supporting comments · confidence {Math.round(number(row.confidence) * 100)}%</p> : null}
          </div>
        )) : <p className="text-sm text-muted-foreground">{empty}</p>}
      </CardContent>
    </Card>
  );
}

function CommentTable({ comments, total, onSearch, onSentiment, onTopic, onLanguage, onIntent, onEmotion, onPersona, onSpam, onToxicity, onSort, onMinQuality, search, sentiment, topic, language, intent, emotion, persona, spam, toxicity, sort, minQuality, topics, languages, intents, emotions, personas, loading }: {
  comments: AudienceComment[];
  total: number;
  onSearch: (value: string) => void;
  onSentiment: (value: string) => void;
  onTopic: (value: string) => void;
  onLanguage: (value: string) => void;
  onIntent: (value: string) => void;
  onEmotion: (value: string) => void;
  onPersona: (value: string) => void;
  onSpam: (value: string) => void;
  onToxicity: (value: string) => void;
  onSort: (value: string) => void;
  onMinQuality: (value: string) => void;
  search: string;
  sentiment: string;
  topic: string;
  language: string;
  intent: string;
  emotion: string;
  persona: string;
  spam: string;
  toxicity: string;
  sort: string;
  minQuality: string;
  topics: string[];
  languages: string[];
  intents: string[];
  emotions: string[];
  personas: string[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Comment evidence</CardTitle>
          <CardDescription>{formatNumber(total)} stored comments · filterable, searchable, and linked to classifications</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-52">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search comments, authors, topics" className="pl-9" />
          </div>
          <Select value={sentiment} onChange={(event) => onSentiment(event.target.value)} className="w-36">
            <option value="">All sentiment</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
            <option value="Mixed">Mixed</option>
          </Select>
          <Select value={topic} onChange={(event) => onTopic(event.target.value)} className="w-40">
            <option value="">All topics</option>
            {topics.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={language} onChange={(event) => onLanguage(event.target.value)} className="w-36">
            <option value="">All languages</option>
            {languages.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={intent} onChange={(event) => onIntent(event.target.value)} className="w-44">
            <option value="">All intents</option>
            {intents.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={emotion} onChange={(event) => onEmotion(event.target.value)} className="w-36">
            <option value="">All emotions</option>
            {emotions.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={persona} onChange={(event) => onPersona(event.target.value)} className="w-40">
            <option value="">All personas</option>
            {personas.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={spam} onChange={(event) => onSpam(event.target.value)} className="w-32">
            <option value="">Spam: all</option><option value="false">Organic</option><option value="true">Spam signal</option>
          </Select>
          <Select value={toxicity} onChange={(event) => onToxicity(event.target.value)} className="w-36">
            <option value="">Toxicity: all</option><option value="false">Non-toxic</option><option value="true">Toxic</option>
          </Select>
          <Select value={minQuality} onChange={(event) => onMinQuality(event.target.value)} className="w-36">
            <option value="">Quality: all</option><option value="75">Quality 75+</option><option value="45">Quality 45+</option><option value="0">All scored</option>
          </Select>
          <Select value={sort} onChange={(event) => onSort(event.target.value)} className="w-40">
            <option value="highest_quality">Sort: quality</option><option value="most_liked">Most liked</option><option value="most_replied">Most replied</option><option value="lowest_quality">Lowest quality</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-6 py-3">Comment</th><th className="px-3 py-3">Signals</th><th className="px-3 py-3">Topic</th><th className="px-3 py-3">Quality</th><th className="px-6 py-3 text-right">Engagement</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground"><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : comments.length ? comments.map((comment) => (
                <tr key={comment.comment_id} className="align-top hover:bg-muted/20">
                  <td className="max-w-[360px] px-6 py-4"><p className="line-clamp-3 text-sm leading-5 text-foreground">{comment.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{comment.author || "Anonymous viewer"} · {formatDate(comment.published_at)}</p></td>
                  <td className="px-3 py-4"><div className="flex flex-wrap gap-1.5"><Badge variant={comment.sentiment === "Positive" ? "success" : comment.sentiment === "Negative" ? "destructive" : "secondary"}>{comment.sentiment || "Uncertain"}</Badge>{comment.emotion && <Badge variant="outline">{comment.emotion}</Badge>}{comment.spam && <Badge variant="warning">Spam signal</Badge>}{comment.toxicity && <Badge variant="destructive">Toxicity</Badge>}</div></td>
                  <td className="px-3 py-4 text-xs text-muted-foreground">{comment.topic || "—"}<br />{comment.intent || "—"}</td>
                  <td className="px-3 py-4"><span className="font-semibold text-foreground">{Math.round(number(comment.quality_score))}</span><span className="text-xs text-muted-foreground">/100</span><p className="text-[11px] text-muted-foreground">{Math.round(number(comment.confidence) * 100)}% confidence</p></td>
                  <td className="px-6 py-4 text-right text-xs text-muted-foreground">{formatNumber(comment.likes)} likes<br />{formatNumber(comment.replies)} replies</td>
                </tr>
              )) : <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">No comments match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function YouTubeAudienceIntelligencePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [requestedCount, setRequestedCount] = useState<number | "all">(500);
  const [countMode, setCountMode] = useState("500");
  const [customCount, setCustomCount] = useState("750");
  const [provider, setProvider] = useState("auto");
  const [usage, setUsage] = useState<AudienceUsage | null>(null);
  const [currentRun, setCurrentRun] = useState<AudienceRun | null>(null);
  const [history, setHistory] = useState<AudienceRun[]>([]);
  const [comments, setComments] = useState<AudienceComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("");
  const [intent, setIntent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [persona, setPersona] = useState("");
  const [spam, setSpam] = useState("");
  const [toxicity, setToxicity] = useState("");
  const [sort, setSort] = useState("highest_quality");
  const [minQuality, setMinQuality] = useState("");
  const [topCommentGroups, setTopCommentGroups] = useState<Record<string, AudienceComment[]>>({});
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [historyLoadingId, setHistoryLoadingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const report = currentRun?.report || null;
  const isActive = Boolean(currentRun && ACTIVE_STATUSES.includes(currentRun.status));
  const progressLabel = currentRun ? `${statusLabel(currentRun.current_stage)} · ${Math.round(number(currentRun.progress_pct))}%` : "";

  useEffect(() => {
    getAudienceHistoryApi().then(setHistory).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!currentRun || !ACTIVE_STATUSES.includes(currentRun.status)) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const next = await getAudienceRunApi(currentRun.id);
        if (!cancelled) setCurrentRun(next);
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : "Unable to read analysis progress.");
      }
    }, 1500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [currentRun]);

  useEffect(() => {
    if (!currentRun || currentRun.status !== "COMPLETED") return;
    let cancelled = false;
    // The loading state tracks an external request started by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommentLoading(true);
    getAudienceCommentsApi(currentRun.id, { q: search || undefined, sentiment: sentiment || undefined, topic: topic || undefined, language: language || undefined, intent: intent || undefined, emotion: emotion || undefined, persona: persona || undefined, spam: spam || undefined, toxicity: toxicity || undefined, min_quality: minQuality || undefined, per_page: 50, sort })
      .then((result) => { if (!cancelled) { setComments(result.comments); setCommentTotal(result.total); } })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setCommentLoading(false); });
    return () => { cancelled = true; };
  }, [currentRun, search, sentiment, topic, language, intent, emotion, persona, spam, toxicity, minQuality, sort]);

  useEffect(() => {
    if (!currentRun || currentRun.status !== "COMPLETED") return;
    let cancelled = false;
    // The state update reflects external requests started by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopCommentGroups({});
    Promise.all([
      ["Most liked", "most_liked"],
      ["Most replied", "most_replied"],
      ["Highest quality", "highest_quality"],
    ].map(async ([label, sort]) => [label, (await getAudienceCommentsApi(currentRun.id, { per_page: 3, sort })).comments] as const))
      .then((groups) => { if (!cancelled) setTopCommentGroups(Object.fromEntries(groups)); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [currentRun]);

  async function handleEstimate() {
    if (!videoUrl.trim()) { toast.error("Paste a YouTube video URL first."); return; }
    try {
      setEstimating(true); setErrorMessage("");
      const result = await estimateAudienceAnalysisApi(videoUrl.trim(), requestedCount);
      setUsage(result.usage);
      toast.success(`Video ID ${result.video_id} validated.`);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to estimate this analysis.");
      setErrorMessage(message); toast.error(message);
    } finally { setEstimating(false); }
  }

  async function handleStart() {
    if (!videoUrl.trim()) { toast.error("Paste a YouTube video URL first."); return; }
    try {
      setLoading(true); setErrorMessage("");
      const result = await startAudienceAnalysisApi(videoUrl.trim(), requestedCount, provider);
      setUsage(result.usage); setCurrentRun(result.run); setComments([]); setCommentTotal(0);
      toast.success("Audience intelligence analysis queued.");
      const nextHistory = await getAudienceHistoryApi(); setHistory(nextHistory);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to start this analysis.");
      setErrorMessage(message); toast.error(message);
    } finally { setLoading(false); }
  }

  async function handlePurge() {
    if (!currentRun || !window.confirm("Purge stored comments and classifications for this video? Completed report snapshots will remain.")) return;
    try {
      await purgeAudienceCommentsApi(currentRun.video_id);
      setComments([]); setCommentTotal(0); setTopCommentGroups({});
      toast.success("Stored comments purged. Historical report snapshots were preserved.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to purge stored comments.");
      setErrorMessage(message); toast.error(message);
    }
  }

  async function handleHistorySelect(run: AudienceRun) {
    try {
      setHistoryLoadingId(run.id); setErrorMessage("");
      const detail = await getAudienceRunApi(run.id);
      setCurrentRun(detail); setVideoUrl(detail.video_url); setComments([]); setCommentTotal(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to open this historical analysis.");
      setErrorMessage(message); toast.error(message);
    } finally { setHistoryLoadingId(null); }
  }

  async function handleHistoryDelete(run: AudienceRun) {
    if (!window.confirm("Delete this saved audience analysis? This cannot be undone.")) return;
    try {
      await deleteAudienceRunApi(run.id);
      setHistory((items) => items.filter((item) => item.id !== run.id));
      if (currentRun?.id === run.id) {
        setCurrentRun(null);
        setComments([]);
        setCommentTotal(0);
        setTopCommentGroups({});
      }
      toast.success("Audience analysis deleted.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete this audience analysis.");
      setErrorMessage(message); toast.error(message);
    }
  }

  const kpis = report?.kpis;
  const recommendationRows = useMemo(() => report?.content_opportunities || [], [report]);
  const filterOptions = useMemo(() => ({
    topics: (report?.top_topics || []).map((item) => text(item.label)).filter(Boolean),
    languages: (report?.languages || []).map((item) => text(item.label)).filter(Boolean),
    intents: (report?.audience_intent || []).map((item) => text(item.label)).filter(Boolean),
    emotions: (report?.emotions || []).map((item) => text(item.label)).filter(Boolean),
    personas: (report?.audience_personas || []).map((item) => text(item.label)).filter(Boolean),
  }), [report]);

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <PageHeader eyebrow="Audience intelligence" title="YouTube Audience Intelligence" description="Turn real viewer conversations into evidence-backed sentiment, demand, content opportunities, creator actions, and client-ready reports." icon={<BrainCircuit className="size-6" />} actions={report ? <div className="flex flex-wrap items-center gap-2"><ExportButton csvUrl={`${API_URL}/api/youtube-audience/runs/${currentRun?.id}/export.csv`} pdfUrl={`${API_URL}/api/youtube-audience/runs/${currentRun?.id}/export.pdf`} baseFilename={`youtube-audience-${currentRun?.video_id || "report"}`} /><Button type="button" variant="outline" size="sm" onClick={handlePurge}><Trash2 className="size-4" />Purge stored comments</Button></div> : undefined} />
          </div>
        </div>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Video className="size-5 text-primary" /> Start a video analysis</CardTitle><CardDescription>Validate a public YouTube URL, estimate API/AI usage, then run a versioned evidence pipeline. No secrets are sent to the browser.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/watch?v=... or youtu.be/..." disabled={isActive} className="h-12 pl-10" /></div>
                <Select value={countMode} onChange={(event) => { const value = event.target.value; setCountMode(value); setRequestedCount(value === "all" ? "all" : value === "custom" ? Math.max(1, Number(customCount) || 750) : Number(value)); }} disabled={isActive} className="h-12 lg:w-44"><option value="100">100 comments</option><option value="500">500 comments</option><option value="1000">1,000 comments</option><option value="2000">2,000 comments</option><option value="5000">5,000 comments</option><option value="10000">10,000 comments</option><option value="all">All available</option><option value="custom">Custom count</option></Select>
                {countMode === "custom" && <Input type="number" min={1} max={10000} value={customCount} onChange={(event) => { setCustomCount(event.target.value); setRequestedCount(Math.max(1, Math.min(10000, Number(event.target.value) || 1))); }} disabled={isActive} className="h-12 w-32" aria-label="Custom comment count" />}
                <Select value={provider} onChange={(event) => setProvider(event.target.value)} disabled={isActive} className="h-12 lg:w-36"><option value="auto">AI: Auto</option><option value="gemini">Gemini</option><option value="claude">Claude</option></Select>
                <Button type="button" variant="outline" size="lg" onClick={handleEstimate} disabled={estimating || isActive} className="h-12"><Clock3 className="size-4" />{estimating ? "Estimating" : "Estimate"}</Button>
                <Button type="button" size="lg" onClick={handleStart} disabled={loading || isActive || !videoUrl.trim()} className="h-12"><Sparkles className="size-4" />{isActive ? "Processing" : "Start analysis"}</Button>
              </div>
              {usage && <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-4"><div><span className="block text-xs text-muted-foreground">Requested</span><strong>{usage.requested_label}</strong></div><div><span className="block text-xs text-muted-foreground">API pages</span><strong>≈ {usage.estimated_api_pages}</strong></div><div><span className="block text-xs text-muted-foreground">AI batches</span><strong>≈ {usage.estimated_ai_batches}</strong></div><div><span className="block text-xs text-muted-foreground">Processing</span><strong>{usage.estimated_duration_label}</strong></div><p className="text-[11px] text-muted-foreground sm:col-span-4">{usage.label}</p></div>}
              {isActive && currentRun && <div className="rounded-xl border border-primary/30 bg-primary/10 p-4" role="status" aria-live="polite"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-primary"><LoaderCircle className="size-4 animate-spin" />{progressLabel}</div><span className="text-xs text-muted-foreground">{formatNumber(currentRun.analyzed_count)} / {formatNumber(currentRun.fetched_count)} analyzed</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/15"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(3, Math.min(100, number(currentRun.progress_pct)))}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">Stages are persisted so the dashboard can safely recover after refresh.</p></div>}
              {errorMessage && <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" />{errorMessage}</div>}
            </CardContent>
          </Card>

          {currentRun?.status === "FAILED" && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-start gap-3 px-5 py-4 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" /><div><p className="font-semibold text-destructive">Analysis failed safely</p><p className="mt-1 text-muted-foreground">{currentRun.error_message || "The worker stopped before completing this run. No partial result was presented as complete."}</p></div></CardContent></Card>}

          {report && currentRun?.status === "COMPLETED" && <>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"><AudienceScore report={report} /><Card><CardContent className="flex h-full items-center gap-4 px-5 py-5"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Video className="size-5" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{report.video.title || "YouTube video"}</p><p className="mt-1 text-xs text-muted-foreground">{report.video.channel_name || "Channel metadata"} · {formatDate(report.video.published_at)}</p><p className="mt-2 text-xs text-muted-foreground">{formatNumber(currentRun.analyzed_count)} analyzed · {formatNumber(currentRun.skipped_count)} skipped · model {currentRun.model_used || "deterministic"}</p></div></CardContent></Card></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Positive sentiment" value={`${number(kpis?.positive_percentage)}%`} detail={`${formatNumber(report.sentiment.find((item) => item.label === "Positive")?.count)} comments`} icon={<TrendingUp className="size-4" />} /><MetricCard label="Negative sentiment" value={`${number(kpis?.negative_percentage)}%`} detail="Separate from toxicity" icon={<ShieldAlert className="size-4" />} /><MetricCard label="Comment quality" value={`${number(kpis?.average_comment_quality)}/100`} detail="Evidence-based quality signal" icon={<Target className="size-4" />} /><MetricCard label="Engagement rate" value={`${number(kpis?.engagement_rate)}%`} detail="Calculated from video views" icon={<BarChart3 className="size-4" />} /></div>
            <div className="grid gap-4 lg:grid-cols-3"><ChartCard title="Sentiment distribution" description="Contextual labels from stored comments"><DistributionChart data={report.sentiment} /></ChartCard><ChartCard title="Emotions" description="Emotions are separate from sentiment"><DistributionChart data={report.emotions} color={COLORS[2]} /></ChartCard><ChartCard title="Languages" description="Original-language analysis"><DistributionChart data={report.languages} color={COLORS[3]} /></ChartCard></div>
            <div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Topic intelligence" description="Most discussed topics, not invented themes"><TopicChart report={report} /></ChartCard><ChartCard title="Audience reaction timeline" description="Volume and sentiment from published timestamps"><TimelineChart report={report} /></ChartCard></div>
            <div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Topic-wise sentiment" description="Positive and negative reaction by topic"><TopicSentimentChart report={report} /></ChartCard><ChartCard title="Audience intent" description="Why viewers are commenting"><DistributionChart data={report.audience_intent} color={COLORS[5]} /></ChartCard></div>
            <div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Likely audience personas" description="Broad segments inferred only from comment evidence"><DistributionChart data={report.audience_personas} color={COLORS[1]} /></ChartCard><ChartCard title="Comment quality distribution" description="Relevance, detail, specificity, and engagement signals"><DistributionChart data={report.comment_quality.distribution} color={COLORS[3]} /></ChartCard></div>
            <div className="grid gap-4 lg:grid-cols-3"><Card><CardHeader><CardTitle className="text-base">Spam and bot signals</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="text-muted-foreground">Spam:</span> <strong>{formatNumber(report.spam_analysis.spam_count)} ({number(report.spam_analysis.spam_percentage)}%)</strong></p><p><span className="text-muted-foreground">Suspicious:</span> <strong>{formatNumber(report.bot_analysis.suspicious_count)}</strong></p><p className="text-xs text-muted-foreground">Signals are probabilistic and never delete comments automatically.</p></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Toxicity and safety</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="text-muted-foreground">Toxic comments:</span> <strong>{formatNumber(report.toxicity.toxic_count)} ({number(report.toxicity.toxic_percentage)}%)</strong></p><p className="text-xs text-muted-foreground">Toxicity is kept separate from sentiment and spam.</p></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Sarcasm signals</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="text-muted-foreground">Detected:</span> <strong>{formatNumber(report.sarcasm.sarcastic_count)} ({number(report.sarcasm.sarcastic_percentage)}%)</strong></p><p className="text-xs text-muted-foreground">Sarcasm is independently classified with confidence.</p></CardContent></Card></div>
            <div className="grid gap-4 lg:grid-cols-2"><EvidenceList title="Audience demand and opportunities" rows={recommendationRows as Array<Record<string, unknown>>} empty="No repeated requests reached the evidence threshold yet." /><EvidenceList title="Priority creator actions" rows={report.priority_actions} empty="No priority action is supported by the current evidence." /></div>
            <div className="grid gap-4 lg:grid-cols-3"><EvidenceList title="Top questions to answer" rows={report.questions as Array<Record<string, unknown>>} empty="No recurring questions detected." /><EvidenceList title="Complaints and pain points" rows={report.complaints as Array<Record<string, unknown>>} empty="No recurring complaint detected." /><EvidenceList title="Reply opportunities" rows={report.reply_opportunities} empty="No safe reply opportunity detected." /></div>
            <div className="grid gap-4 lg:grid-cols-3"><EvidenceList title="Next video recommendations" rows={report.next_video_recommendations} empty="No evidence-backed next-video recommendation yet." /><EvidenceList title="Business opportunity signals" rows={report.business_insights} empty="No business signal was observed in the stored comments." /><Card><CardHeader><CardTitle className="text-base">Creator recommendations</CardTitle></CardHeader><CardContent className="space-y-3">{report.creator_recommendations.length ? report.creator_recommendations.map((recommendation) => <p key={recommendation} className="rounded-xl border border-border bg-muted/20 p-3 text-sm leading-5">{recommendation}</p>) : <p className="text-sm text-muted-foreground">No creator recommendation yet.</p>}</CardContent></Card></div>
            <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageCircleQuestion className="size-4 text-primary" /> Executive summary</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What viewers loved</p><p className="mt-1 leading-6 text-foreground">{text(report.summary.what_viewers_loved)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main problem</p><p className="mt-1 leading-6 text-foreground">{text(report.summary.main_problem)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended action</p><p className="mt-1 leading-6 text-foreground">{text(report.summary.recommended_action)}</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Historical comparison</CardTitle><CardDescription>Run-over-run changes are shown only when a previous completed run exists.</CardDescription></CardHeader><CardContent>{report.historical_comparison.available ? <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><span className="block text-xs text-muted-foreground">Audience score delta</span><strong>{number(report.historical_comparison.audience_score_delta) > 0 ? "+" : ""}{number(report.historical_comparison.audience_score_delta)}</strong></div><div><span className="block text-xs text-muted-foreground">Positive sentiment delta</span><strong>{number(report.historical_comparison.positive_percentage_delta) > 0 ? "+" : ""}{number(report.historical_comparison.positive_percentage_delta)}%</strong></div><div><span className="block text-xs text-muted-foreground">Topics added</span><strong>{Array.isArray(report.historical_comparison.topics_added) ? report.historical_comparison.topics_added.length : 0}</strong></div><div><span className="block text-xs text-muted-foreground">Demand changes</span><strong>{Array.isArray(report.historical_comparison.demand_added) ? report.historical_comparison.demand_added.length : 0}</strong></div></div> : <p className="text-sm text-muted-foreground">{text(report.historical_comparison.message, "Run this video again to compare audience trends.")}</p>}</CardContent></Card>
            <div className="grid gap-4 lg:grid-cols-3">
              {Object.entries(topCommentGroups).map(([label, rows]) => <Card key={label}><CardHeader><CardTitle className="text-base">{label}</CardTitle><CardDescription>Evidence from the stored comment set</CardDescription></CardHeader><CardContent className="space-y-3">{rows.length ? rows.map((comment) => <div key={comment.comment_id} className="rounded-xl border border-border bg-muted/20 p-3"><p className="line-clamp-3 text-sm leading-5 text-foreground">{comment.text}</p><p className="mt-2 text-[11px] text-muted-foreground">{formatNumber(comment.likes)} likes · {formatNumber(comment.replies)} replies · quality {Math.round(number(comment.quality_score))}/100</p></div>) : <p className="text-sm text-muted-foreground">No evidence available.</p>}</CardContent></Card>)}
            </div>
            <CommentTable comments={comments} total={commentTotal} onSearch={setSearch} onSentiment={setSentiment} onTopic={setTopic} onLanguage={setLanguage} onIntent={setIntent} onEmotion={setEmotion} onPersona={setPersona} onSpam={setSpam} onToxicity={setToxicity} onSort={setSort} onMinQuality={setMinQuality} search={search} sentiment={sentiment} topic={topic} language={language} intent={intent} emotion={emotion} persona={persona} spam={spam} toxicity={toxicity} sort={sort} minQuality={minQuality} topics={filterOptions.topics} languages={filterOptions.languages} intents={filterOptions.intents} emotions={filterOptions.emotions} personas={filterOptions.personas} loading={commentLoading} />
          </>}

          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="size-4 text-primary" /> Analysis history</CardTitle><CardDescription>Select a run to load its complete saved report.</CardDescription></CardHeader><CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">{history.length ? history.slice(0, 12).map((run) => <div key={run.id} className="flex h-auto items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"><button type="button" disabled={historyLoadingId === run.id} aria-busy={historyLoadingId === run.id} onClick={() => handleHistorySelect(run)} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{historyLoadingId === run.id ? <LoaderCircle className="size-4 animate-spin" /> : <Video className="size-4" />}</div><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{run.video?.title || run.video_id}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDate(run.created_at)} · {formatNumber(run.analyzed_count)} analyzed</span></span><Badge variant={run.status === "COMPLETED" ? "success" : run.status === "FAILED" ? "destructive" : "warning"}>{statusLabel(run.status)}</Badge></button><button type="button" aria-label={`Delete ${run.video?.title || `analysis run ${run.id}`} `} title="Delete analysis" onClick={() => handleHistoryDelete(run)} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Trash2 className="size-4" /></button></div>) : <p className="text-sm text-muted-foreground">No analysis runs yet. Your completed runs will appear here.</p>}</CardContent></Card>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Filter className="size-3.5" /> Metrics are calculated from stored API data; AI enrichment only edits narratives and is marked in the report.</p>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return error instanceof Error ? error.message : fallback;
}
