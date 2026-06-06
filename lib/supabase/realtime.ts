import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "./client";
import type { Match, TeamRequest } from "@/types";

export function subscribeMatches(
  tournamentId: string,
  onUpdate: (match: Match) => void
): RealtimeChannel {
  return supabase
    .channel(`matches:${tournamentId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "matches",
        filter: `tournament_id=eq.${tournamentId}`,
      },
      (payload) => onUpdate(payload.new as Match)
    )
    .subscribe();
}

export function subscribeTeamRequests(
  tournamentId: string,
  userId: string,
  onChange: (request: TeamRequest) => void
): RealtimeChannel {
  return supabase
    .channel(`team_requests:${tournamentId}:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "team_requests",
        filter: `tournament_id=eq.${tournamentId}`,
      },
      (payload) => onChange(payload.new as TeamRequest)
    )
    .subscribe();
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
