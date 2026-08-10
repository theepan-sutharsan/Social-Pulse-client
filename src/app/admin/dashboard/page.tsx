'use client';

import { useEffect, useState } from "react";
import { Lightbulb, Radio, ShieldCheck, Users } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountsApi } from "@/services/accounts";
import { getSuggestionsApi } from "@/services/suggestions";
import { getTrackedChannelsApi } from "@/services/tracked-channels";

const metrics = [
  { key: "accounts" as const, label: "Connected accounts", icon: Users },
  { key: "channels" as const, label: "Tracked channels", icon: Radio },
  { key: "suggestions" as const, label: "AI suggestions", icon: Lightbulb },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ accounts: 0, channels: 0, suggestions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAccountsApi(), getTrackedChannelsApi(), getSuggestionsApi()])
      .then(([accounts, channels, suggestions]) => {
        setCounts({
          accounts: accounts.length,
          channels: channels.length,
          suggestions: suggestions.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Admin overview"
        title="Platform Administration"
        description="Monitor system-wide accounts, competitor channels, and generated content insights."
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <ExportButton
            csvUrl="/api/tracked-channels/export"
            pdfUrl="/api/tracked-channels/export?format=pdf"
            baseFilename="admin-tracked-channels"
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {metrics.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className="text-3xl font-black tracking-tight text-card-foreground">{counts[key]}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Available across the platform</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
