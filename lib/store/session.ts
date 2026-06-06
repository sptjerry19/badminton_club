import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SessionUser } from "@/types";

interface SessionState {
  user: SessionUser | null;
  setSession: (user: SessionUser) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    { name: "badminton-club-session" }
  )
);
