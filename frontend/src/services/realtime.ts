import { queryClient } from "@/app/query-client";
import { cashierKeys } from "@/features/cashier/cashier-queries";
import { adminKeys } from "@/features/admin/admin-queries";
import { API_URL } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

export function connectRealtime(): (() => void) | null {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const token = useAuthStore.getState().token;
  if (!key || !token) return null;

  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? "http";
  const host = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname;
  const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);
  const echo = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  const refreshOperations = () => {
    queryClient.invalidateQueries({ queryKey: cashierKeys.tables });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: cashierKeys.stats });
    queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: ["admin", "report"] });
  };

  echo
    .private("restaurant.operations")
    .listen(".table.status.changed", refreshOperations)
    .listen(".payment.completed", refreshOperations);

  return () => {
    echo.leave("restaurant.operations");
    echo.disconnect();
  };
}
