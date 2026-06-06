"use client";

import { useEffect, useState } from "react";

import { UserAvatar } from "@/components/avatar/user-avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Evaluation } from "@/types";

export default function UserProfilePage() {
  const { user } = useSession();
  const [tournamentCount, setTournamentCount] = useState(0);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [membersRes, evalsRes, matchesRes] = await Promise.all([
        supabase
          .from("tournament_members")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
        supabase
          .from("evaluations")
          .select("*")
          .eq("evaluated_user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("matches")
          .select("team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_score, team2_score, status")
          .eq("status", "finished")
          .or(
            `team1_player1_id.eq.${user!.id},team1_player2_id.eq.${user!.id},team2_player1_id.eq.${user!.id},team2_player2_id.eq.${user!.id}`
          ),
      ]);

      setTournamentCount(membersRes.count ?? 0);
      setEvaluations(evalsRes.data ?? []);

      let w = 0;
      let l = 0;
      (matchesRes.data ?? []).forEach((m) => {
        const inTeam1 =
          m.team1_player1_id === user!.id || m.team1_player2_id === user!.id;
        const team1Won = (m.team1_score ?? 0) > (m.team2_score ?? 0);
        if (inTeam1) {
          if (team1Won) w++;
          else l++;
        } else {
          if (team1Won) l++;
          else w++;
        }
      });
      setWins(w);
      setLosses(l);
    }

    load();
  }, [user]);

  if (!user) return null;

  const avgScore =
    evaluations.length > 0
      ? (
          evaluations.reduce((s, e) => s + (e.score ?? 0), 0) /
          evaluations.length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Level {user.level ?? "—"} · {user.role}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Giải tham gia" value={tournamentCount} />
        <StatCard label="Thắng" value={wins} delta={`${losses} thua`} />
        <StatCard label="Điểm TB đánh giá" value={avgScore} />
      </div>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Lịch sử đánh giá
        </h2>
        {evaluations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>
        ) : (
          <div className="space-y-3">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-border bg-bg-2 p-4"
              >
                <div className="flex justify-between">
                  <p className="font-mono text-accent-3">{ev.score}/5</p>
                </div>
                {ev.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {ev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
