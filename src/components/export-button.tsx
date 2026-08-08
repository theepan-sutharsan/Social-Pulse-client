'use client';

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";

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
    } catch {
      toast.error("Failed to download export.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2" aria-label="Export options">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleExport(csvUrl, "csv")}
        disabled={downloading}
        className="border border-slate-700 text-indigo-300"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        CSV
      </Button>
      {pdfUrl && (
        <Button size="sm" onClick={() => handleExport(pdfUrl, "pdf")} disabled={downloading}>
          <FileText className="h-3.5 w-3.5" />
          PDF Report
        </Button>
      )}
    </div>
  );
}
