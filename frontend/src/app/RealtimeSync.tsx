import { connectRealtime } from "@/services/realtime";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export function RealtimeSync() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    return connectRealtime() ?? undefined;
  }, [token]);

  return null;
}
