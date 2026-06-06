import type { Enums, Tables } from "./database";

export type User = Tables<"users">;
export type Venue = Tables<"venues">;
export type Tournament = Tables<"tournaments">;
export type TournamentMember = Tables<"tournament_members">;
export type Match = Tables<"matches">;
export type TeamRequest = Tables<"team_requests">;
export type Evaluation = Tables<"evaluations">;
export type Payment = Tables<"payments">;

export type UserRole = Enums<"user_role">;
export type TournamentStatus = Enums<"tournament_status">;
export type TournamentFormat = Enums<"tournament_format">;
export type MemberStatus = Enums<"member_status">;
export type MatchStatus = Enums<"match_status">;
export type RequestStatus = Enums<"request_status">;
export type PaymentStatus = Enums<"payment_status">;

export interface SessionUser {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  role: UserRole;
  level: string | null;
}

export interface UserWithStats extends User {
  tournament_count?: number;
  debt?: number;
}

export interface TournamentWithVenue extends Tournament {
  venues?: Venue | null;
}

export interface MatchWithPlayers extends Match {
  team1_player1?: User | null;
  team1_player2?: User | null;
  team2_player1?: User | null;
  team2_player2?: User | null;
}

export interface PaymentWithTournament extends Payment {
  tournaments?: Pick<Tournament, "id" | "name"> | null;
}
