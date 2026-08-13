import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

export async function loginApi(email: string, password: string) {
  const res = await apiClient.post("/api/auth/login", { email, password });
  return res.data;
}

export async function registerApi(payload: { email: string; password: string; full_name: string }) {
  const res = await apiClient.post("/api/auth/register", payload);
  return res.data;
}

export async function requestPasswordResetApi(email: string) {
  const res = await apiClient.post("/api/auth/forgot-password", { email });
  return res.data;
}

export async function resetPasswordApi(token: string, password: string) {
  const res = await apiClient.post("/api/auth/reset-password", { token, password });
  return res.data;
}

export async function getProfileApi() {
  const res = await apiClient.get("/api/auth/profile");
  return res.data.user as User;
}

export async function updateProfileApi(data: Partial<User & { password?: string }>) {
  const res = await apiClient.put("/api/auth/profile", data);
  return res.data;
}
