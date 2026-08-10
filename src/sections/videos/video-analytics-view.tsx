'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getVideoAnalyticsApi,
  getVideoSeoApi,
  getVideoPredictionApi,
  getVideoViralScoreApi,
} from "@/services/multiplatform-analytics";
import { Zap, Search, Eye, ThumbsUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoAnalyticsView() {
  const params = useParams();
  const videoId = Number(params?.id);

  const [analytics, setAnalytics] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);
  const [viral, setViral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      const [aRes, sRes, , vRes] = await Promise.all([
        getVideoAnalyticsApi(videoId),
        getVideoSeoApi(videoId),
        getVideoPredictionApi(videoId),
        getVideoViralScoreApi(videoId),
      ]);
      setAnalytics(aRes);
      setSeo(sRes?.seo || null);
      setViral(vRes?.viral_analysis || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [videoId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6" aria-busy="true" aria-label="Analyzing video">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const v = analytics?.video || {};
  const m = analytics?.metrics || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-foreground sm:p-6">
      {/* Video Header Card */}
      <Card className="flex flex-col items-start gap-6 rounded-2xl border-border bg-card p-6 shadow-sm md:flex-row md:items-center">
        {v.thumbnail_url && (
          <img src={v.thumbnail_url} alt={v.title} className="h-28 w-48 rounded-xl border border-border object-cover" />
        )}
        <div className="space-y-2 flex-1">
          <Badge variant="secondary" className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {v.platform || "YouTube"} Video Analytics
          </Badge>
          <h1 className="text-2xl font-extrabold text-foreground">{v.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Published: {v.published_at?.substring(0, 10) || "N/A"}</span>
            <span>Category: {v.category || "General"}</span>
            <span>Live Status: {v.live_status || "none"}</span>
          </div>
        </div>
      </Card>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3 rounded-xl border-border bg-card p-4">
          <Eye className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Views</p>
            <h4 className="text-lg font-bold text-foreground">{Number(m.views || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-3 rounded-xl border-border bg-card p-4">
          <ThumbsUp className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Likes</p>
            <h4 className="text-lg font-bold text-foreground">{Number(m.likes || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-3 rounded-xl border-border bg-card p-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Comments</p>
            <h4 className="text-lg font-bold text-foreground">{Number(m.comments || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-3 rounded-xl border-border bg-card p-4">
          <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs text-muted-foreground">Viral Velocity</p>
            <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400">{viral?.viral_score || 0}/100</h4>
          </div>
        </Card>
      </div>

      {/* SEO Score & Recommendations Section */}
      {seo && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Search className="h-5 w-5 text-primary" /> Video SEO Score & Optimization Checklist
            </CardTitle>
            <Badge variant="secondary" className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-black text-primary">
              SEO Score: {seo.seo_score}/100
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <span className="block text-muted-foreground">Title Length</span>
              <span className="font-bold text-foreground">{seo.title_length} chars</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <span className="block text-muted-foreground">Description Length</span>
              <span className="font-bold text-foreground">{seo.description_length} chars</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <span className="block text-muted-foreground">Tags Count</span>
              <span className="font-bold text-foreground">{seo.tags_count} tags</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <span className="block text-muted-foreground">Custom Thumbnail</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{seo.has_thumbnail ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">SEO Recommendations</h4>
            {seo.recommendations?.map((rec: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
