'use client';

import { useEffect, useState } from "react";
import { getDashboardApi } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import { ExportButton } from "@/components/export-button";
import Link from "next/link";
import { Radio, Video, Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardApi();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Loading dashboard">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const chartData = data?.growth_series?.[0]?.series?.map((m: any) => ({
    time: m.recorded_at ? m.recorded_at.substring(5, 10) : "",
    views: m.views,
    likes: m.likes,
  })) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        eyebrow="Performance overview"
        title="Member Reach Dashboard"
        description="Overview of connected accounts, video metrics, and AI suggestions"
        actions={
          <>
          <Button
            onClick={loadData}
            variant="secondary"
            size="icon"
            className="rounded-lg border border-border p-2"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <ExportButton csvUrl="/api/videos/export" pdfUrl="/api/me/dashboard/pdf" baseFilename="social-pulse-dashboard" />
          </>
        }
      />

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="rounded-xl bg-primary/10 p-3.5 text-primary">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Connected Accounts</p>
            <h3 className="text-2xl font-black text-foreground">{data?.totals.connected_accounts || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="rounded-xl bg-primary/10 p-3.5 text-primary">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Tracked Videos</p>
            <h3 className="text-2xl font-black text-foreground">{data?.totals.videos || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="rounded-xl bg-primary/10 p-3.5 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">AI Suggestions</p>
            <h3 className="text-2xl font-black text-foreground">{data?.totals.suggestions || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Growth Chart */}
      {chartData.length > 0 && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" /> Video Views Snapshot Growth
            </CardTitle>
            <span className="text-xs text-muted-foreground">Time-series Metrics</span>
          </CardHeader>
          <CardContent>
          <div className="h-64 w-full" aria-label="Video views growth chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }} />
                <Line type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} dot={{ fill: "#4f46e5" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts & Recent Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-4 rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Connected Platforms</h3>
            <Link href="/accounts/new" className="text-xs font-semibold text-primary hover:underline">
              + Connect Account
            </Link>
          </div>
          <div className="space-y-3">
            {data?.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{acc.platform}</span>
                  <p className="text-sm font-semibold text-foreground">{acc.display_name}</p>
                </div>
                <Link
                  href={`/accounts/${acc.id}/videos`}
                  className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
                >
                  View Videos
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Recent AI Suggestions</h3>
            <Link href="/suggestions/new" className="text-xs font-semibold text-primary hover:underline">
              + Generate New
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recent_suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/suggestions/${s.id}`}
                className="block rounded-xl bg-muted/50 p-3 transition hover:bg-muted"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold uppercase text-primary">{s.type}</span>
                  <span className="text-muted-foreground">{s.created_at?.substring(0, 10)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{s.input_context}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
