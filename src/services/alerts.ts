import { apiClient } from "@/lib/api-client";
import { Alert } from "@/types/alert";

export async function getAlertsApi() {
  const res = await apiClient.get("/api/alerts");
  return res.data.alerts as Alert[];
}

export async function markAlertReadApi(id: number) {
  const res = await apiClient.patch(`/api/alerts/${id}/read`);
  return res.data;
}
