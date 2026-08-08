'use client';

import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Video, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030718] text-white">
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Video Analytics & AI Content Strategy
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Supercharge Your Reach with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400">AI Intelligence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
          Connect your YouTube, Instagram, Facebook, and TikTok accounts. Social Pulse tracks your video metrics over time and generates high-converting AI titles, hooks, and content calendars.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            Start Free Today <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-800 rounded-2xl transition"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="p-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Multi-Platform Tracking</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Link YouTube (public channel), Instagram, Facebook, and TikTok. Synchronize post performance & metrics automatically.
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">AI Content Generation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            AI-powered generation for viral titles, high-hook captions, hashtag sets, and 4-week content calendars.
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Growth & PDF Reports</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Time-series metric growth charts, instant CSV export, and document PDF reports for suggestions and account performance.
          </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
