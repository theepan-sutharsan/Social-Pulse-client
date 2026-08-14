import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

export async function getAdminUsersApi(): Promise<User[]> {
  const res = await apiClient.get("/api/admin/users");
  return res.data.users as User[];
}

export async function updateAdminUserApi(
  id: number,
  payload: Partial<Pick<User, "full_name" | "role" | "is_active">>,
): Promise<User> {
  const res = await apiClient.put(`/api/admin/users/${id}`, payload);
  return res.data.user as User;
}

export async function deactivateAdminUserApi(id: number): Promise<User> {
  const res = await apiClient.post(`/api/admin/users/${id}/deactivate`);
  return res.data.user as User;
}
