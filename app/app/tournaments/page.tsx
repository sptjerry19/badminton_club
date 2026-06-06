"use client";

import { useEffect, useState } from "react";

import { TournamentCard } from "@/components/tournament/tournament-card";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Tournament } from "@/types";

export default function UserTournamentsPage() {
  const { user } = useSession();
  const [tournaments, setTournaments] = useState<
    (Tournament & { venues: { name: string } | null; wins?: number; losses?: number })[]
  >([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("tournament_members")
        .select("tournaments(*, venues(name))")
        .eq("user_id", user!.id);

      const list = (data ?? [])
        .map((r) => r.tournaments)
        .filter((t): t is Tournament & { venues: { name: string } | null } => t !== null);

      setTournaments(list);
    }

    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Giải đấu của tôi</h1>
        <p className="text-sm text-muted-foreground">
          Các giải bạn đã đăng ký tham gia
        </p>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bạn chưa tham gia giải nào.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              href={`/app/tournaments/${t.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
