'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Radio } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { connectYoutubeApi, getOAuthUrlApi, oauthCallbackApi } from "@/services/accounts";

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
      setLoading(true);
      const data = await getOAuthUrlApi(p);
      if (data.is_mock || !data.oauth_url || data.oauth_url.includes("mock") || data.oauth_url.includes("example.com")) {
        // Mock mode: connect instant demo account
        const res = await oauthCallbackApi(p, "mock_code_123");
        toast.success(res.message || `${p.toUpperCase()} account connected!`);
        router.push("/accounts");
      } else {
        window.location.href = data.oauth_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to connect account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <Link href="/accounts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Accounts
        </Link>

        <PageHeader
          eyebrow="Account Setup"
          title="Connect Platform Account"
          description="Select your platform to sync post metric snapshots and enable AI generation."
          icon={<Radio className="h-5 w-5" />}
        />

        <Card>
          <CardHeader className="pb-4">
            <Label>Choose a platform</Label>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {(['youtube', 'instagram', 'facebook', 'tiktok'] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  variant="outline"
                  className={`h-11 uppercase ${
                    platform === p
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-lg hover:bg-indigo-500"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
                  }`}
                  aria-pressed={platform === p}
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {platform === 'youtube' ? (
              <form onSubmit={handleYoutubeSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="youtube-channel">YouTube Channel ID, Handle (@handle), or URL</Label>
                  <Input
                    id="youtube-channel"
                    type="text"
                    required
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="e.g. @TechGuruPro, UCVHFbw7woebKtX37QMs4Cng, or https://youtube.com/@TechGuruPro"
                  />
                  <p className="text-[11px] leading-5 text-slate-500">
                    Accepts channel handles (@name), full YouTube channel URLs, or traditional channel IDs.
                  </p>
                </div>

                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  {loading ? "Connecting..." : "Connect YouTube Channel"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center space-y-5 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-800 bg-indigo-950 text-indigo-400">
                  <Radio className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white capitalize">Connect {platform}</p>
                  <p className="text-xs text-slate-300">
                    Authenticate your official <strong className="capitalize">{platform}</strong> account via OAuth 2.0.
                  </p>
                </div>
                <Button onClick={() => handleOAuthConnect(platform)} disabled={loading} size="lg">
                  {loading ? "Connecting..." : `Authenticate with ${platform.toUpperCase()}`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}
