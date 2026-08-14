import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { pricingPlans, formatLkr } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const plans = compact ? pricingPlans : pricingPlans;

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Simple monthly plans
        </div>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Choose the intelligence layer for your next stage.</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">Start with the workflow you need today. Upgrade as your content operation, channels, and team grow.</p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.name} className={`relative overflow-hidden ${plan.featured ? "border-primary shadow-xl shadow-primary/10 lg:-translate-y-2" : ""}`}>
              {plan.featured && <div className="absolute inset-x-0 top-0 h-1 bg-primary" />}
              <CardHeader className="gap-5 p-6 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${plan.featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}><Icon className="h-5 w-5" /></div>
                  {plan.featured && <Badge>Most popular</Badge>}
                </div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{plan.audience}</p><h3 className="mt-2 text-2xl font-black text-foreground">{plan.name}</h3><p className="mt-2 min-h-12 text-sm leading-5 text-muted-foreground">{plan.description}</p></div>
                <div className="flex items-end gap-2"><span className="text-4xl font-black tracking-tight text-foreground">Rs {formatLkr(plan.price)}</span><span className="pb-1 text-xs text-muted-foreground">/ month</span></div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                <Button asChild className="w-full" variant={plan.featured ? "default" : "outline"}><Link href={`/auth/register?plan=${plan.name.toLowerCase()}`}>Start with {plan.name}<ArrowRight className="h-4 w-4" /></Link></Button>
                <div className="space-y-3 border-t border-border pt-5">{plan.features.map((feature) => <div key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><span>{feature}</span></div>)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">All plans are billed monthly in Sri Lankan Rupees. Payment activation can be connected to your preferred gateway before launch.</p>
    </section>
  );
}
