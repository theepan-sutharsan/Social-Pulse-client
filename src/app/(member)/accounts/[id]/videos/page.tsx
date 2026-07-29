'use client';

import { useEffect, useState, use } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getVideosApi } from "@/services/videos";
import { Video } from "@/types/video";
import { ExportButton } from "@/components/export-button";
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Share2, Clock, Video as VideoIcon } from "lucide-react";
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

        <div>
          <h1 className="text-3xl font-black text-white">Fetched Video Performance Snapshots</h1>
          <p className="text-xs text-slate-400 mt-1">Live metrics, duration, tags, and snapshot performance data for synced videos</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center bg-[#0e172a] border border-slate-800 rounded-2xl text-slate-400">
            No videos synced yet for this account.
          </div>
        ) : (
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
        )}
      </div>
    </AuthenticatedRoute>
  );
}
