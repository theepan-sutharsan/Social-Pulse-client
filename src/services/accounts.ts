import { apiClient } from "@/lib/api-client";
import { ConnectedAccount } from "@/types/account";

export async function getAccountsApi() {
  const res = await apiClient.get("/api/accounts");
  return res.data.accounts as ConnectedAccount[];
}

export async function connectYoutubeApi(channel_id: string) {
  const res = await apiClient.post("/api/accounts/youtube", { channel_id });
  return res.data;
}

export async function getOAuthUrlApi(platform: 'instagram' | 'facebook' | 'tiktok') {
  const res = await apiClient.get(`/api/accounts/${platform}/oauth-url`);
  return res.data.oauth_url as string;
}

export async function syncAccountApi(id: number) {
  const res = await apiClient.post(`/api/accounts/${id}/sync`);
  return res.data;
}

export async function deleteAccountApi(id: number) {
  const res = await apiClient.delete(`/api/accounts/${id}`);
  return res.data;
}
