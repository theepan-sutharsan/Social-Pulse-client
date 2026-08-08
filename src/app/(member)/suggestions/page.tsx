'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ExportButton } from "@/components/export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteSuggestionApi, getSuggestionsApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";

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
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Content Intelligence"
          title="AI Content Suggestions"
          description="Generated titles, hooks, captions, and calendar strategies."
          icon={<Sparkles className="h-5 w-5" />}
          actions={(
            <>
              <ExportButton csvUrl="/api/suggestions/export" baseFilename="ai-suggestions" />
              <Link
                href="/suggestions/new"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" /> Generate New
              </Link>
            </>
          )}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading suggestions">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="p-6">
                <Skeleton className="mb-5 h-6 w-20" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-8 h-4 w-4/5" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-800 bg-indigo-950">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white">No suggestions generated yet</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                Generate your first AI strategy from a connected account or tracked channel.
              </p>
              <Link
                href="/suggestions/new"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" /> Generate Suggestion
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="flex flex-col justify-between overflow-hidden">
                <CardHeader>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Badge className="uppercase tracking-wider">{suggestion.type}</Badge>
                    <Button
                      onClick={() => handleDelete(suggestion.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-rose-400"
                      aria-label="Delete suggestion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="line-clamp-3 text-sm font-medium leading-6 text-slate-300">{suggestion.input_context}</p>
                </CardHeader>

                <CardFooter className="justify-between gap-3 border-t border-slate-800 bg-slate-900/30 pt-4">
                  <span className="text-xs text-slate-500">{suggestion.created_at?.substring(0, 10)}</span>
                  <Link
                    href={`/suggestions/${suggestion.id}`}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> View Strategy
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
