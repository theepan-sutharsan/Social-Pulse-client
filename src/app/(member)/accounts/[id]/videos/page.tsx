'use client';

import { useEffect, useState, use } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getVideosApi } from "@/services/videos";
import { Video } from "@/types/video";
import { ExportButton } from "@/components/export-button";
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

        <h1 className="text-3xl font-black text-white">Fetched Video Performance Snapshots</h1>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading videos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <div key={v.id} className="p-5 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">{v.platform}</span>
                  <h3 className="text-sm font-bold text-white mt-1 mb-2 line-clamp-2">{v.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{v.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-400" /> {v.views || 0}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-indigo-400" /> {v.likes || 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> {v.comments || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
