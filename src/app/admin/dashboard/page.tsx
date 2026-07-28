'use client';

import { useEffect, useState } from "react";
import { getAccountsApi } from "@/services/accounts";
import { getTrackedChannelsApi } from "@/services/tracked-channels";
import { getSuggestionsApi } from "@/services/suggestions";
import { ExportButton } from "@/components/export-button";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ accounts: 0, channels: 0, suggestions: 0 });

  useEffect(() => {
    Promise.all([getAccountsApi(), getTrackedChannelsApi(), getSuggestionsApi()]).then(([a, c, s]) => {
      setCounts({ accounts: a.length, channels: c.length, suggestions: s.length });
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">Platform Administration</h1>
          <p className="text-xs text-slate-400">System-wide content & channel curation</p>
        </div>
        <ExportButton csvUrl="/api/tracked-channels/export" pdfUrl="/api/tracked-channels/export?format=pdf" baseFilename="admin-tracked-channels" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Total Connected Accounts</p>
          <h3 className="text-3xl font-black text-white mt-1">{counts.accounts}</h3>
        </div>
        <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Tracked Channels (Admin)</p>
          <h3 className="text-3xl font-black text-white mt-1">{counts.channels}</h3>
        </div>
        <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Total Generated Suggestions</p>
          <h3 className="text-3xl font-black text-white mt-1">{counts.suggestions}</h3>
        </div>
      </div>
    </div>
  );
}
