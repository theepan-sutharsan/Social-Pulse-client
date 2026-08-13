'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CircleCheck,
  ExternalLink,
  FileText,
  Library,
  Lightbulb,
  Radio,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/export-button";
import { getAccountsApi } from "@/services/accounts";
import { getAdminUsersApi } from "@/services/admin-users";
import { getSuggestionsApi } from "@/services/suggestions";
import { getTrackedChannelsApi } from "@/services/tracked-channels";
import { ConnectedAccount } from "@/types/account";
import { Suggestion } from "@/types/suggestion";
import { TrackedChannel } from "@/types/tracked-channel";
import { User } from "@/types/user";

type Platform = ConnectedAccount["platform"];

const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

const quickActions = [
  { href: "/admin/users", label: "Manage user access", description: "Roles, active workspaces, and account review", icon: UserCog, tone: "bg-violet-500/10 text-violet-600" },
  { href: "/admin/accounts", label: "Review connections", description: "Platform accounts and sync coverage", icon: Radio, tone: "bg-sky-500/10 text-sky-600" },
  { href: "/admin/tracked-channels", label: "Curate research", description: "Competitor channels used by Social Pulse", icon: Library, tone: "bg-emerald-500/10 text-emerald-600" },
  { href: "/admin/suggestions", label: "Audit AI activity", description: "Generated suggestions across workspaces", icon: Sparkles, tone: "bg-amber-500/10 text-amber-600" },
];

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: number; detail: string; icon: typeof Users; tone: string }) {
  return (
    <Card className="gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-foreground">{value}</p></div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [channels, setChannels] = useState<TrackedChannel[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    Promise.all([getAdminUsersApi(), getAccountsApi(), getTrackedChannelsApi(), getSuggestionsApi()])
      .then(([userData, accountData, channelData, suggestionData]) => {
        setUsers(userData);
        setAccounts(accountData);
        setChannels(channelData);
        setSuggestions(suggestionData);
      })
      .catch(() => {
        setLoadFailed(true);
        toast.error("Some admin metrics could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  const activeUsers = users.filter((item) => item.is_active).length;
  const inactiveUsers = users.length - activeUsers;
  const platformCoverage = useMemo(() => {
    const counts = new Map<Platform, number>();
    accounts.forEach((account) => counts.set(account.platform, (counts.get(account.platform) || 0) + 1));
    return (Object.keys(platformLabels) as Platform[]).map((platform) => ({ platform, count: counts.get(platform) || 0 }));
  }, [accounts]);
  const recentUsers = users.slice(0, 5);
  const recentAccounts = [...accounts].sort((a, b) => (b.last_synced_at || "").localeCompare(a.last_synced_at || "")).slice(0, 4);
  const healthItems = [
    { label: "User access", detail: inactiveUsers ? `${inactiveUsers} inactive workspace${inactiveUsers === 1 ? "" : "s"} to review` : "All workspaces active", status: inactiveUsers ? "Review" : "Healthy", tone: inactiveUsers ? "warning" : "success" },
    { label: "Platform connections", detail: accounts.length ? `${accounts.length} connected account${accounts.length === 1 ? "" : "s"} monitored` : "No connections yet", status: accounts.length ? "Healthy" : "Empty", tone: accounts.length ? "success" : "warning" },
    { label: "Research library", detail: `${channels.length} tracked channel${channels.length === 1 ? "" : "s"} available`, status: channels.length ? "Healthy" : "Empty", tone: channels.length ? "success" : "warning" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-2 sm:p-0">
      <PageHeader
        eyebrow="Social Pulse admin console"
        title="Command center"
        description="A single operational view for access, platform connections, research coverage, and AI activity."
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={<><ExportButton csvUrl="/api/admin/users/export" baseFilename="social-pulse-users" /><Button asChild size="sm"><Link href="/admin/users"><UserCog className="h-4 w-4" />Manage access</Link></Button></>}
      />

      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-950 p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl space-y-4"><Badge className="border-white/20 bg-white/10 text-white">ADMIN ONLY · LIVE OVERVIEW</Badge><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Keep the intelligence engine moving.</h2><p className="max-w-xl text-sm leading-6 text-indigo-100">Manage the people, data sources, and research signals that power every Social Pulse workspace.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs text-indigo-100">Active users</p><p className="mt-1 text-2xl font-black">{loading ? "—" : activeUsers}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs text-indigo-100">AI outputs</p><p className="mt-1 text-2xl font-black">{loading ? "—" : suggestions.length}</p></div><div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-4 sm:col-span-1"><p className="text-xs text-indigo-100">Data status</p><p className="mt-1 flex items-center gap-2 text-sm font-bold"><CircleCheck className="h-4 w-4 text-emerald-300" />{loadFailed ? "Partial" : loading ? "Loading" : "Operational"}</p></div></div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="User workspaces" value={users.length} detail={`${activeUsers} active · ${inactiveUsers} inactive`} icon={Users} tone="bg-violet-500/10 text-violet-600" />
        <MetricCard label="Connected accounts" value={accounts.length} detail="Across YouTube and social platforms" icon={Radio} tone="bg-sky-500/10 text-sky-600" />
        <MetricCard label="Research channels" value={channels.length} detail="Competitor sources in the library" icon={Library} tone="bg-emerald-500/10 text-emerald-600" />
        <MetricCard label="AI suggestions" value={suggestions.length} detail="Generated across all workspaces" icon={Lightbulb} tone="bg-amber-500/10 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle className="text-base">Admin controls</CardTitle><p className="mt-1 text-xs text-muted-foreground">Jump directly to the platform area that needs attention.</p></div><Activity className="h-5 w-5 text-primary" /></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ href, label, description, icon: Icon, tone }) => <Link key={href} href={href} className="group flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="flex items-center gap-1 text-sm font-bold text-foreground">{label}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></Link>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle className="text-base">Platform coverage</CardTitle><p className="mt-1 text-xs text-muted-foreground">Connected source distribution.</p></div><Radio className="h-5 w-5 text-primary" /></CardHeader>
          <CardContent className="space-y-4">{platformCoverage.map(({ platform, count }) => <div key={platform} className="space-y-2"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-foreground">{platformLabels[platform]}</span><span className="text-muted-foreground">{count} account{count === 1 ? "" : "s"}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${accounts.length ? Math.max((count / accounts.length) * 100, count ? 8 : 0) : 0}%` }} /></div></div>)}<Link href="/admin/accounts" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open account directory <ArrowRight className="h-3.5 w-3.5" /></Link></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle className="text-base">Access activity</CardTitle><p className="mt-1 text-xs text-muted-foreground">Most recently registered workspaces.</p></div><Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">View all</Link></CardHeader><CardContent className="space-y-1">{loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />) : recentUsers.length ? recentUsers.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/40"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">{item.full_name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{item.full_name}</p><p className="truncate text-xs text-muted-foreground">{item.email}</p></div></div><div className="flex shrink-0 items-center gap-2"><Badge variant={item.role === "admin" ? "default" : "secondary"}>{item.role}</Badge><span className="hidden text-[11px] text-muted-foreground sm:inline">{formatDate(item.created_at)}</span></div></div>) : <p className="py-8 text-center text-xs text-muted-foreground">No users found.</p>}</CardContent></Card>

        <Card><CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle className="text-base">Connection activity</CardTitle><p className="mt-1 text-xs text-muted-foreground">Latest source synchronization signals.</p></div><Link href="/admin/accounts" className="text-xs font-semibold text-primary hover:underline">Manage</Link></CardHeader><CardContent className="space-y-1">{loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />) : recentAccounts.length ? recentAccounts.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/40"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600"><Radio className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{item.display_name}</p><p className="truncate text-xs text-muted-foreground">{platformLabels[item.platform]} · {item.video_count || 0} videos</p></div></div><span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(item.last_synced_at)}</span></div>) : <p className="py-8 text-center text-xs text-muted-foreground">No connected accounts found.</p>}</CardContent></Card>
      </div>

      <Card className="border-dashed bg-muted/20"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div><div><p className="text-sm font-bold text-foreground">Operational reports</p><p className="mt-1 text-xs text-muted-foreground">Export the research library or inspect platform-wide AI output when you need a handoff.</p></div></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link href="/admin/tracked-channels"><Library className="h-4 w-4" />Research library</Link></Button><Button asChild variant="outline" size="sm"><Link href="/admin/suggestions"><Sparkles className="h-4 w-4" />AI activity</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/dashboard"><ExternalLink className="h-4 w-4" />Creator workspace</Link></Button></div></CardContent></Card>
    </div>
  );
}
