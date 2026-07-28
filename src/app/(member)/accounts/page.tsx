'use client';
import { useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getAccountsApi, syncAccountApi, deleteAccountApi } from "@/services/accounts";
import { ConnectedAccount } from "@/types/account";
import Link from "next/link";
import { RefreshCw, Trash2, Video, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccountsApi();
      setAccounts(data);
    } catch (err) {
      toast.error("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleSync = async (id: number) => {
    try {
      toast.info("Syncing videos from platform...");
      const res = await syncAccountApi(id);
      toast.success(`Fetched ${res.videos_fetched} videos (${res.new_videos} new)!`);
      loadAccounts();
    } catch (e) {
      toast.error("Sync failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await deleteAccountApi(id);
      toast.success("Account disconnected.");
      loadAccounts();
    } catch (e) {
      toast.error("Disconnect failed.");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white">Connected Accounts</h1>
            <p className="text-xs text-slate-400">Manage platform channels and trigger metric syncing</p>
          </div>
          <Link
            href="/accounts/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Connect New Account
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading accounts...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {acc.platform}
                    </span>
                    <button onClick={() => handleDelete(acc.id)} className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{acc.display_name}</h3>
                  <p className="text-xs text-slate-400 mb-4">ID: {acc.platform_account_id}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/accounts/${acc.id}/videos`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" /> Videos
                  </Link>
                  <button
                    onClick={() => handleSync(acc.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Sync
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
