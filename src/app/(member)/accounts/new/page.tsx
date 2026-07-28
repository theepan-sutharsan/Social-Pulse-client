'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { connectYoutubeApi, getOAuthUrlApi } from "@/services/accounts";
import { Radio, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewAccountPage() {
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'facebook' | 'tiktok'>('youtube');
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await connectYoutubeApi(channelId);
      toast.success("YouTube channel connected!");
      router.push("/accounts");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = async (p: 'instagram' | 'facebook' | 'tiktok') => {
    try {
      const url = await getOAuthUrlApi(p);
      window.location.href = url;
    } catch (e) {
      toast.error("Failed to get OAuth authorization URL.");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <Link href="/accounts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>

        <div className="p-8 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white">Connect Platform Account</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your platform to sync post metric snapshots and enable AI generation
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {(['youtube', 'instagram', 'facebook', 'tiktok'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`py-3 text-xs font-bold uppercase rounded-xl border transition ${
                  platform === p
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {platform === 'youtube' ? (
            <form onSubmit={handleYoutubeSubmit} className="space-y-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  YouTube Public Channel ID
                </label>
                <input
                  type="text"
                  required
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UCVHFbw7woebKtX37QMs4Cng"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">No OAuth required for public YouTube channels</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                {loading ? "Connecting..." : "Connect YouTube Channel"}
              </button>
            </form>
          ) : (
            <div className="pt-4 border-t border-slate-800 text-center space-y-4">
              <p className="text-xs text-slate-300">
                Connect your official <strong className="capitalize">{platform}</strong> account via OAuth 2.0.
              </p>
              <button
                onClick={() => handleOAuthConnect(platform)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Authenticate with {platform.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
