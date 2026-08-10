'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getChannelDetailApi,
  getChannelGrowthApi,
  getChannelRevenueApi,
  getChannelPredictionsApi,
  getChannelTopVideosApi,
} from "@/services/channel-analytics";
import Link from "next/link";
import {
  DollarSign,
  Award,
  Users,
  Eye,
  Video,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function ChannelDetailView() {
  const params = useParams();
  const channelId = params?.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lowCpm, setLowCpm] = useState(2.0);
  const [highCpm, setHighCpm] = useState(8.0);

  const loadChannelData = async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      setError(null);
      const [dRes, gRes, rRes, pRes, tvRes] = await Promise.allSettled([
        getChannelDetailApi(channelId),
        getChannelGrowthApi(channelId),
        getChannelRevenueApi(channelId, lowCpm, highCpm),
        getChannelPredictionsApi(channelId),
        getChannelTopVideosApi(channelId),
      ]);
      if (dRes.status === "rejected") throw dRes.reason;
      setDetail(dRes.value);
      setGrowth(gRes.status === "fulfilled" ? gRes.value?.growth || null : null);
      setRevenue(rRes.status === "fulfilled" ? rRes.value?.revenue_estimate || null : null);
      setPredictions(pRes.status === "fulfilled" ? pRes.value || null : null);
      setTopVideos(tvRes.status === "fulfilled" ? tvRes.value?.top_videos || [] : []);
      const secondaryFailures = [gRes, rRes, pRes, tvRes].filter((result) => result.status === "rejected");
      if (secondaryFailures.length) setError("Some analytics panels could not be loaded. Try syncing the channel and retrying.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load SocialBlade analytics for this channel."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  const handleCpmUpdate = async () => {
    try {
      setError(null);
      const res = await getChannelRevenueApi(channelId, lowCpm, highCpm);
      setRevenue(res?.revenue_estimate || null);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to update the revenue estimate."));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6" aria-busy="true" aria-label="Loading channel analytics">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (!detail?.channel) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Card className="border-destructive/30 bg-destructive/5"><CardContent className="space-y-3 p-6"><h1 className="text-lg font-bold text-destructive">SocialBlade analytics unavailable</h1><p className="text-sm text-muted-foreground">{error || "The channel could not be resolved."}</p><Button type="button" onClick={loadChannelData}>Retry</Button></CardContent></Card>
      </div>
    );
  }

  const channel = detail?.channel || {};
  const analytics = detail?.analytics || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-foreground sm:p-6">
      {error && <Card className="border-amber-500/30 bg-amber-500/5"><CardContent className="flex items-center justify-between gap-4 p-4 text-sm"><span className="text-muted-foreground">{error}</span><Button type="button" variant="outline" size="sm" onClick={loadChannelData}>Retry</Button></CardContent></Card>}
      {/* Top Banner & Grade */}
      <Card className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border-border bg-gradient-to-r from-card via-primary/10 to-card p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
        {channel.banner_url && <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${channel.banner_url})` }} />}
        {channel.banner_url && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />}
        <div className="relative z-10 flex items-center gap-5">
          {(channel.profile_image || channel.thumbnail) ? (
            <img
              src={channel.profile_image || channel.thumbnail}
              alt={channel.channel_name}
              className="h-20 w-20 rounded-2xl border-2 border-white/60 object-cover shadow-lg dark:border-white/30"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-2xl font-bold text-primary">
              {channel.channel_name?.substring(0, 2) || "YT"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-foreground">{channel.channel_name}</h1>
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {channel.platform || "YouTube"}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 max-w-xl text-xs text-muted-foreground">
              {channel.description || "Tracked public channel statistics, historical growth, and revenue estimations."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{channel.country ? `Country: ${channel.country}` : ""}</span>
              <span>• Niche: {channel.niche || "General"}</span>
            </div>
          </div>
        </div>

        {/* SocialBlade Grade Box */}
        <Card className="relative z-10 flex min-w-[200px] items-center justify-between gap-5 rounded-2xl border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social Grade</p>
            <h2 className="mt-0.5 text-4xl font-black text-emerald-600 dark:text-emerald-400">{analytics.channel_grade || "A"}</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Score: {analytics.overall_channel_score || 85}/100</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-emerald-600 dark:text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
        </Card>
      </Card>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Subscribers</p>
            <h4 className="text-xl font-bold text-foreground">{Number(channel.subscriber_count || 0).toLocaleString()}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Views</p>
            <h4 className="text-xl font-bold text-foreground">{Number(channel.total_views || 0).toLocaleString()}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Videos</p>
            <h4 className="text-xl font-bold text-foreground">{channel.video_count || 0}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-5">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Est. Monthly Revenue</p>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{revenue?.monthly?.formatted || "$0.00"}</h4>
          </div>
        </Card>
      </div>

      {growth && <Card className="rounded-2xl border-border bg-card shadow-sm"><CardHeader><CardTitle className="text-lg font-bold text-foreground">Growth intelligence</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"><div><span className="block text-xs text-muted-foreground">Daily subscribers</span><strong>{Number(growth.daily_subscriber_growth || 0).toLocaleString()}</strong></div><div><span className="block text-xs text-muted-foreground">Daily views</span><strong>{Number(growth.daily_view_growth || 0).toLocaleString()}</strong></div><div><span className="block text-xs text-muted-foreground">Growth trend</span><strong className="capitalize">{growth.growth_trend || "stable"}</strong></div><div><span className="block text-xs text-muted-foreground">Growth percentage</span><strong>{Number(growth.growth_percentage || 0).toFixed(2)}%</strong></div></CardContent></Card>}

      {/* SocialBlade Revenue Estimator & Config */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> SocialBlade Estimated Earnings
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Calculated using view volume & configurable CPM ranges.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Low CPM ($):</span>
              <Input
                type="number"
                step="0.5"
                value={lowCpm}
                onChange={(e) => setLowCpm(Number(e.target.value))}
                className="h-7 w-14 rounded border-input bg-background px-1 text-center text-foreground"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">High CPM ($):</span>
              <Input
                type="number"
                step="0.5"
                value={highCpm}
                onChange={(e) => setHighCpm(Number(e.target.value))}
                className="h-7 w-14 rounded border-input bg-background px-1 text-center text-foreground"
              />
            </div>
            <Button
              onClick={handleCpmUpdate}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600/90 dark:bg-emerald-700"
            >
              Update
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Daily Estimate</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{revenue?.daily?.formatted}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Monthly Estimate</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{revenue?.monthly?.formatted}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Yearly Estimate</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{revenue?.yearly?.formatted}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Lifetime Estimate</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{revenue?.lifetime?.formatted}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Predictions & AI Growth Forecast */}
      {predictions && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex-row justify-between items-center space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" /> AI Growth & Milestone Predictions
            </CardTitle>
            <Badge variant="warning" className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              Confidence: {predictions.subscriber_predictions?.confidence_percentage}%
            </Badge>
          </CardHeader>

          <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(predictions.subscriber_predictions?.predictions || {}).map(([key, val]: [string, any]) => (
              <div key={key} className="rounded-xl border border-border bg-muted/50 p-3.5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{key.replace("_", " ")}</p>
                <p className="mt-1 text-base font-black text-foreground">{Number(val.predicted_subscribers).toLocaleString()}</p>
                <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">+{Number(val.gained).toLocaleString()} subs</p>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Top Videos List */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Video className="h-5 w-5 text-primary" /> Top Performing Videos & SEO Scores
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topVideos.slice(0, 10).map((v) => (
            <Card
              key={v.id || v.external_id}
              className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-muted/50 p-4 transition hover:bg-muted sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                {v.thumbnail_url && (
                  <img src={v.thumbnail_url} alt={v.title} className="w-20 h-12 object-cover rounded-lg" />
                )}
                <div>
                  <h4 className="line-clamp-1 text-sm font-bold text-foreground">{v.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Views: {Number(v.views || 0).toLocaleString()}</span>
                    <span>Likes: {Number(v.likes || 0).toLocaleString()}</span>
                    <span>Comments: {Number(v.comments || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/videos/${v.id}`}
                className="flex self-end items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 sm:self-center"
              >
                Analyze SEO & Viral Score <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return error instanceof Error ? error.message : fallback;
}
