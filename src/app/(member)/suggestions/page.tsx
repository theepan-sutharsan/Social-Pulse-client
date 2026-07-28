'use client';

import { useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getSuggestionsApi, deleteSuggestionApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";
import Link from "next/link";
import { Sparkles, Trash2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export-button";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getSuggestionsApi();
      setSuggestions(data);
    } catch (e) {
      toast.error("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSuggestions(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this suggestion?")) return;
    try {
      await deleteSuggestionApi(id);
      toast.success("Suggestion removed.");
      loadSuggestions();
    } catch (e) {
      toast.error("Delete failed.");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white">AI Content Suggestions</h1>
            <p className="text-xs text-slate-400">Generated titles, hooks, captions & calendar strategies</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton csvUrl="/api/suggestions/export" baseFilename="ai-suggestions" />
            <Link
              href="/suggestions/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Generate New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading suggestions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((s) => (
              <div key={s.id} className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {s.type}
                    </span>
                    <button onClick={() => handleDelete(s.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-3 mb-4">{s.input_context}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">{s.created_at?.substring(0, 10)}</span>
                  <Link
                    href={`/suggestions/${s.id}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> View Strategy
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
