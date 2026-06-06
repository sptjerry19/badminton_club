"use client";

import { useEffect, useState } from "react";

import {
  subscribeMatches,
  unsubscribeChannel,
} from "@/lib/supabase/realtime";
import type { Match } from "@/types";

export function useRealtimeMatches(
  tournamentId: string | null,
  initialMatches: Match[]
) {
  const [matches, setMatches] = useState(initialMatches);

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    if (!tournamentId) return;

    const channel = subscribeMatches(tournamentId, (updated) => {
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    });

    return () => unsubscribeChannel(channel);
  }, [tournamentId]);

  return matches;
}
