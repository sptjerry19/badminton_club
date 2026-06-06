"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { MatchCard } from "@/components/tournament/match-card";
import { StatusBadge } from "@/components/tournament/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeMatches } from "@/hooks/use-realtime-matches";
import { formatDate } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { MatchWithPlayers, TeamRequest, Tournament, User, Venue } from "@/types";

export default function UserTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [tournament, setTournament] = useState<
    (Tournament & { venues: Venue | null }) | null
  >(null);
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [partner, setPartner] = useState<User | null>(null);

  const liveMatches = useRealtimeMatches(id, matches);

  useEffect(() => {
    async function load() {
      const [tRes, mRes] = await Promise.all([
        supabase.from("tournaments").select("*, venues(*)").eq("id", id).single(),
        supabase
          .from("matches")
          .select(
            "*, team1_player1:users!matches_team1_player1_id_fkey(*), team1_player2:users!matches_team1_player2_id_fkey(*), team2_player1:users!matches_team2_player1_id_fkey(*), team2_player2:users!matches_team2_player2_id_fkey(*)"
          )
          .eq("tournament_id", id),
      ]);

      setTournament(tRes.data as Tournament & { venues: Venue | null });
      setMatches((mRes.data ?? []) as MatchWithPlayers[]);

      if (user) {
        const { data: accepted } = await supabase
          .from("team_requests")
          .select("*, partner:users!team_requests_partner_id_fkey(*), requester:users!team_requests_requester_id_fkey(*)")
          .eq("tournament_id", id)
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
          .maybeSingle();

        if (accepted) {
          const req = accepted as TeamRequest & {
            partner: User | null;
            requester: User | null;
          };
          setPartner(
            req.requester_id === user.id ? req.partner : req.requester
          );
        }
      }
    }

    load();
  }, [id, user]);

  if (!tournament) {
    return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{tournament.name}</h1>
            <StatusBadge type="tournament" status={tournament.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(tournament.date)}
            {tournament.venues?.name ? ` · ${tournament.venues.name}` : ""}
          </p>
        </div>
        <Link
          href={`/app/tournaments/${id}/team`}
          className={buttonVariants({ variant: "outline" })}
        >
          Ghép đôi
        </Link>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Lịch thi đấu</TabsTrigger>
          <TabsTrigger value="team">Đội của tôi</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-3 pt-4">
          {liveMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có trận đấu.</p>
          ) : (
            liveMatches.map((m) => (
              <MatchCard key={m.id} match={m as MatchWithPlayers} />
            ))
          )}
        </TabsContent>

        <TabsContent value="team" className="pt-4">
          <div className="rounded-xl border border-border bg-bg-2 p-4">
            <p className="text-sm text-muted-foreground">Partner hiện tại</p>
            <p className="mt-2 text-lg font-medium">
              {partner?.name ?? "Chưa có partner — hãy mời ai đó!"}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {tournament.prize_description && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Giải thưởng
          </p>
          <p className="mt-1 text-sm">{tournament.prize_description}</p>
        </div>
      )}
    </div>
  );
}
