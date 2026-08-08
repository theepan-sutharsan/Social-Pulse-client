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
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Video Header Card */}
      <Card className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl">
        {v.thumbnail_url && (
          <img src={v.thumbnail_url} alt={v.title} className="w-48 h-28 object-cover rounded-xl border border-slate-800" />
        )}
        <div className="space-y-2 flex-1">
          <Badge className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {v.platform || "YouTube"} Video Analytics
          </Badge>
          <h1 className="text-2xl font-extrabold text-white">{v.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>Published: {v.published_at?.substring(0, 10) || "N/A"}</span>
            <span>Category: {v.category || "General"}</span>
            <span>Live Status: {v.live_status || "none"}</span>
          </div>
        </div>
      </Card>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <Eye className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Views</p>
            <h4 className="text-lg font-bold text-white">{Number(m.views || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <ThumbsUp className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Likes</p>
            <h4 className="text-lg font-bold text-white">{Number(m.likes || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Comments</p>
            <h4 className="text-lg font-bold text-white">{Number(m.comments || 0).toLocaleString()}</h4>
          </div>
        </Card>
        <Card className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-xs text-slate-400">Viral Velocity</p>
            <h4 className="text-lg font-bold text-amber-400">{viral?.viral_score || 0}/100</h4>
          </div>
        </Card>
      </div>

      {/* SEO Score & Recommendations Section */}
      {seo && (
        <Card className="bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex-row justify-between items-center space-y-0 border-b border-slate-800 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Video SEO Score & Optimization Checklist
            </CardTitle>
            <Badge className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-black">
              SEO Score: {seo.seo_score}/100
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Title Length</span>
              <span className="font-bold text-white">{seo.title_length} chars</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Description Length</span>
              <span className="font-bold text-white">{seo.description_length} chars</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Tags Count</span>
              <span className="font-bold text-white">{seo.tags_count} tags</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Custom Thumbnail</span>
              <span className="font-bold text-emerald-400">{seo.has_thumbnail ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO Recommendations</h4>
            {seo.recommendations?.map((rec: string, idx: number) => (
              <div key={idx} className="p-3 bg-slate-900/90 rounded-xl flex items-center gap-3 border border-slate-800 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
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
