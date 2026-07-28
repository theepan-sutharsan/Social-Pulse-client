'use client';

import { useEffect, useState, use } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getSuggestionDetailApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";
import { ExportButton } from "@/components/export-button";
import { Sparkles, Video, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SuggestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestionDetailApi(Number(resolvedParams.id))
      .then(setSuggestion)
      .catch(() => toast.error("Failed to load suggestion."))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading || !suggestion) {
    return <div className="p-12 text-center text-indigo-400">Loading suggestion details...</div>;
  }

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/suggestions" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Suggestions
          </Link>
          <ExportButton
            csvUrl={`/api/suggestions/export`}
            pdfUrl={`/api/suggestions/${suggestion.id}/pdf`}
            baseFilename={`suggestion-${suggestion.id}`}
          />
        </div>

        {/* Suggestion Card */}
        <div className="p-8 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <span className="px-3 py-1 text-xs font-black uppercase rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                {suggestion.type}
              </span>
              <h1 className="text-2xl font-black text-white mt-3">AI Generated Strategy</h1>
              <p className="text-xs text-slate-400 mt-1">{suggestion.input_context}</p>
            </div>
            <span className="text-xs text-slate-500">{suggestion.created_at?.substring(0, 10)}</span>
          </div>

          {/* Generated Output */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Generated Content Output
            </h3>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(suggestion.output, null, 2)}
            </div>
          </div>

          {/* SIGNATURE Many-to-Many Source Videos Section */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Pattern Source Videos (Many-to-Many Link)
              </h3>
              <span className="text-xs text-slate-400">suggestion_sources table</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestion.source_videos?.map((v) => (
                <div key={v.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-950 rounded-lg text-indigo-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">{v.title}</p>
                    <p className="text-[10px] text-slate-500">ID: {v.external_id} | Platform: {v.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
