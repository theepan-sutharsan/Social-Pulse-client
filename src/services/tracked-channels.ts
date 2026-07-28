import { apiClient } from "@/lib/api-client";
import { TrackedChannel } from "@/types/tracked-channel";

export async function getTrackedChannelsApi() {
  const res = await apiClient.get("/api/tracked-channels");
  return res.data.tracked_channels as TrackedChannel[];
}

export async function createTrackedChannelApi(data: { channel_id: string; channel_name: string; niche?: string }) {
  const res = await apiClient.post("/api/tracked-channels", data);
  return res.data;
}

export async function deleteTrackedChannelApi(id: number) {
  const res = await apiClient.delete(`/api/tracked-channels/${id}`);
  return res.data;
}

export async function syncTrackedChannelApi(id: number) {
  const res = await apiClient.post(`/api/tracked-channels/${id}/sync`);
  return res.data;
}

export async function importTrackedChannelsCsvApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post("/api/tracked-channels/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
