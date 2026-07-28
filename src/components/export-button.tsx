'use client';

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { toast } from "sonner";

interface ExportButtonProps {
  csvUrl: string;
  pdfUrl?: string;
  baseFilename: string;
}

export function ExportButton({ csvUrl, pdfUrl, baseFilename }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (url: string, ext: string) => {
    try {
      setDownloading(true);
      await downloadBlob(url, `${baseFilename}.${ext}`);
      toast.success(`Exported ${ext.toUpperCase()} successfully!`);
    } catch (err) {
      toast.error("Failed to download export.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport(csvUrl, "csv")}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        CSV
      </button>
      {pdfUrl && (
        <button
          onClick={() => handleExport(pdfUrl, "pdf")}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          PDF Report
        </button>
      )}
    </div>
  );
}
