'use client';

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSuggestionsApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestionsApi()
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 sm:p-0">
      <PageHeader
        eyebrow="AI activity"
        title="All Generated AI Suggestions"
        description="Inspect the prompts and content requests generated across the platform."
        icon={<Sparkles className="h-5 w-5" />}
        actions={<ExportButton csvUrl="/api/suggestions/export" baseFilename="all-suggestions" />}
      />

      <Card className="overflow-hidden">
        <Table className="min-w-[720px] text-xs">
          <TableHeader>
            <TableRow className="hover:bg-slate-900/60">
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Input Context</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4} className="py-4">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && suggestions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-slate-400">
                  No AI suggestions found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="whitespace-nowrap font-mono text-slate-400">{suggestion.user_id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className="border-transparent bg-transparent p-0 uppercase text-indigo-400">
                      {suggestion.type.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate whitespace-nowrap text-slate-300 sm:max-w-md">
                    {suggestion.input_context}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-400">
                    {suggestion.created_at?.substring(0, 10)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
