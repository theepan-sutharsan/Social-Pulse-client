import { apiClient } from "./api-client";

export async function downloadBlob(url: string, filename: string) {
  try {
    const res = await apiClient.get(url, { responseType: "blob" });
    const href = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  }
}
