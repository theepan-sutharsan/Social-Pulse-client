'use client';

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Plus, Radio, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export-button";
import { ImportDialog } from "@/components/import-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createTrackedChannelApi,
  deleteTrackedChannelApi,
  getTrackedChannelsApi,
  syncTrackedChannelApi,
} from "@/services/tracked-channels";
import { TrackedChannel } from "@/types/tracked-channel";

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
    } catch {
      toast.error("Failed to load tracked channels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getTrackedChannelsApi()
      .then((data) => {
        if (active) setChannels(data);
      })
      .catch(() => {
        if (active) toast.error("Failed to load tracked channels.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrackedChannelApi({
        channel_id: newChannelId,
        channel_name: newChannelName,
        niche: newNiche,
      });
      toast.success("Channel added.");
      setNewChannelId("");
      setNewChannelName("");
      setNewNiche("");
      loadChannels();
    } catch (error: unknown) {
      const message = isAxiosError<{ errors?: string[] }>(error) ? error.response?.data?.errors?.[0] : undefined;
      toast.error(message || "Failed to add channel.");
    }
  };

  const handleSync = async (id: number) => {
    try {
      toast.info("Syncing channel...");
      const res = await syncTrackedChannelApi(id);
      toast.success(`Synced ${res.videos_fetched} videos!`);
    } catch {
      toast.error("Sync failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove channel?")) return;
    try {
      await deleteTrackedChannelApi(id);
      toast.success("Removed.");
      loadChannels();
    } catch {
      toast.error("Remove failed.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 sm:p-0">
      <PageHeader
        eyebrow="Competitor library"
        title="Tracked Competitor Channels"
        description="Curate the channels used for platform-wide research, synchronization, and comparison."
        icon={<Radio className="h-5 w-5" />}
        actions={
          <>
            <ImportDialog onSuccess={loadChannels} />
            <ExportButton
              csvUrl="/api/tracked-channels/export"
              pdfUrl="/api/tracked-channels/export?format=pdf"
              baseFilename="tracked-channels"
            />
          </>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Add a channel</CardTitle>
          <CardDescription className="text-xs">
            Add a YouTube channel manually using its handle, URL, or channel ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="channel-id">Channel ID, handle, or URL</Label>
              <Input
                id="channel-id"
                type="text"
                required
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                placeholder="e.g. @TechGuruPro or UCVHF..."
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel name (optional)</Label>
              <Input
                id="channel-name"
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Auto-resolved from YouTube"
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-niche">Niche category</Label>
              <Input
                id="channel-niche"
                type="text"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                placeholder="Technology"
                className="h-10 text-xs"
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Add Channel
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[680px] text-xs">
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead>Channel Name</TableHead>
              <TableHead>Channel ID</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4} className="py-4">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && channels.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                  No tracked channels found. Add one above or import a CSV.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="whitespace-nowrap font-bold text-foreground">{channel.channel_name}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-primary">{channel.channel_id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {channel.niche ? (
                      <Badge variant="secondary">{channel.niche}</Badge>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-primary"
                        onClick={() => handleSync(channel.id)}
                        aria-label={`Sync ${channel.channel_name}`}
                        title="Sync channel"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-rose-700 dark:text-rose-400"
                        onClick={() => handleDelete(channel.id)}
                        aria-label={`Remove ${channel.channel_name}`}
                        title="Remove channel"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
