'use client';

import { useEffect, useState } from "react";
import { getSuggestionsApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";
import { ExportButton } from "@/components/export-button";

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => { getSuggestionsApi().then(setSuggestions); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">All Generated AI Suggestions</h1>
          <p className="text-xs text-slate-400">System-wide AI suggestions</p>
        </div>
        <ExportButton csvUrl="/api/suggestions/export" baseFilename="all-suggestions" />
      </div>

      <div className="bg-[#0e172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">User ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Input Context</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {suggestions.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-mono text-slate-400">{s.user_id}</td>
                <td className="p-4 uppercase font-bold text-indigo-400">{s.type}</td>
                <td className="p-4 text-slate-300 max-w-md truncate">{s.input_context}</td>
                <td className="p-4 text-slate-400">{s.created_at?.substring(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
