'use client';

import { useState, useEffect } from 'react';
import { AuthenticatedRoute } from "@/components/auth-guard";
import { 
  analyzeVideoApi, 
  getVideoAnalysisHistoryApi,
  getVideoTranscriptApi,
  VideoTranscript,
} from "@/services/video-analysis";
import { VideoAnalysis } from "@/types/video-analysis";
import { VideoAnalysisDashboard } from "@/components/video-analysis/video-analysis-dashboard";
import { toast } from "sonner";
import { 
  Video, 
  Sparkles, 
  Loader2, 
  History, 
  ArrowRight, 
  AlertCircle,
  FileAudio,
  Brain,
  Captions,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function VideoAnalysisPage() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState<'idle' | 'downloading' | 'transcribing' | 'analyzing'>('idle');
  const [currentAnalysis, setCurrentAnalysis] = useState<VideoAnalysis | null>(null);
  const [history, setHistory] = useState<VideoAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'analysis' | 'transcript'>('analysis');
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<VideoTranscript | null>(null);
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getVideoAnalysisHistoryApi();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setCurrentAnalysis(null);
    setTranscriptResult(null);

    // Simulate pipeline progress steps for clear UI feedback
    setStep('downloading');
    
    const progressTimer1 = setTimeout(() => {
      setStep('transcribing');
    }, 4000);

    const progressTimer2 = setTimeout(() => {
      setStep('analyzing');
    }, 9000);

    try {
      const result = await analyzeVideoApi(url.trim());
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      
      setCurrentAnalysis(result);
      toast.success("Video analysis completed successfully!");
      setUrl('');
      loadHistory();
    } catch (err: any) {
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      const detail = err.response?.data?.error || "Failed to analyze video. Please check URL and try again.";
      setErrorMsg(detail);
      toast.error(detail);
    } finally {
      setAnalyzing(false);
      setStep('idle');
    }
  };

  const handleTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }

    setTranscriptLoading(true);
    setErrorMsg('');
    setTranscriptResult(null);
    setCurrentAnalysis(null);
    setCopied(false);

    try {
      const result = await getVideoTranscriptApi(url.trim());
      setTranscriptResult(result);
      toast.success("Video transcript fetched successfully!");
      setUrl('');
    } catch (err: any) {
      const detail = err.response?.data?.error || "Failed to fetch transcript. Please check the URL and try again.";
      setErrorMsg(detail);
      toast.error(detail);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (activeTab === 'transcript') {
      return handleTranscript(e);
    }
    return handleAnalyze(e);
  };

  const handleCopyTranscript = async () => {
    if (!transcriptResult?.transcript) return;
    try {
      await navigator.clipboard.writeText(transcriptResult.transcript);
      setCopied(true);
      toast.success("Transcript copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy transcript.");
    }
  };

  return (
    <AuthenticatedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <PageHeader
          eyebrow="AI Powered Video Intelligence"
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          title="YouTube Video Analyzer"
          description="Analyze a video with AI or fetch its YouTube captions as a clean transcript."
        />

        {/* Form Card */}
        <Card className="relative overflow-hidden rounded-2xl border-border bg-card p-6 shadow-sm">
          <div role="tablist" aria-label="Video tools" className="mb-6 grid grid-cols-1 gap-2 rounded-xl bg-muted/50 p-1 sm:grid-cols-2">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'analysis'}
              onClick={() => {
                setActiveTab('analysis');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Video Analysis
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'transcript'}
              onClick={() => {
                setActiveTab('transcript');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'transcript'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Captions className="h-4 w-4" />
              Video Transcript
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="youtube-video-url" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                YouTube Video URL
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Video className="w-5 h-5 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="youtube-video-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={analyzing || transcriptLoading}
                  className="w-full rounded-xl border-input bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={analyzing || transcriptLoading || !url.trim()}
                className="shrink-0 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                {analyzing || transcriptLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {activeTab === 'transcript' ? 'Fetching Transcript...' : 'Analyzing Video...'}
                  </>
                ) : (
                  <>
                    {activeTab === 'transcript' ? (
                      <><Captions className="w-4 h-4" /> Get Transcript</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Start AI Analysis</>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Pipeline Loading State Indicator */}
          {analyzing && (
            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span>AI Processing Pipeline</span>
                <span className="animate-pulse font-medium text-primary">Automated analysis</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Step 1: Transcript / Download */}
                <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  step === 'downloading'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : step !== 'idle' ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground'
                }`}>
                  {step === 'downloading' ? (
                    <Captions className="h-4 w-4 shrink-0 animate-bounce text-primary" />
                  ) : step !== 'idle' ? (
                    <Captions className="w-4 h-4 shrink-0" />
                  ) : (
                    <Captions className="w-4 h-4 shrink-0" />
                  )}
                  <div className="text-xs font-medium">
                    1. Fetching Transcript
                    <p className="text-[10px] opacity-60 font-normal mt-0.5">Captions → Whisper fallback</p>
                  </div>
                </div>

                {/* Step 2: Transcribing */}
                <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  step === 'transcribing'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : step === 'analyzing' ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground'
                }`}>
                  <FileAudio className={`w-4 h-4 shrink-0 ${
                    step === 'transcribing' ? 'animate-pulse text-primary' : ''
                  }`} />
                  <div className="text-xs font-medium">
                    2. Processing Text
                    <p className="text-[10px] opacity-60 font-normal mt-0.5">Cleaning & chunking</p>
                  </div>
                </div>

                {/* Step 3: AI Analysis — dynamic label */}
                <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  step === 'analyzing'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }`}>
                  <Brain className={`w-4 h-4 shrink-0 ${
                    step === 'analyzing' ? 'animate-spin text-primary' : ''
                  }`} />
                  <div className="text-xs font-medium">
                    3. AI Analysis
                    <p className="text-[10px] opacity-60 font-normal mt-0.5">
                      Content and visual insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transcriptLoading && activeTab === 'transcript' && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Fetching captions with YouTube Transcript API...
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <span>{errorMsg}</span>
            </div>
          )}
        </Card>

        {transcriptResult && activeTab === 'transcript' && (
          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Captions className="h-5 w-5 text-primary" /> Video Transcript
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Captions fetched directly from YouTube Transcript API
                  {transcriptResult.language ? ` • ${transcriptResult.language}` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyTranscript}
                className="rounded-lg text-xs"
              >
                {copied ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Transcript'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">Video ID: {transcriptResult.video_id}</Badge>
                <Badge variant="secondary" className="rounded-full">Source: youtube-transcript-api</Badge>
              </div>
              <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-border bg-muted/20 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {transcriptResult.transcript}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Active Analysis Results */}
        {currentAnalysis && (
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" /> Active Analysis Result
            </h2>
            <VideoAnalysisDashboard analysis={currentAnalysis} />
          </div>
        )}

        {/* History List Section */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <History className="h-5 w-5 text-primary" /> Past Video Analyses
            </CardTitle>
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-semibold">
              {history.length} Saved
            </Badge>
          </CardHeader>

          <CardContent>
          {loadingHistory ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading analysis history">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No video analyses saved yet. Submit a YouTube link above to start!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentAnalysis(item);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    currentAnalysis?.id === item.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                      {item.video_title || "YouTube Video"}
                    </h3>
                    <span className="shrink-0 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-extrabold text-primary">
                      {item.overall_score?.toFixed(1) || "8.0"}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.analysis_json?.summary || "Completed video audit."}
                  </p>

                  <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}
