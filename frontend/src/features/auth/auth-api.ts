import { api } from "@/services/api";
import type { User } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<{ token: string; user: User }>(
    "/auth/login",
    payload,
  );

  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get<{ data: User }>("/auth/me");
  return response.data.data;
}

export interface ProfileInput {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const response = await api.patch<{ data: User }>("/auth/profile", input);
  return response.data.data;
}
