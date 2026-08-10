'use client';

import { useState } from "react";
import { compareCompetitorsApi } from "@/services/multiplatform-analytics";
import { Award, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";

export function CompetitorComparisonView() {
  const [competitorInput, setCompetitorInput] = useState("@TechGuruPro");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorInput.trim()) return;
    try {
      setLoading(true);
      const res = await compareCompetitorsApi(undefined, competitorInput.trim());
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const comp = result?.comparison || {};
  const user = comp.user || {};
  const competitor = comp.competitor || {};
  const gaps = result?.gaps || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-foreground sm:p-6">
      <PageHeader
        eyebrow="Competitive intelligence"
        icon={<ArrowRightLeft className="h-6 w-6 text-primary" />}
        title="Side-by-Side Competitor Benchmark"
        description="Compare audience size, engagement, overall scores, and estimated revenue vs competitor channels."
      />

      {/* Compare Form */}
      <Card className="space-y-4 rounded-2xl border-border bg-card p-4 shadow-sm sm:p-6">
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="competitor-channel" className="mb-1.5 block text-xs font-semibold text-foreground">Enter Competitor YouTube Handle or Channel ID</Label>
            <Input
              id="competitor-channel"
              type="text"
              placeholder="@TechGuruPro"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              className="w-full rounded-xl border-input bg-background p-3 text-sm text-foreground"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-6 py-3 text-xs font-bold sm:w-auto"
          >
            {loading ? "Analyzing..." : "Compare Competitor"}
          </Button>
        </form>
      </Card>

      {/* Comparison Results Grid */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Winner Banner */}
          <Card className="flex flex-col items-start justify-between gap-4 rounded-2xl border-primary/30 bg-gradient-to-r from-primary/10 via-card to-primary/10 p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Comparative Benchmark Result</span>
              <h2 className="mt-1 text-xl font-black text-foreground sm:text-2xl">
                Leader: <span className="text-emerald-600 dark:text-emerald-400">{gaps.leader}</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Follower Gap: {gaps.follower_gap >= 0 ? `+${gaps.follower_gap}` : gaps.follower_gap} | Overall Score Gap: {gaps.score_gap}
              </p>
            </div>
            <Award className="h-10 w-10 shrink-0 text-amber-600 dark:text-amber-400 sm:h-12 sm:w-12" />
          </Card>

          {/* Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Account Card */}
            <Card className="relative rounded-2xl border-primary/40 bg-card shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Your Channel</span>
                  <CardTitle className="text-xl font-extrabold text-foreground">{user.name}</CardTitle>
                </div>
                <Badge className="rounded-lg border-transparent bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Score: {user.overall_score}/100
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 pt-6 text-sm">
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Followers / Subs</span>
                  <span className="font-bold text-foreground">{Number(user.followers || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-bold text-foreground">{Number(user.total_views || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Engagement Score</span>
                  <span className="font-bold text-primary">{user.engagement_score}/100</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Monthly Est. Revenue</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.revenue_estimate?.formatted || "$0.00"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Card */}
            <Card className="rounded-2xl border-border bg-card shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Competitor Channel</span>
                  <CardTitle className="text-xl font-extrabold text-foreground">{competitor.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-lg border-transparent px-3 py-1 text-xs font-bold">
                  Score: {competitor.overall_score}/100
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 pt-6 text-sm">
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Followers / Subs</span>
                  <span className="font-bold text-foreground">{Number(competitor.followers || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-bold text-foreground">{Number(competitor.total_views || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Engagement Score</span>
                  <span className="font-bold text-primary">{competitor.engagement_score}/100</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Monthly Est. Revenue</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{competitor.revenue_estimate?.formatted || "$0.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
