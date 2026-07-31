import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
