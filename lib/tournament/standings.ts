import type { MatchWithPlayers, User } from "@/types";

export interface PlayerStanding {
  user: User;
  rank: number;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  goalDifference: number;
}

function getTeamPlayerIds(match: MatchWithPlayers): {
  team1: string[];
  team2: string[];
} {
  const team1 = [match.team1_player1_id, match.team1_player2_id].filter(
    (id): id is string => Boolean(id)
  );
  const team2 = [match.team2_player1_id, match.team2_player2_id].filter(
    (id): id is string => Boolean(id)
  );
  return { team1, team2 };
}

export function computeStandings(
  members: User[],
  matches: MatchWithPlayers[]
): PlayerStanding[] {
  const stats = new Map<
    string,
    {
      points: number;
      wins: number;
      losses: number;
      matchesPlayed: number;
      goalDifference: number;
    }
  >();

  for (const member of members) {
    stats.set(member.id, {
      points: 0,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      goalDifference: 0,
    });
  }

  const finishedMatches = matches.filter((m) => m.status === "finished");

  for (const match of finishedMatches) {
    const t1 = match.team1_score ?? 0;
    const t2 = match.team2_score ?? 0;
    const { team1, team2 } = getTeamPlayerIds(match);
    const margin = t1 - t2;
    const team1Won = t1 > t2;
    const team2Won = t2 > t1;

    for (const playerId of team1) {
      if (!stats.has(playerId)) continue;
      const s = stats.get(playerId)!;
      s.matchesPlayed += 1;
      s.goalDifference += margin;
      if (team1Won) {
        s.points += 1;
        s.wins += 1;
      } else if (team2Won) {
        s.losses += 1;
      }
    }

    for (const playerId of team2) {
      if (!stats.has(playerId)) continue;
      const s = stats.get(playerId)!;
      s.matchesPlayed += 1;
      s.goalDifference += -margin;
      if (team2Won) {
        s.points += 1;
        s.wins += 1;
      } else if (team1Won) {
        s.losses += 1;
      }
    }
  }

  const sorted = members
    .map((user) => {
      const s = stats.get(user.id)!;
      return { user, ...s };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return a.user.name.localeCompare(b.user.name, "vi");
    });

  let rank = 0;
  return sorted.map((entry, index) => {
    if (
      index === 0 ||
      entry.points !== sorted[index - 1].points ||
      entry.goalDifference !== sorted[index - 1].goalDifference
    ) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });
}
