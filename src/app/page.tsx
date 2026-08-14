'use client';

import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Video, ArrowRight } from "lucide-react";
import { PricingSection } from "@/components/pricing-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Video Analytics & AI Content Strategy
        </div>

        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Supercharge Your Reach with <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Connect your YouTube, Instagram, Facebook, and TikTok accounts. Social Pulse tracks your video metrics over time and generates high-converting AI titles, hooks, and content calendars.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 sm:w-auto"
          >
            Start Free Today <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-xl border border-border bg-secondary px-8 py-4 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 sm:w-auto"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-card-foreground">Multi-Platform Tracking</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Link YouTube (public channel), Instagram, Facebook, and TikTok. Synchronize post performance & metrics automatically.
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-card-foreground">AI Content Generation</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AI-powered generation for viral titles, high-hook captions, hashtag sets, and 4-week content calendars.
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-card-foreground">Growth & PDF Reports</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Time-series metric growth charts, instant CSV export, and document PDF reports for suggestions and account performance.
          </p>
          </CardContent>
        </Card>
      </section>

      <PricingSection compact />
    </div>
  );
}
