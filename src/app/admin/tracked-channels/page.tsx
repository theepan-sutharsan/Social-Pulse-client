'use client';

import { useEffect, useState } from "react";
import { getTrackedChannelsApi, deleteTrackedChannelApi, syncTrackedChannelApi, createTrackedChannelApi } from "@/services/tracked-channels";
import { TrackedChannel } from "@/types/tracked-channel";
import { ImportDialog } from "@/components/import-dialog";
import { ExportButton } from "@/components/export-button";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminTrackedChannelsPage() {
  const [channels, setChannels] = useState<TrackedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChannelId, setNewChannelId] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newNiche, setNewNiche] = useState("");

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await getTrackedChannelsApi();
      setChannels(data);
    } catch (e) {
      toast.error("Failed to load tracked channels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChannels(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrackedChannelApi({ channel_id: newChannelId, channel_name: newChannelName, niche: newNiche });
      toast.success("Channel added.");
      setNewChannelId(""); setNewChannelName(""); setNewNiche("");
      loadChannels();
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.[0] || "Failed to add channel.");
    }
  };

  const handleSync = async (id: number) => {
    try {
      toast.info("Syncing channel...");
      const res = await syncTrackedChannelApi(id);
      toast.success(`Synced ${res.videos_fetched} videos!`);
    } catch (e) {
      toast.error("Sync failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove channel?")) return;
    try {
      await deleteTrackedChannelApi(id);
      toast.success("Removed.");
      loadChannels();
    } catch (e) {
      toast.error("Remove failed.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">Tracked Competitor Channels</h1>
          <p className="text-xs text-slate-400">Admin curation with bulk CSV Import & Export</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportDialog onSuccess={loadChannels} />
          <ExportButton csvUrl="/api/tracked-channels/export" pdfUrl="/api/tracked-channels/export?format=pdf" baseFilename="tracked-channels" />
        </div>
      </div>

      {/* Manual Add Form */}
      <form onSubmit={handleCreate} className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Channel ID, Handle (@name), or URL</label>
          <input
            type="text"
            required
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            placeholder="e.g. @TechGuruPro or UCVHF..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Channel Name (Optional)</label>
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Auto-resolved from YouTube"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Niche Category</label>
          <input
            type="text"
            value={newNiche}
            onChange={(e) => setNewNiche(e.target.value)}
            placeholder="Technology"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Channel
        </button>
      </form>

      {/* Channels Table */}
      <div className="bg-[#0e172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Channel Name</th>
              <th className="p-4">Channel ID</th>
              <th className="p-4">Niche</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {channels.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-bold text-white">{c.channel_name}</td>
                <td className="p-4 font-mono text-indigo-300">{c.channel_id}</td>
                <td className="p-4">{c.niche || '—'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleSync(c.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-indigo-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
