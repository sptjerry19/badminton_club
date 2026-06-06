"use client";

import { useEffect, useState } from "react";

import { useSessionStore } from "@/lib/store/session";

export function useSession() {
  const user = useSessionStore((s) => s.user);
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return { user, setSession, clearSession, hydrated };
}
