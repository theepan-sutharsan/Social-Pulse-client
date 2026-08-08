'use client';

import { useState } from "react";
import { isAxiosError } from "axios";
import { AlertTriangle, CheckCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importTrackedChannelsCsvApi } from "@/services/tracked-channels";

interface ImportResult {
  created: number;
  skipped: number;
  errors?: Array<{ row: number; message: string }>;
}

export function ImportDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      const res = await importTrackedChannelsCsvApi(file);
      setResult(res);
      toast.success(`Imported ${res.created} channels!`);
      onSuccess();
    } catch (error: unknown) {
      const message = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="border border-slate-700 text-emerald-400"
      >
        <Upload className="h-3.5 w-3.5" />
        Import CSV
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-dialog-title"
            className="relative w-full max-w-md overflow-hidden shadow-2xl"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 h-8 w-8 rounded-lg"
              aria-label="Close import dialog"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="border-b border-slate-800 pr-14">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-indigo-400">
                <Upload className="h-4 w-4" />
              </div>
              <CardTitle id="import-dialog-title">Import Tracked Channels</CardTitle>
              <CardDescription className="text-xs leading-5">
                Upload a CSV containing <code className="text-indigo-400">channel_id, channel_name, niche</code> columns.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="channel-csv">CSV file</Label>
                  <Input
                    id="channel-csv"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="h-auto cursor-pointer py-2 text-xs text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                  />
                  <p className="text-xs text-slate-400">Only .csv files are accepted.</p>
                </div>

                {result && (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>Created: {result.created} · Skipped: {result.skipped}</span>
                    </div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="space-y-1 text-rose-400">
                        <div className="flex items-center gap-2 font-semibold">
                          <AlertTriangle className="h-4 w-4" />
                          Import issues
                        </div>
                        {result.errors.map((error, index) => (
                          <p key={`${error.row}-${index}`} className="pl-6">
                            Row {error.row}: {error.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                  <Button type="submit" size="sm" disabled={!file || loading}>
                    <Upload className="h-3.5 w-3.5" />
                    {loading ? "Importing..." : "Upload & Process"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
