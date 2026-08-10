'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getAccountsApi } from "@/services/accounts";
import { generateSuggestionApi } from "@/services/suggestions";
import { getTrackedChannelsApi } from "@/services/tracked-channels";
import { ConnectedAccount } from "@/types/account";
import { TrackedChannel } from "@/types/tracked-channel";

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
      toast.error(err.response?.data?.error || err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <Link href="/suggestions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Suggestions
        </Link>

        <PageHeader
          eyebrow="AI Workspace"
          title="Generate AI Suggestion"
          description="Analyze video patterns from a selected source and create an optimized content strategy."
          icon={<Sparkles className="h-5 w-5" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Strategy configuration</CardTitle>
            <CardDescription>Choose the data source and the content output you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Target Data Source</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => setTargetType('own')}
                    variant="outline"
                    className={targetType === 'own'
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                    aria-pressed={targetType === 'own'}
                  >
                    My Connected Account
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setTargetType('tracked')}
                    variant="outline"
                    className={targetType === 'tracked'
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                    aria-pressed={targetType === 'tracked'}
                  >
                    Competitor Tracked Channel
                  </Button>
                </div>

                {targetType === 'own' ? (
                  <div className="space-y-2">
                    <Label htmlFor="connected-account">Connected account</Label>
                    <Select
                      id="connected-account"
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>{account.display_name} ({account.platform})</option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="tracked-channel">Tracked channel</Label>
                    <Select
                      id="tracked-channel"
                      value={selectedChannelId}
                      onChange={(e) => setSelectedChannelId(Number(e.target.value))}
                    >
                      {channels.map((channel) => (
                        <option key={channel.id} value={channel.id}>{channel.channel_name} ({channel.niche || 'General'})</option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-6">
                <Label htmlFor="suggestion-type">Suggestion Type</Label>
                <Select id="suggestion-type" value={type} onChange={(e) => setType(e.target.value)} className="font-semibold">
                  <option value="title">Viral Video Titles</option>
                  <option value="caption">Social Captions (Short / Medium / Long)</option>
                  <option value="hook">Video Hooks (First 10s)</option>
                  <option value="hashtag">Hashtag Sets & Categories</option>
                  <option value="thumbnail_concept">Thumbnail Visual Concepts</option>
                  <option value="posting_time">Optimal Posting Times</option>
                  <option value="content_calendar">4-Week Content Calendar</option>
                </Select>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full">
                <Sparkles className="h-4 w-4" />
                {loading ? "Analyzing Video Patterns..." : "Generate AI Strategy"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}
