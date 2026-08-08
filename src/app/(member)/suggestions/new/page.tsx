'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { generateSuggestionApi } from "@/services/suggestions";
import { getAccountsApi } from "@/services/accounts";
import { getTrackedChannelsApi } from "@/services/tracked-channels";
import { ConnectedAccount } from "@/types/account";
import { TrackedChannel } from "@/types/tracked-channel";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSuggestionPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [channels, setChannels] = useState<TrackedChannel[]>([]);
  const [targetType, setTargetType] = useState<'own' | 'tracked'>('own');
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>();
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>();
  const [type, setType] = useState<string>('title');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAccountsApi().then((accs) => {
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
    });
    getTrackedChannelsApi().then((chs) => {
      setChannels(chs);
      if (chs.length > 0) setSelectedChannelId(chs[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await generateSuggestionApi({
        type,
        connected_account_id: targetType === 'own' ? selectedAccountId : undefined,
        tracked_channel_id: targetType === 'tracked' ? selectedChannelId : undefined,
      });
      toast.success("AI suggestion generated!");
      router.push(`/suggestions/${res.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <Link href="/suggestions" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Suggestions
        </Link>

        <div className="p-8 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" /> Generate AI Suggestion
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a target account and suggestion type to analyze video patterns and create optimized content ideas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Data Source</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setTargetType('own')}
                  className={`py-2.5 text-xs font-bold rounded-xl border ${
                    targetType === 'own' ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  My Connected Account
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('tracked')}
                  className={`py-2.5 text-xs font-bold rounded-xl border ${
                    targetType === 'tracked' ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Competitor Tracked Channel
                </button>
              </div>

              {targetType === 'own' ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.display_name} ({a.platform})</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>{c.channel_name} ({c.niche || 'General'})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Suggestion Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Suggestion Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold"
              >
                <option value="title">Viral Video Titles</option>
                <option value="caption">Social Captions (Short / Medium / Long)</option>
                <option value="hook">Video Hooks (First 10s)</option>
                <option value="hashtag">Hashtag Sets & Categories</option>
                <option value="thumbnail_concept">Thumbnail Visual Concepts</option>
                <option value="posting_time">Optimal Posting Times</option>
                <option value="content_calendar">4-Week Content Calendar</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? "Analyzing Video Patterns..." : "Generate AI Strategy"}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
