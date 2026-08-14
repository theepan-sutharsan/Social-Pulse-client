import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { PricingSection } from "@/components/pricing-section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-4 w-4 text-primary" /> Built for focused content teams</div>
        </div>
        <PricingSection />
      </main>
    </div>
  );
}
