import { apiClient } from "@/lib/api-client";
import { Suggestion } from "@/types/suggestion";

export async function generateSuggestionApi(payload: {
  type: string;
  connected_account_id?: number;
  tracked_channel_id?: number;
}) {
  const res = await apiClient.post("/api/suggestions", payload);
  return res.data.suggestion as Suggestion;
}

export async function getSuggestionsApi() {
  const res = await apiClient.get("/api/suggestions");
  return res.data.suggestions as Suggestion[];
}

export async function getSuggestionDetailApi(id: number) {
  const res = await apiClient.get(`/api/suggestions/${id}`);
  return res.data.suggestion as Suggestion;
}

export async function deleteSuggestionApi(id: number) {
  const res = await apiClient.delete(`/api/suggestions/${id}`);
  return res.data;
}
