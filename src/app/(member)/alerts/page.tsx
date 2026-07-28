'use client';

import { useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { getAlertsApi, markAlertReadApi } from "@/services/alerts";
import { Alert } from "@/types/alert";
import { Bell, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-400" /> Notifications & Alerts
        </h1>

        {loading ? (
          <div className="text-center py-12 text-indigo-400">Loading alerts...</div>
        ) : (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-[#0e172a] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No active notifications or competitor viral alerts.
              </div>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className={`p-4 rounded-xl border flex items-center justify-between ${a.is_read ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-[#0e172a] border-indigo-800 text-white'}`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400">{a.type}</span>
                    <p className="text-xs font-semibold">{a.message}</p>
                  </div>
                  {!a.is_read && (
                    <button onClick={() => handleMarkRead(a.id)} className="p-1.5 text-indigo-400 hover:text-white">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
