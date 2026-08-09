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
import { Radio, Plus, RefreshCw, Trash2, ArrowRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-foreground sm:p-6">
      <PageHeader
        eyebrow="Channel intelligence"
        icon={<Video className="w-6 h-6 text-red-500" />}
        title="YouTube Tracked Public Channels"
        description="Track competitor stats, historical subscriber growth, CPM earnings, and predictions."
        actions={<Button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl px-4 py-2.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" /> Add Channel to Track
        </Button>}
      />

      {/* Grid of Tracked Channels */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading tracked channels">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : channels.length === 0 ? (
        <Card className="space-y-4 rounded-2xl border-border bg-card p-12 text-center">
          <Radio className="mx-auto h-12 w-12 text-primary" />
          <h3 className="text-lg font-bold text-foreground">No Tracked Channels Yet</h3>
          <p className="mx-auto max-w-md text-xs text-muted-foreground">
            Add a YouTube channel by handle (e.g. `@TechGuruPro`), channel ID, or URL to start SocialBlade-style tracking.
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl px-4 py-2 text-xs font-bold"
          >
            + Add First Channel
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((ch: any) => (
            <Card
              key={ch.id}
              className="flex flex-col justify-between rounded-2xl border-border bg-card shadow-sm transition hover:border-primary/50"
            >
              <CardHeader className="space-y-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {ch.profile_image ? (
                      <img src={ch.profile_image} alt={ch.channel_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary">
                        {ch.channel_name?.substring(0, 2) || "YT"}
                      </div>
                    )}
                    <div>
                      <h3 className="line-clamp-1 text-base font-bold text-foreground">{ch.channel_name}</h3>
                      <p className="font-mono text-[11px] text-primary">{ch.channel_id}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(ch.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${ch.channel_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/50 p-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Subscribers</span>
                    <span className="font-bold text-foreground">{Number(ch.subscriber_count || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Total Views</span>
                    <span className="font-bold text-foreground">{Number(ch.total_views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="flex items-center justify-between gap-3 border-t border-border p-6 pt-4">
                <Button
                  onClick={() => handleSync(ch.id)}
                  variant="secondary"
                  size="sm"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Latest
                </Button>

                <Link
                  href={`/channels/${ch.channel_id}`}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  SocialBlade Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Tracked Channel */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md rounded-2xl border-border bg-popover text-popover-foreground shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="add-channel-title">
            <CardHeader>
              <h3 id="add-channel-title" className="text-lg font-bold text-foreground">Add YouTube Channel to Track</h3>
              <p className="text-xs text-muted-foreground">Enter channel handle (e.g. `@MrBeast`), URL, or YouTube channel ID.</p>
            </CardHeader>
            <CardContent className="space-y-4">

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleAddChannel} className="space-y-4">
              <div>
                <Label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="channel-identifier">Channel Handle / ID / URL</Label>
                <Input
                  id="channel-identifier"
                  type="text"
                  placeholder="@TechGuruPro"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full rounded-xl border-input bg-background p-3 text-sm text-foreground"
                  required
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="channel-niche">Niche (Optional)</Label>
                <Input
                  id="channel-niche"
                  type="text"
                  placeholder="Tech & Gadgets"
                  value={nicheVal}
                  onChange={(e) => setNicheVal(e.target.value)}
                  className="w-full rounded-xl border-input bg-background p-3 text-sm text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  className="rounded-xl px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="rounded-xl px-4 py-2 text-xs font-bold"
                >
                  {adding ? "Enriching & Adding..." : "Add & Track"}
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
