'use client';

import { useEffect, useState } from "react";
import {
  getTrackedChannelsApi,
  createTrackedChannelApi,
  deleteTrackedChannelApi,
  syncTrackedChannelApi,
} from "@/services/tracked-channels";
import { TrackedChannel } from "@/types/tracked-channel";
import Link from "next/link";
import { Radio, Plus, RefreshCw, Trash2, ArrowRight, Search, Video, ShieldCheck } from "lucide-react";

export function ChannelListView() {
  const [channels, setChannels] = useState<TrackedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [nicheVal, setNicheVal] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const res = await getTrackedChannelsApi();
      setChannels(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    try {
      setAdding(true);
      setError(null);
      await createTrackedChannelApi({ channel_id: inputVal.trim(), channel_name: "", niche: nicheVal.trim() });
      setInputVal("");
      setNicheVal("");
      setShowAddModal(false);
      loadChannels();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.errors?.[0] || "Failed to add channel.");
    } finally {
      setAdding(false);
    }
  };

  const handleSync = async (id: number) => {
    try {
      await syncTrackedChannelApi(id);
      loadChannels();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this channel tracking?")) return;
    try {
      await deleteTrackedChannelApi(id);
      loadChannels();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Video className="w-8 h-8 text-red-500" /> YouTube Tracked Public Channels
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track competitor stats, historical subscriber growth, CPM earnings, and predictions.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add Channel to Track
        </button>
      </div>

      {/* Grid of Tracked Channels */}
      {loading ? (
        <div className="p-12 text-center text-indigo-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      ) : channels.length === 0 ? (
        <div className="p-12 bg-[#0e172a] border border-slate-800 rounded-2xl text-center space-y-4">
          <Radio className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tracked Channels Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add a YouTube channel by handle (e.g. `@TechGuruPro`), channel ID, or URL to start SocialBlade-style tracking.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
          >
            + Add First Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((ch: any) => (
            <div
              key={ch.id}
              className="p-6 bg-[#0e172a] border border-slate-800 hover:border-indigo-500/50 rounded-2xl space-y-5 shadow-xl transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {ch.profile_image ? (
                      <img src={ch.profile_image} alt={ch.channel_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                        {ch.channel_name?.substring(0, 2) || "YT"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{ch.channel_name}</h3>
                      <p className="text-[11px] font-mono text-indigo-400">{ch.channel_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Subscribers</span>
                    <span className="font-bold text-white">{Number(ch.subscriber_count || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Views</span>
                    <span className="font-bold text-white">{Number(ch.total_views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleSync(ch.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Latest
                </button>

                <Link
                  href={`/channels/${ch.channel_id}`}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"
                >
                  SocialBlade Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Tracked Channel */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add YouTube Channel to Track</h3>
            <p className="text-xs text-slate-400">Enter channel handle (e.g. `@MrBeast`), URL, or YouTube channel ID.</p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleAddChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Channel Handle / ID / URL</label>
                <input
                  type="text"
                  placeholder="@TechGuruPro"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Niche (Optional)</label>
                <input
                  type="text"
                  placeholder="Tech & Gadgets"
                  value={nicheVal}
                  onChange={(e) => setNicheVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  {adding ? "Enriching & Adding..." : "Add & Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
