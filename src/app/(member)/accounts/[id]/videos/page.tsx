'use client';

import { useEffect, useState, use } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getVideosApi } from "@/services/videos";
import { Video } from "@/types/video";
import { ExportButton } from "@/components/export-button";
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Share2, Clock, LayoutGrid, List, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AccountVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    getVideosApi({ account_id: Number(resolvedParams.id) })
      .then(setVideos)
      .catch(() => toast.error("Failed to load account videos."))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/accounts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Accounts
          </Link>
          <ExportButton csvUrl="/api/videos/export" pdfUrl="/api/videos/export?format=pdf" baseFilename="account-videos" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Fetched Video Performance Snapshots</h1>
            <p className="text-xs text-slate-400 mt-1">Live metrics, duration, tags, and snapshot performance data for synced videos</p>
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'card'
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center bg-[#0e172a] border border-slate-800 rounded-2xl text-slate-400">
            No videos synced yet for this account.
          </div>
        ) : viewMode === 'card' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => {
              const defaultThumb = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80";
              const thumbUrl = v.thumbnail_url || defaultThumb;
              return (
                <div key={v.id} className="bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition duration-200">
                  <div>
                    {/* Thumbnail Header */}
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={thumbUrl}
                        alt={v.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultThumb;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                      
                      {/* Platform Overlay */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-900/90 text-indigo-400 border border-slate-700/50 backdrop-blur-sm">
                        {v.platform}
                      </span>

                      {/* Duration Overlay */}
                      {v.duration_seconds ? (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold text-white bg-black/80 rounded backdrop-blur-sm flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {formatDuration(v.duration_seconds)}
                        </span>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition">
                        {v.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {v.description || "No description provided."}
                      </p>

                      {v.tags && v.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {v.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics Footer */}
                  <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      {v.views?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      {v.likes?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      {v.comments?.toLocaleString() || 0}
                    </span>
                    {v.shares !== undefined && (
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        {v.shares.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-800/80">
            <div className="p-4 bg-slate-900/60 hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Video Details</div>
              <div className="col-span-2 text-center">Duration / Published</div>
              <div className="col-span-1 text-right">Views</div>
              <div className="col-span-1 text-right">Likes</div>
              <div className="col-span-1 text-right">Comments</div>
              <div className="col-span-2 text-right">Shares / Platform</div>
            </div>
            {videos.map((v) => {
              const defaultThumb = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80";
              const thumbUrl = v.thumbnail_url || defaultThumb;
              return (
                <div key={v.id} className="p-4 hover:bg-slate-900/40 transition flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center">
                  <div className="sm:col-span-5 flex items-center gap-3 w-full overflow-hidden">
                    <div className="relative w-24 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={thumbUrl}
                        alt={v.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultThumb; }}
                        className="w-full h-full object-cover"
                      />
                      {v.duration_seconds ? (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-bold text-white bg-black/80 rounded">
                          {formatDuration(v.duration_seconds)}
                        </span>
                      ) : null}
                    </div>
                    <div className="overflow-hidden space-y-0.5">
                      <span className="text-[10px] font-black uppercase text-indigo-400">{v.platform}</span>
                      <h4 className="text-xs font-bold text-white truncate hover:text-indigo-300 transition">{v.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{v.description || "No description."}</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 text-center text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">{formatDuration(v.duration_seconds) || "—"}</p>
                    <p className="text-[10px] text-slate-500">{v.published_at ? v.published_at.substring(0, 10) : "—"}</p>
                  </div>

                  <div className="sm:col-span-1 text-right text-xs font-bold text-white">
                    {v.views?.toLocaleString() || 0}
                  </div>

                  <div className="sm:col-span-1 text-right text-xs font-semibold text-emerald-400">
                    {v.likes?.toLocaleString() || 0}
                  </div>

                  <div className="sm:col-span-1 text-right text-xs font-semibold text-sky-400">
                    {v.comments?.toLocaleString() || 0}
                  </div>

                  <div className="sm:col-span-2 text-right text-xs text-slate-400">
                    <span className="font-semibold text-amber-400">{v.shares?.toLocaleString() || 0} shares</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
