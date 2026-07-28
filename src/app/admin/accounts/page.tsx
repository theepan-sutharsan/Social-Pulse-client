'use client';

import { useEffect, useState } from "react";
import { getAccountsApi } from "@/services/accounts";
import { ConnectedAccount } from "@/types/account";
import { ExportButton } from "@/components/export-button";

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

  useEffect(() => { getAccountsApi().then(setAccounts); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">All Platform Accounts</h1>
          <p className="text-xs text-slate-400">System-wide connected user accounts</p>
        </div>
        <ExportButton csvUrl="/api/accounts/export" baseFilename="all-platform-accounts" />
      </div>

      <div className="bg-[#0e172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">User ID</th>
              <th className="p-4">Platform</th>
              <th className="p-4">Display Name</th>
              <th className="p-4">Last Synced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {accounts.map((a) => (
              <tr key={a.id}>
                <td className="p-4 font-mono text-slate-400">{a.user_id}</td>
                <td className="p-4 uppercase font-bold text-indigo-400">{a.platform}</td>
                <td className="p-4 font-semibold text-white">{a.display_name}</td>
                <td className="p-4 text-slate-400">{a.last_synced_at?.substring(0, 10) || 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
