'use client';

import React, { useState } from "react";
import { Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import { importTrackedChannelsCsvApi } from "@/services/tracked-channels";
import { toast } from "sonner";

export function ImportDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      const res = await importTrackedChannelsCsvApi(file);
      setResult(res);
      toast.success(`Imported ${res.created} channels!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
      >
        <Upload className="w-3.5 h-3.5" />
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#0e172a] border border-slate-800 rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Import Tracked Channels</h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload a CSV with columns: <code className="text-indigo-400">channel_id, channel_name, niche</code>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />

              {result && (
                <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle className="w-4 h-4" /> Created: {result.created} | Skipped: {result.skipped}
                  </div>
                  {result.errors?.length > 0 && (
                    <div className="text-rose-400 mt-1">
                      {result.errors.map((e: any, idx: number) => (
                        <div key={idx}>Row {e.row}: {e.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Importing..." : "Upload & Process"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
