'use client';

import { useEffect, useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlertsApi, markAlertReadApi } from "@/services/alerts";
import { Alert } from "@/types/alert";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlertsApi();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markAlertReadApi(id);
      loadAlerts();
    } catch (e) {
      toast.error("Failed to update alert.");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Activity Center"
          title="Notifications & Alerts"
          description="Review account notifications and competitor performance signals."
          icon={<Bell className="h-5 w-5" />}
          actions={!loading && alerts.length > 0 ? <Badge variant="secondary">{alerts.length} total</Badge> : undefined}
        />

        {loading ? (
          <div className="space-y-3" aria-label="Loading alerts">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="p-4">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">No active notifications or competitor viral alerts.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={alert.is_read
                  ? "bg-muted/40 text-muted-foreground"
                  : "border-primary/30 bg-primary/5 text-card-foreground"}
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="uppercase tracking-wider">{alert.type}</Badge>
                      {alert.is_read && <Badge variant="outline">Read</Badge>}
                    </div>
                    <p className="text-xs font-semibold leading-5">{alert.message}</p>
                  </div>
                  {!alert.is_read && (
                    <Button
                      onClick={() => handleMarkRead(alert.id)}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary"
                      aria-label="Mark alert as read"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
