'use client';

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccountsApi } from "@/services/accounts";
import { ConnectedAccount } from "@/types/account";

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountsApi()
      .then(setAccounts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 sm:p-0">
      <PageHeader
        eyebrow="Account directory"
        title="All Platform Accounts"
        description="Review every connected user account and its latest synchronization status."
        icon={<Users className="h-5 w-5" />}
        actions={<ExportButton csvUrl="/api/accounts/export" baseFilename="all-platform-accounts" />}
      />

      <Card className="overflow-hidden">
        <Table className="min-w-[640px] text-xs">
          <TableHeader>
            <TableRow className="hover:bg-slate-900/60">
              <TableHead>User ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Last Synced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4} className="py-4">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-slate-400">
                  No connected accounts found.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="whitespace-nowrap font-mono text-slate-400">{account.user_id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className="border-transparent bg-transparent p-0 uppercase text-indigo-400">
                      {account.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold text-white">{account.display_name}</TableCell>
                  <TableCell className="whitespace-nowrap text-slate-400">
                    {account.last_synced_at?.substring(0, 10) || "Never"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
