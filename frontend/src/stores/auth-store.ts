import type { User } from "@/types/api";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      updateUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: "gigino-pos-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);
