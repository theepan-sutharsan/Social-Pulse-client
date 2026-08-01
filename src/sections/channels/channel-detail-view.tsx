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
  TrendingUp,
  DollarSign,
  Award,
  Users,
  Eye,
  Video,
  Zap,
  Sparkles,
  Search,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export function ChannelDetailView() {
  const params = useParams();
  const channelId = params?.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [lowCpm, setLowCpm] = useState(2.0);
  const [highCpm, setHighCpm] = useState(8.0);

  const loadChannelData = async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const [dRes, gRes, rRes, pRes, tvRes] = await Promise.all([
        getChannelDetailApi(channelId),
        getChannelGrowthApi(channelId),
        getChannelRevenueApi(channelId, lowCpm, highCpm),
        getChannelPredictionsApi(channelId),
        getChannelTopVideosApi(channelId),
      ]);
      setDetail(dRes);
      setGrowth(gRes?.growth || null);
      setRevenue(rRes?.revenue_estimate || null);
      setPredictions(pRes || null);
      setTopVideos(tvRes?.top_videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  const handleCpmUpdate = async () => {
    try {
      const res = await getChannelRevenueApi(channelId, lowCpm, highCpm);
      setRevenue(res?.revenue_estimate || null);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Loading SocialBlade-Style Channel Analytics...</p>
      </div>
    );
  }

  const channel = detail?.channel || {};
  const analytics = detail?.analytics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Top Banner & Grade */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          {channel.profile_image ? (
            <img
              src={channel.profile_image}
              alt={channel.channel_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl font-bold text-indigo-400">
              {channel.channel_name?.substring(0, 2) || "YT"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white">{channel.channel_name}</h1>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {channel.platform || "YouTube"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
              {channel.description || "Tracked public channel statistics, historical growth, and revenue estimations."}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
              <span>{channel.country ? `Country: ${channel.country}` : ""}</span>
              <span>• Niche: {channel.niche || "General"}</span>
            </div>
          </div>
        </div>

        {/* SocialBlade Grade Box */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-5 min-w-[200px] justify-between shadow-xl">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Social Grade</p>
            <h2 className="text-4xl font-black text-emerald-400 mt-0.5">{analytics.channel_grade || "A"}</h2>
            <p className="text-[10px] text-slate-500 mt-1">Score: {analytics.overall_channel_score || 85}/100</p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#0e172a] border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Subscribers</p>
            <h4 className="text-xl font-bold text-white">{Number(channel.subscriber_count || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="p-5 bg-[#0e172a] border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Views</p>
            <h4 className="text-xl font-bold text-white">{Number(channel.total_views || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="p-5 bg-[#0e172a] border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Videos</p>
            <h4 className="text-xl font-bold text-white">{channel.video_count || 0}</h4>
          </div>
        </div>

        <div className="p-5 bg-[#0e172a] border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Est. Monthly Revenue</p>
            <h4 className="text-xl font-bold text-emerald-400">{revenue?.monthly?.formatted || "$0.00"}</h4>
          </div>
        </div>
      </div>

      {/* SocialBlade Revenue Estimator & Config */}
      <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> SocialBlade Estimated Earnings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated using view volume & configurable CPM ranges.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Low CPM ($):</span>
              <input
                type="number"
                step="0.5"
                value={lowCpm}
                onChange={(e) => setLowCpm(Number(e.target.value))}
                className="w-12 bg-slate-800 text-white rounded px-1 text-center border border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">High CPM ($):</span>
              <input
                type="number"
                step="0.5"
                value={highCpm}
                onChange={(e) => setHighCpm(Number(e.target.value))}
                className="w-12 bg-slate-800 text-white rounded px-1 text-center border border-slate-700"
              />
            </div>
            <button
              onClick={handleCpmUpdate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
            >
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Daily Estimate</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-1">{revenue?.daily?.formatted}</p>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Monthly Estimate</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-1">{revenue?.monthly?.formatted}</p>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Yearly Estimate</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-1">{revenue?.yearly?.formatted}</p>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Lifetime Estimate</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-1">{revenue?.lifetime?.formatted}</p>
          </div>
        </div>
      </div>

      {/* Predictions & AI Growth Forecast */}
      {predictions && (
        <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl space-y-5 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> AI Growth & Milestone Predictions
            </h3>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
              Confidence: {predictions.subscriber_predictions?.confidence_percentage}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(predictions.subscriber_predictions?.predictions || {}).map(([key, val]: [string, any]) => (
              <div key={key} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{key.replace("_", " ")}</p>
                <p className="text-base font-black text-white mt-1">{Number(val.predicted_subscribers).toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">+{Number(val.gained).toLocaleString()} subs</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Videos List */}
      <div className="p-6 bg-[#0e172a] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-400" /> Top Performing Videos & SEO Scores
        </h3>
        <div className="space-y-3">
          {topVideos.slice(0, 10).map((v) => (
            <div
              key={v.id || v.external_id}
              className="p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 transition"
            >
              <div className="flex items-center gap-4">
                {v.thumbnail_url && (
                  <img src={v.thumbnail_url} alt={v.title} className="w-20 h-12 object-cover rounded-lg" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{v.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Views: {Number(v.views || 0).toLocaleString()}</span>
                    <span>Likes: {Number(v.likes || 0).toLocaleString()}</span>
                    <span>Comments: {Number(v.comments || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/videos/${v.id}`}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 self-end sm:self-center"
              >
                Analyze SEO & Viral Score <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
