"use client";

import { useEffect, useState } from "react";

import {
  subscribeTeamRequests,
  unsubscribeChannel,
} from "@/lib/supabase/realtime";
import type { TeamRequest } from "@/types";

export function useRealtimeTeamRequests(
  tournamentId: string | null,
  userId: string | null,
  initialRequests: TeamRequest[]
) {
  const [requests, setRequests] = useState(initialRequests);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    if (!tournamentId || !userId) return;

    const channel = subscribeTeamRequests(tournamentId, userId, (updated) => {
      setRequests((prev) => {
        const exists = prev.some((r) => r.id === updated.id);
        if (exists) {
          return prev.map((r) => (r.id === updated.id ? updated : r));
        }
        return [...prev, updated];
      });
    });

    return () => unsubscribeChannel(channel);
  }, [tournamentId, userId]);

  return requests;
}
