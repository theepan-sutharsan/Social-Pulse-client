'use client';

import { useEffect, useState } from "react";
import { getSuggestionsApi } from "@/services/suggestions";
import { Suggestion } from "@/types/suggestion";
import { ExportButton } from "@/components/export-button";

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => { getSuggestionsApi().then(setSuggestions); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">All Generated AI Suggestions</h1>
          <p className="text-xs text-slate-400 mt-1">System-wide AI suggestions</p>
        </div>
        <ExportButton csvUrl="/api/suggestions/export" baseFilename="all-suggestions" />
      </div>

      <div className="bg-[#0e172a] border border-slate-800 rounded-2xl overflow-x-auto scrollbar-thin shadow-xl">
        <table className="w-full text-left text-xs min-w-[500px]">
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
                <td className="p-4 font-mono text-slate-400 whitespace-nowrap">{s.user_id}</td>
                <td className="p-4 uppercase font-bold text-indigo-400 whitespace-nowrap">{s.type}</td>
                <td className="p-4 text-slate-300 max-w-xs sm:max-w-md truncate whitespace-nowrap">{s.input_context}</td>
                <td className="p-4 text-slate-400 whitespace-nowrap">{s.created_at?.substring(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

