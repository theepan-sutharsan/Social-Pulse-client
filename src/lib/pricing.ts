import type { LucideIcon } from "lucide-react";
import { Building2, Rocket, Sparkles } from "lucide-react";

export type PricingPlan = {
  name: "Starter" | "Pro" | "Agency";
  price: number;
  description: string;
  audience: string;
  icon: LucideIcon;
  featured?: boolean;
  features: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: 3900,
    description: "The essential toolkit for creators building a consistent content engine.",
    audience: "For solo creators",
    icon: Sparkles,
    features: [
      "Connect your core social accounts",
      "Track content performance over time",
      "AI titles, hooks, captions, and hashtags",
      "Video transcript and AI analysis tools",
      "CSV exports for your content data",
    ],
  },
  {
    name: "Pro",
    price: 8900,
    description: "Deeper intelligence for creators and growing teams ready to scale output.",
    audience: "For growing teams",
    icon: Rocket,
    featured: true,
    features: [
      "Everything in Starter",
      "Multi-platform account monitoring",
      "YouTube channel and audience intelligence",
      "Competitor research and tracked channels",
      "Growth analytics, alerts, and PDF reports",
    ],
  },
  {
    name: "Agency",
    price: 18900,
    description: "A command center for managing multiple brands, clients, and content programs.",
    audience: "For agencies and studios",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Multi-brand workspace operations",
      "Centralized client and account oversight",
      "Research library for competitive intelligence",
      "Priority onboarding and workflow guidance",
    ],
  },
];

export function formatLkr(value: number) {
  return new Intl.NumberFormat("en-LK").format(value);
}
