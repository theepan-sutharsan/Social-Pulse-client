'use client';

import { useState } from "react";
import { compareCompetitorsApi } from "@/services/multiplatform-analytics";
import { Users, Award, TrendingUp, DollarSign, ShieldCheck, ArrowRightLeft, Sparkles } from "lucide-react";

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
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-indigo-400" /> Side-by-Side Competitor Benchmark
        </h1>
        <p className="text-xs text-slate-400 mt-1">Compare audience size, engagement, overall scores, and estimated revenue vs competitor channels.</p>
      </div>

      {/* Compare Form */}
      <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Competitor YouTube Handle or Channel ID</label>
            <input
              type="text"
              placeholder="@TechGuruPro"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {loading ? "Analyzing..." : "Compare Competitor"}
          </button>
        </form>
      </div>

      {/* Comparison Results Grid */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Winner Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Comparative Benchmark Result</span>
              <h2 className="text-2xl font-black text-white mt-1">
                Leader: <span className="text-emerald-400">{gaps.leader}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Follower Gap: {gaps.follower_gap >= 0 ? `+${gaps.follower_gap}` : gaps.follower_gap} | Overall Score Gap: {gaps.score_gap}
              </p>
            </div>
            <Award className="w-12 h-12 text-amber-400" />
          </div>

          {/* Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Account Card */}
            <div className="p-6 bg-[#0e172a] border border-indigo-500/40 rounded-2xl space-y-6 shadow-xl relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Your Channel</span>
                  <h3 className="text-xl font-extrabold text-white">{user.name}</h3>
                </div>
                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold">
                  Score: {user.overall_score}/100
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Followers / Subs</span>
                  <span className="font-bold text-white">{Number(user.followers || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Total Views</span>
                  <span className="font-bold text-white">{Number(user.total_views || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Engagement Score</span>
                  <span className="font-bold text-indigo-400">{user.engagement_score}/100</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Monthly Est. Revenue</span>
                  <span className="font-bold text-emerald-400">{user.revenue_estimate?.formatted || "$0.00"}</span>
                </div>
              </div>
            </div>

            {/* Competitor Card */}
            <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competitor Channel</span>
                  <h3 className="text-xl font-extrabold text-white">{competitor.name}</h3>
                </div>
                <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                  Score: {competitor.overall_score}/100
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Followers / Subs</span>
                  <span className="font-bold text-white">{Number(competitor.followers || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Total Views</span>
                  <span className="font-bold text-white">{Number(competitor.total_views || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Engagement Score</span>
                  <span className="font-bold text-indigo-400">{competitor.engagement_score}/100</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/90 rounded-xl">
                  <span className="text-slate-400">Monthly Est. Revenue</span>
                  <span className="font-bold text-emerald-400">{competitor.revenue_estimate?.formatted || "$0.00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
