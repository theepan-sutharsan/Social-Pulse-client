'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ExportButton } from "@/components/export-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSuggestionDetailApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";

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
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6" aria-label="Loading suggestion details">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Link href="/suggestions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Suggestions
          </Link>
          <ExportButton
            csvUrl="/api/suggestions/export"
            pdfUrl={`/api/suggestions/${suggestion.id}/pdf`}
            baseFilename={`suggestion-${suggestion.id}`}
          />
        </div>

        <PageHeader
          eyebrow="Generated Strategy"
          title="AI Generated Strategy"
          description={suggestion.input_context}
          icon={<Sparkles className="h-5 w-5" />}
          actions={<Badge className="uppercase tracking-wider">{suggestion.type}</Badge>}
        />

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" /> Generated Content Output
              </CardTitle>
              <CardDescription className="text-xs">Structured AI response for this strategy.</CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">{suggestion.created_at?.substring(0, 10)}</span>
          </CardHeader>
          <CardContent className="pt-6">
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-muted p-6 text-xs leading-6 text-foreground">
              {JSON.stringify(suggestion.output, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-border">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Layers className="h-4 w-4" /> Pattern Source Videos
              </CardTitle>
              <CardDescription className="text-xs">Videos used to identify the patterns behind this strategy.</CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0">suggestion_sources</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            {suggestion.source_videos && suggestion.source_videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestion.source_videos.map((sourceVideo) => {
                  const defaultThumb = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80";
                  const thumbUrl = sourceVideo.thumbnail_url || defaultThumb;
                  return (
                    <Card key={sourceVideo.id} className="overflow-hidden bg-muted/50 shadow-none">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={thumbUrl}
                            alt={sourceVideo.title}
                            onError={(e) => { (e.target as HTMLImageElement).src = defaultThumb; }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-xs font-semibold text-foreground">{sourceVideo.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Badge variant="outline" className="px-1.5 py-0 text-[9px] uppercase">{sourceVideo.platform}</Badge>
                            <span className="truncate">ID: {sourceVideo.external_id}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <Video className="mb-3 h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No source videos are linked to this suggestion.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}
