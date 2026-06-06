import { StatusBadge } from "@/components/tournament/status-badge";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { cn } from "@/lib/utils";
import type { MatchStatus, MatchWithPlayers } from "@/types";

interface MatchCardProps {
  match: MatchWithPlayers;
  className?: string;
}

function playerName(
  player: MatchWithPlayers["team1_player1"] | undefined | null
) {
  return player?.name ?? "—";
}

function ScoreBox({
  score,
  won,
}: {
  score: number | null;
  won: boolean;
}) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-lg font-mono text-sm font-semibold",
        won
          ? "bg-success/12 text-success"
          : "bg-white/5 text-muted-foreground"
      )}
    >
      {score ?? 0}
    </div>
  );
}

export function MatchCard({ match, className }: MatchCardProps) {
  const team1Won = (match.team1_score ?? 0) > (match.team2_score ?? 0);
  const team2Won = (match.team2_score ?? 0) > (match.team1_score ?? 0);
  const isScheduled = match.status === "scheduled";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-2 p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {match.round ?? "Trận đấu"}
        </span>
        <StatusBadge type="match" status={match.status as MatchStatus} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <UserAvatar
              user={match.team1_player1 ?? { name: "?", avatar_url: null, avatar_emoji: "?" }}
              size="sm"
            />
            <span className="text-sm">{playerName(match.team1_player1)}</span>
          </div>
          {match.team1_player2 && (
            <div className="flex items-center gap-2 pl-1">
              <UserAvatar user={match.team1_player2} size="sm" />
              <span className="text-sm text-muted-foreground">
                {playerName(match.team1_player2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isScheduled ? (
            <div className="rounded-lg bg-white/6 px-2 py-1 text-[11px] text-muted-foreground">
              VS
            </div>
          ) : (
            <>
              <ScoreBox score={match.team1_score} won={team1Won} />
              <span className="text-muted-foreground">:</span>
              <ScoreBox score={match.team2_score} won={team2Won} />
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{playerName(match.team2_player1)}</span>
            <UserAvatar
              user={match.team2_player1 ?? { name: "?", avatar_url: null, avatar_emoji: "?" }}
              size="sm"
            />
          </div>
          {match.team2_player2 && (
            <div className="flex items-center gap-2 pr-1">
              <span className="text-sm text-muted-foreground">
                {playerName(match.team2_player2)}
              </span>
              <UserAvatar user={match.team2_player2} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
