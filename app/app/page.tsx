"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { MatchCard } from "@/components/tournament/match-card";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import type { MatchWithPlayers, Tournament } from "@/types";

export default function UserHomePage() {
  const { user } = useSession();
  const [debt, setDebt] = useState(0);
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [tournaments, setTournaments] = useState<
    (Tournament & { venues: { name: string } | null })[]
  >([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [paymentsRes, tournamentsRes] = await Promise.all([
        supabase.from("payments").select("amount, paid_amount").eq("user_id", user!.id),
        supabase
          .from("tournament_members")
          .select("tournaments(*, venues(name))")
          .eq("user_id", user!.id),
      ]);

      const totalDebt = (paymentsRes.data ?? []).reduce(
        (s, p) => s + (Number(p.amount) - Number(p.paid_amount)),
        0
      );
      setDebt(totalDebt);

      const ongoing = (tournamentsRes.data ?? [])
        .map((r) => r.tournaments)
        .filter(
          (t): t is Tournament & { venues: { name: string } | null } =>
            t !== null && t.status === "ongoing"
        );
      setTournaments(ongoing);

      const { data: matchData } = await supabase
        .from("matches")
        .select(
          "*, team1_player1:users!matches_team1_player1_id_fkey(*), team1_player2:users!matches_team1_player2_id_fkey(*), team2_player1:users!matches_team2_player1_id_fkey(*), team2_player2:users!matches_team2_player2_id_fkey(*)"
        )
        .or(
          `team1_player1_id.eq.${user!.id},team1_player2_id.eq.${user!.id},team2_player1_id.eq.${user!.id},team2_player2_id.eq.${user!.id}`
        )
        .eq("status", "scheduled")
        .limit(5);

      setMatches((matchData ?? []) as MatchWithPlayers[]);
    }

    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold">Xin chào, {user.name}!</h1>
          <p className="text-sm text-muted-foreground">
            Level {user.level ?? "—"}
          </p>
        </div>
      </div>

      {debt > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="size-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Bạn còn nợ</p>
            <p className="font-mono text-lg font-semibold text-destructive">
              {formatCurrency(debt)}
            </p>
          </div>
          <Link
            href="/app/finance"
            className={cn(buttonVariants({ variant: "outline" }), "ml-auto")}
          >
            Xem chi tiết
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Trận sắp tới
        </h2>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có trận nào sắp diễn ra.
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Giải đang diễn ra
        </h2>
        {tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có giải đang diễn ra.
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
      </section>
    </div>
  );
}
