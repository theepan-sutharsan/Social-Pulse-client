'use client';

import { useEffect, useState, use } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getVideosApi } from "@/services/videos";
import { Video } from "@/types/video";
import { ExportButton } from "@/components/export-button";
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Share2, Clock, LayoutGrid, List, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Link href="/accounts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Accounts
          </Link>
          <ExportButton csvUrl="/api/videos/export" pdfUrl="/api/videos/export?format=pdf" baseFilename="account-videos" />
        </div>

        <PageHeader
          eyebrow="Performance Library"
          title="Fetched Video Performance Snapshots"
          description="Live metrics, duration, tags, and snapshot performance data for synced videos."
          icon={<VideoIcon className="h-5 w-5" />}
          actions={(
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
            <Button
              onClick={() => setViewMode('card')}
              variant="ghost"
              size="sm"
              className={`h-8 ${
                viewMode === 'card'
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Card View"
              aria-pressed={viewMode === 'card'}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="sm"
              className={`h-8 ${
                viewMode === 'list'
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="List View"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
            </div>
          )}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading videos">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <CardContent className="space-y-3 pt-5">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center text-slate-400">
              <VideoIcon className="mb-4 h-8 w-8 text-indigo-400" />
              <p className="text-sm font-semibold text-white">No videos synced yet</p>
              <p className="mt-1 text-xs">Sync this account to populate its performance library.</p>
            </CardContent>
          </Card>
        ) : viewMode === 'card' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => {
              const defaultThumb = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80";
              const thumbUrl = v.thumbnail_url || defaultThumb;
              return (
                <Card key={v.id} className="group flex flex-col justify-between overflow-hidden transition duration-200 hover:border-indigo-500/50">
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
                      <Badge variant="outline" className="absolute left-2.5 top-2.5 rounded-md border-slate-700/50 bg-slate-900/90 text-[10px] font-black uppercase tracking-wider text-indigo-400 backdrop-blur-sm">
                        {v.platform}
                      </Badge>

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
                            <Badge key={idx} variant="outline" className="rounded-md border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                              #{tag}
                            </Badge>
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
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <Card className="overflow-hidden divide-y divide-slate-800/80">
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
          </Card>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
