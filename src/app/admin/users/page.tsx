'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { CheckCircle2, Download, Search, ShieldCheck, UserCog, UserRound, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { downloadBlob } from "@/lib/download";
import { getAdminUsersApi, updateAdminUserApi } from "@/services/admin-users";
import { User } from "@/types/user";

type UserFilter = "all" | "active" | "inactive" | "admin" | "member";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getAdminUsersApi());
    } catch {
      toast.error("Unable to load user access data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((item) => {
      const matchesQuery = !normalizedQuery || [item.full_name, item.email, item.role].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesFilter = filter === "all"
        || (filter === "active" && item.is_active)
        || (filter === "inactive" && !item.is_active)
        || item.role === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, users]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((item) => item.is_active).length,
    admins: users.filter((item) => item.role === "admin").length,
    inactive: users.filter((item) => !item.is_active).length,
  }), [users]);

  const updateUser = async (item: User, payload: Partial<Pick<User, "role" | "is_active">>) => {
    setSavingId(item.id);
    try {
      const updated = await updateAdminUserApi(item.id, payload);
      setUsers((items) => items.map((entry) => entry.id === updated.id ? updated : entry));
      toast.success(`${updated.full_name || updated.email} updated.`);
    } catch (error: unknown) {
      const message = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Unable to update this user.");
    } finally {
      setSavingId(null);
    }
  };

  const exportUsers = async () => {
    try {
      setExporting(true);
      await downloadBlob("/api/admin/users/export", "social-pulse-users.csv");
      toast.success("User directory exported.");
    } catch {
      toast.error("Unable to export the user directory.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-2 sm:p-0">
      <PageHeader
        eyebrow="Access control"
        title="User access"
        description="Manage who can use Social Pulse, what they can access, and whether their workspace is active."
        icon={<UserCog className="h-5 w-5" />}
        actions={<Button variant="outline" size="sm" onClick={exportUsers} disabled={exporting}><Download className="h-4 w-4" />{exporting ? "Exporting..." : "Export users"}</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total users", value: stats.total, icon: Users, tone: "text-primary bg-primary/10" },
          { label: "Active workspaces", value: stats.active, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10" },
          { label: "Administrators", value: stats.admins, icon: ShieldCheck, tone: "text-violet-600 bg-violet-500/10" },
          { label: "Needs review", value: stats.inactive, icon: XCircle, tone: "text-rose-600 bg-rose-500/10" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="gap-3 p-4"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><div><p className="text-2xl font-black text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-base">Directory</CardTitle><p className="mt-1 text-xs text-muted-foreground">Search and update account access without leaving the console.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="h-9 pl-9 text-xs" /></div>
            <Select value={filter} onChange={(event) => setFilter(event.target.value as UserFilter)} className="h-9 text-xs sm:w-36"><option value="all">All users</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="admin">Admins</option><option value="member">Members</option></Select>
          </div>
        </CardHeader>
        <Table className="min-w-[820px] text-xs">
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Access</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Manage</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>)}
            {!loading && filteredUsers.length === 0 && <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No users match this view.</TableCell></TableRow>}
            {!loading && filteredUsers.map((item) => {
              const isCurrentUser = currentUser?.id === item.id;
              return <TableRow key={item.id}>
                <TableCell><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary"><UserRound className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-semibold text-foreground">{item.full_name}</p><p className="truncate text-muted-foreground">{item.email}</p></div></div></TableCell>
                <TableCell><Badge variant={item.role === "admin" ? "default" : "secondary"}>{item.role === "admin" ? "Administrator" : "Member"}</Badge></TableCell>
                <TableCell><Badge variant={item.is_active ? "success" : "destructive"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                <TableCell><div className="flex justify-end gap-2"><Select aria-label={`Change role for ${item.full_name}`} value={item.role} disabled={savingId === item.id || isCurrentUser} onChange={(event) => updateUser(item, { role: event.target.value as User["role"] })} className="h-8 w-28 text-[11px]"><option value="member">Member</option><option value="admin">Admin</option></Select><Button variant={item.is_active ? "outline" : "default"} size="sm" disabled={savingId === item.id || isCurrentUser} onClick={() => updateUser(item, { is_active: !item.is_active })} className="h-8 text-[11px]">{item.is_active ? "Deactivate" : "Activate"}</Button></div>{isCurrentUser && <p className="mt-1 text-right text-[10px] text-muted-foreground">Your access is protected</p>}</TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs text-muted-foreground"><span><strong className="text-foreground">Admin tip:</strong> Keep at least two active administrators for operational continuity.</span><Link href="/admin/dashboard" className="font-semibold text-primary hover:underline">Back to command center</Link></div>
    </div>
  );
}
