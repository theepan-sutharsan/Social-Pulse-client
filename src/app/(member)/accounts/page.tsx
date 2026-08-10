'use client';
import { useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getAccountsApi, syncAccountApi, deleteAccountApi } from "@/services/accounts";
import { ConnectedAccount } from "@/types/account";
import Link from "next/link";
import { RefreshCw, Trash2, Video, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccountsApi();
      setAccounts(data);
    } catch (err) {
      toast.error("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleSync = async (id: number) => {
    try {
      toast.info("Syncing videos from platform...");
      const res = await syncAccountApi(id);
      toast.success(`Fetched ${res.videos_fetched} videos (${res.new_videos} new)!`);
      loadAccounts();
    } catch (e) {
      toast.error("Sync failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await deleteAccountApi(id);
      toast.success("Account disconnected.");
      loadAccounts();
    } catch (e) {
      toast.error("Disconnect failed.");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Channels"
          title="Connected Accounts"
          description="Manage platform channels and trigger metric syncing."
          actions={(
            <Link
              href="/accounts/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Connect New Account
            </Link>
          )}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading accounts">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="p-6">
                <Skeleton className="mb-6 h-6 w-20" />
                <Skeleton className="mb-3 h-5 w-2/3" />
                <Skeleton className="mb-8 h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Video className="mb-4 h-8 w-8 text-primary" />
              <CardTitle>No accounts connected</CardTitle>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Connect a platform account to sync videos and start tracking performance.
              </p>
              <Link
                href="/accounts/new"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Connect an Account
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc) => (
              <Card key={acc.id} className="flex flex-col justify-between overflow-hidden">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge className="uppercase tracking-wider">{acc.platform}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(acc.id)}
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Disconnect ${acc.display_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle>{acc.display_name}</CardTitle>
                  <p className="break-all text-xs text-muted-foreground">ID: {acc.platform_account_id}</p>
                </CardHeader>

                <CardFooter className="justify-between gap-2 border-t border-border bg-muted/30 pt-4">
                  <Link
                    href={`/accounts/${acc.id}/videos`}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Video className="h-3.5 w-3.5" /> Videos
                  </Link>
                  <Button
                    onClick={() => handleSync(acc.id)}
                    size="sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Sync
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
