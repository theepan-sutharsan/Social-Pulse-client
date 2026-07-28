import { apiClient } from "@/lib/api-client";
import { DashboardData } from "@/types/dashboard";

export async function getDashboardApi() {
  const res = await apiClient.get("/api/me/dashboard");
  return res.data as DashboardData;
}
