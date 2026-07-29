'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getVideoAnalyticsApi,
  getVideoSeoApi,
  getVideoPredictionApi,
  getVideoViralScoreApi,
} from "@/services/multiplatform-analytics";
import { Video, Zap, Search, Eye, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export function VideoAnalyticsView() {
  const params = useParams();
  const videoId = Number(params?.id);

  const [analytics, setAnalytics] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [viral, setViral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      const [aRes, sRes, pRes, vRes] = await Promise.all([
        getVideoAnalyticsApi(videoId),
        getVideoSeoApi(videoId),
        getVideoPredictionApi(videoId),
        getVideoViralScoreApi(videoId),
      ]);
      setAnalytics(aRes);
      setSeo(sRes?.seo || null);
      setPrediction(pRes?.prediction || null);
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
      <div className="p-12 text-center text-indigo-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Analyzing Video SEO & Viral Velocity...</p>
      </div>
    );
  }

  const v = analytics?.video || {};
  const m = analytics?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Video Header Card */}
      <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl">
        {v.thumbnail_url && (
          <img src={v.thumbnail_url} alt={v.title} className="w-48 h-28 object-cover rounded-xl border border-slate-800" />
        )}
        <div className="space-y-2 flex-1">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {v.platform || "YouTube"} Video Analytics
          </span>
          <h1 className="text-2xl font-extrabold text-white">{v.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>Published: {v.published_at?.substring(0, 10) || "N/A"}</span>
            <span>Category: {v.category || "General"}</span>
            <span>Live Status: {v.live_status || "none"}</span>
          </div>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <Eye className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Views</p>
            <h4 className="text-lg font-bold text-white">{Number(m.views || 0).toLocaleString()}</h4>
          </div>
        </div>
        <div className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <ThumbsUp className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Likes</p>
            <h4 className="text-lg font-bold text-white">{Number(m.likes || 0).toLocaleString()}</h4>
          </div>
        </div>
        <div className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-400">Comments</p>
            <h4 className="text-lg font-bold text-white">{Number(m.comments || 0).toLocaleString()}</h4>
          </div>
        </div>
        <div className="p-4 bg-[#0e172a] border border-slate-800 rounded-xl flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-xs text-slate-400">Viral Velocity</p>
            <h4 className="text-lg font-bold text-amber-400">{viral?.viral_score || 0}/100</h4>
          </div>
        </div>
      </div>

      {/* SEO Score & Recommendations Section */}
      {seo && (
        <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Video SEO Score & Optimization Checklist
            </h3>
            <span className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-black">
              SEO Score: {seo.seo_score}/100
            </span>
          </div>

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
        </div>
      )}
    </div>
  );
}
