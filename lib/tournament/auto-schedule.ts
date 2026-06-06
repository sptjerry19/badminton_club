import type { User } from "@/types";

export type MatchSlot = {
  team1_player1_id: string;
  team1_player2_id: string | null;
  team2_player1_id: string;
  team2_player2_id: string | null;
};

type TeamUnit = {
  player1Id: string;
  player2Id: string | null;
};

function teamKey(team: TeamUnit): string {
  return [team.player1Id, team.player2Id].filter(Boolean).sort().join(",");
}

function matchKey(slot: MatchSlot): string {
  const team1 = teamKey({
    player1Id: slot.team1_player1_id,
    player2Id: slot.team1_player2_id,
  });
  const team2 = teamKey({
    player1Id: slot.team2_player1_id,
    player2Id: slot.team2_player2_id,
  });
  return [team1, team2].sort().join("|");
}

function buildDoublesTeams(
  members: User[],
  acceptedPairs: { requester_id: string; partner_id: string }[]
): TeamUnit[] {
  const used = new Set<string>();
  const teams: TeamUnit[] = [];

  for (const pair of acceptedPairs) {
    if (used.has(pair.requester_id) || used.has(pair.partner_id)) continue;
    used.add(pair.requester_id);
    used.add(pair.partner_id);
    teams.push({
      player1Id: pair.requester_id,
      player2Id: pair.partner_id,
    });
  }

  for (const member of members) {
    if (!used.has(member.id)) {
      used.add(member.id);
      teams.push({ player1Id: member.id, player2Id: null });
    }
  }

  return teams;
}

function buildSinglesTeams(members: User[]): TeamUnit[] {
  return members.map((m) => ({ player1Id: m.id, player2Id: null }));
}

function pairTeams(teams: TeamUnit[]): MatchSlot[] {
  const slots: MatchSlot[] = [];

  for (let i = 0; i + 1 < teams.length; i += 2) {
    const t1 = teams[i];
    const t2 = teams[i + 1];
    slots.push({
      team1_player1_id: t1.player1Id,
      team1_player2_id: t1.player2Id,
      team2_player1_id: t2.player1Id,
      team2_player2_id: t2.player2Id,
    });
  }

  return slots;
}

export function generateAutoSchedule(input: {
  format: "singles" | "doubles" | "mixed";
  members: User[];
  acceptedPairs: { requester_id: string; partner_id: string }[];
  existingMatches: MatchSlot[];
  round?: string;
  shuffle?: boolean;
}): { slots: (MatchSlot & { round: string })[]; skippedBye: number } {
  const {
    format,
    members,
    acceptedPairs,
    existingMatches,
    round = "Vòng 1",
    shuffle = true,
  } = input;

  let teams =
    format === "singles"
      ? buildSinglesTeams(members)
      : buildDoublesTeams(members, acceptedPairs);

  if (shuffle) {
    teams = [...teams].sort(() => Math.random() - 0.5);
  }

  const skippedBye = teams.length % 2;
  const proposed = pairTeams(teams);

  const existingKeys = new Set(existingMatches.map(matchKey));
  const slots = proposed
    .filter((slot) => !existingKeys.has(matchKey(slot)))
    .map((slot) => ({ ...slot, round }));

  return { slots, skippedBye };
}

export function getSelectedPlayerIds(form: {
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
}): string[] {
  return [
    form.team1_player1_id,
    form.team1_player2_id,
    form.team2_player1_id,
    form.team2_player2_id,
  ].filter(Boolean);
}

export function getAvailablePlayers(
  allPlayers: User[],
  form: {
    team1_player1_id: string;
    team1_player2_id: string;
    team2_player1_id: string;
    team2_player2_id: string;
  },
  field: keyof typeof form
): User[] {
  const reserved = new Set(
    getSelectedPlayerIds(form).filter((id) => id !== form[field])
  );
  return allPlayers.filter((u) => !reserved.has(u.id));
}

export function hasDuplicatePlayers(form: {
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
}): boolean {
  const ids = getSelectedPlayerIds(form);
  return new Set(ids).size !== ids.length;
}
