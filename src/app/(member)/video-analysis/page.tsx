'use client';

import { useState, useEffect } from 'react';
import { AuthenticatedRoute } from "@/components/auth-guard";
import { 
  analyzeVideoApi, 
  getVideoAnalysisHistoryApi 
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

  return (
    <AuthenticatedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <PageHeader
          eyebrow="AI Powered Video Intelligence"
          icon={<Sparkles className="w-5 h-5 text-indigo-400" />}
          title="YouTube Video Analyzer"
          description="Submit any YouTube video link. Transcripts are fetched instantly via YouTube captions when available, or extracted with Whisper, then analyzed automatically."
        />

        {/* Form Card */}
        <Card className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <Label htmlFor="youtube-video-url" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                  disabled={analyzing}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={analyzing || !url.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Pipeline Loading State Indicator */}
          {analyzing && (
            <div className="mt-6 p-4 bg-slate-950/80 border border-indigo-900/50 rounded-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
                <span>AI Processing Pipeline</span>
                <span className="animate-pulse font-medium text-indigo-300">Automated analysis</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Step 1: Transcript / Download */}
                <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  step === 'downloading'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : step !== 'idle' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  {step === 'downloading' ? (
                    <Captions className="w-4 h-4 text-indigo-400 animate-bounce shrink-0" />
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
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : step === 'analyzing' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <FileAudio className={`w-4 h-4 shrink-0 ${
                    step === 'transcribing' ? 'text-indigo-400 animate-pulse' : ''
                  }`} />
                  <div className="text-xs font-medium">
                    2. Processing Text
                    <p className="text-[10px] opacity-60 font-normal mt-0.5">Cleaning & chunking</p>
                  </div>
                </div>

                {/* Step 3: AI Analysis — dynamic label */}
                <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  step === 'analyzing'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <Brain className={`w-4 h-4 shrink-0 ${
                    step === 'analyzing' ? 'text-indigo-400 animate-spin' : ''
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

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </Card>

        {/* Current Active Analysis Results */}
        {currentAnalysis && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Active Analysis Result
            </h2>
            <VideoAnalysisDashboard analysis={currentAnalysis} />
          </div>
        )}

        {/* History List Section */}
        <Card className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> Past Video Analyses
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">
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
            <div className="py-12 text-center text-slate-500 text-xs">
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
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-2">
                      {item.video_title || "YouTube Video"}
                    </h3>
                    <span className="text-xs font-extrabold px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800/50 rounded shrink-0">
                      {item.overall_score?.toFixed(1) || "8.0"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.analysis_json?.summary || "Completed video audit."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-1">
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
