"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Shuffle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MatchCard } from "@/components/tournament/match-card";
import { PlayerSelect } from "@/components/tournament/player-select";
import { StatusBadge } from "@/components/tournament/status-badge";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeMatches } from "@/hooks/use-realtime-matches";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  generateAutoSchedule,
  getAvailablePlayers,
  hasDuplicatePlayers,
  type MatchSlot,
} from "@/lib/tournament/auto-schedule";
import { supabase } from "@/lib/supabase/client";
import type {
  MatchWithPlayers,
  TeamRequest,
  Tournament,
  TournamentMember,
  TournamentStatus,
  User,
  Venue,
} from "@/types";

const TAB_VALUES = ["info", "members", "matches", "teams", "prizes"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const emptyMatchForm = {
  round: "Vòng 1",
  team1_player1_id: "",
  team1_player2_id: "",
  team2_player1_id: "",
  team2_player2_id: "",
  status: "scheduled" as "scheduled" | "ongoing" | "finished",
};

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab: TabValue = TAB_VALUES.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "info";

  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [tournament, setTournament] = useState<
    (Tournament & { venues: Venue | null }) | null
  >(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [members, setMembers] = useState<
    (TournamentMember & { users: User | null })[]
  >([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [teamRequests, setTeamRequests] = useState<
    (TeamRequest & { requester: User | null; partner: User | null })[]
  >([]);
  const [addUserId, setAddUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [editForm, setEditForm] = useState({
    name: "",
    venue_id: "",
    date: "",
    format: "doubles" as "singles" | "doubles" | "mixed",
    status: "upcoming" as TournamentStatus,
    prize_description: "",
    fee_per_person: "",
  });
  const [prizeEdit, setPrizeEdit] = useState("");

  const liveMatches = useRealtimeMatches(id, matches);
  const isDoubles =
    tournament?.format === "doubles" || tournament?.format === "mixed";
  const tournamentMemberUsers = members
    .filter((m) => m.users && m.status === "confirmed")
    .map((m) => m.users!);

  const load = useCallback(async () => {
    const [
      tournamentRes,
      membersRes,
      usersRes,
      matchesRes,
      requestsRes,
      venuesRes,
    ] = await Promise.all([
      supabase.from("tournaments").select("*, venues(*)").eq("id", id).single(),
      supabase
        .from("tournament_members")
        .select("*, users(*)")
        .eq("tournament_id", id),
      supabase.from("users").select("*").order("name"),
      supabase
        .from("matches")
        .select(
          "*, team1_player1:users!matches_team1_player1_id_fkey(*), team1_player2:users!matches_team1_player2_id_fkey(*), team2_player1:users!matches_team2_player1_id_fkey(*), team2_player2:users!matches_team2_player2_id_fkey(*)"
        )
        .eq("tournament_id", id)
        .order("played_at"),
      supabase
        .from("team_requests")
        .select(
          "*, requester:users!team_requests_requester_id_fkey(*), partner:users!team_requests_partner_id_fkey(*)"
        )
        .eq("tournament_id", id),
      supabase.from("venues").select("*").order("name"),
    ]);

    if (tournamentRes.data) {
      const t = tournamentRes.data as Tournament & { venues: Venue | null };
      setTournament(t);
      setEditForm({
        name: t.name,
        venue_id: t.venue_id ?? "",
        date: t.date ?? "",
        format: t.format ?? "doubles",
        status: t.status,
        prize_description: t.prize_description ?? "",
        fee_per_person: t.fee_per_person ? String(t.fee_per_person) : "",
      });
      setPrizeEdit(t.prize_description ?? "");
    }
    setMembers(
      (membersRes.data ?? []) as (TournamentMember & { users: User | null })[]
    );
    setAllUsers(usersRes.data ?? []);
    setMatches((matchesRes.data ?? []) as MatchWithPlayers[]);
    setTeamRequests(
      (requestsRes.data ?? []) as (TeamRequest & {
        requester: User | null;
        partner: User | null;
      })[]
    );
    setVenues(venuesRes.data ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tabParam && TAB_VALUES.includes(tabParam as TabValue)) {
      setActiveTab(tabParam as TabValue);
    }
  }, [tabParam]);

  async function saveTournament(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("tournaments")
      .update({
        name: editForm.name,
        venue_id: editForm.venue_id || null,
        date: editForm.date || null,
        format: editForm.format,
        status: editForm.status,
        prize_description: editForm.prize_description || null,
        fee_per_person: editForm.fee_per_person
          ? Number(editForm.fee_per_person)
          : null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Cập nhật giải thất bại");
      return;
    }
    toast.success("Đã cập nhật thông tin giải");
    setEditOpen(false);
    load();
  }

  async function savePrize() {
    const { error } = await supabase
      .from("tournaments")
      .update({ prize_description: prizeEdit || null })
      .eq("id", id);
    if (error) {
      toast.error("Lưu giải thưởng thất bại");
      return;
    }
    toast.success("Đã lưu mô tả giải thưởng");
    load();
  }

  async function addMember() {
    if (!addUserId) return;
    const { error } = await supabase.from("tournament_members").insert({
      tournament_id: id,
      user_id: addUserId,
      status: "confirmed",
    });
    if (error) {
      toast.error("Không thể thêm thành viên");
      return;
    }
    toast.success("Đã thêm thành viên");
    setAddUserId("");
    load();
  }

  async function updateMemberStatus(
    memberId: string,
    status: "confirmed" | "pending" | "withdrew"
  ) {
    const { error } = await supabase
      .from("tournament_members")
      .update({ status })
      .eq("id", memberId);
    if (error) {
      toast.error("Cập nhật trạng thái thất bại");
      return;
    }
    load();
  }

  async function removeMember(memberId: string) {
    const { error } = await supabase
      .from("tournament_members")
      .delete()
      .eq("id", memberId);
    if (error) {
      toast.error("Không thể xóa");
      return;
    }
    load();
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!matchForm.team1_player1_id || !matchForm.team2_player1_id) {
      toast.error("Chọn đủ cầu thủ cho 2 đội");
      return;
    }

    if (hasDuplicatePlayers(matchForm)) {
      toast.error("Mỗi cầu thủ chỉ được chọn một lần trong trận");
      return;
    }

    if (isDoubles) {
      if (!matchForm.team1_player2_id || !matchForm.team2_player2_id) {
        toast.error("Thể thức đôi cần 2 cầu thủ mỗi đội");
        return;
      }
    }

    const { error } = await supabase.from("matches").insert({
      tournament_id: id,
      round: matchForm.round,
      team1_player1_id: matchForm.team1_player1_id,
      team1_player2_id: isDoubles
        ? matchForm.team1_player2_id || null
        : null,
      team2_player1_id: matchForm.team2_player1_id,
      team2_player2_id: isDoubles
        ? matchForm.team2_player2_id || null
        : null,
      team1_score: 0,
      team2_score: 0,
      status: matchForm.status,
    });

    if (error) {
      toast.error("Tạo trận thất bại");
      return;
    }
    toast.success("Đã tạo trận đấu");
    setMatchOpen(false);
    setMatchForm(emptyMatchForm);
    load();
  }

  function openMatchDialog() {
    setMatchForm(emptyMatchForm);
    setMatchOpen(true);
  }

  async function autoScheduleMatches() {
    if (tournamentMemberUsers.length < 2) {
      toast.error("Cần ít nhất 2 thành viên đã xác nhận");
      return;
    }

    if (
      isDoubles &&
      tournamentMemberUsers.length >= 4 &&
      acceptedPairs.length === 0
    ) {
      toast.warning(
        "Giải đôi: nên duyệt cặp đôi trước — sẽ ghép từng người lẻ nếu chưa có partner"
      );
    }

    setAutoScheduling(true);

    const existingSlots: MatchSlot[] = matches.map((m) => ({
      team1_player1_id: m.team1_player1_id!,
      team1_player2_id: m.team1_player2_id,
      team2_player1_id: m.team2_player1_id!,
      team2_player2_id: m.team2_player2_id,
    }));

    const roundNumber =
      matches.filter((m) => m.round?.startsWith("Vòng")).length + 1;
    const roundLabel = `Vòng ${roundNumber}`;

    const { slots, skippedBye } = generateAutoSchedule({
      format: tournament?.format ?? "doubles",
      members: tournamentMemberUsers,
      acceptedPairs: acceptedPairs.map((p) => ({
        requester_id: p.requester_id,
        partner_id: p.partner_id,
      })),
      existingMatches: existingSlots,
      round: roundLabel,
      shuffle: true,
    });

    if (slots.length === 0) {
      toast.info("Không có cặp trận mới để tạo (có thể đã sắp hết hoặc trùng lịch)");
      setAutoScheduling(false);
      return;
    }

    const { error } = await supabase.from("matches").insert(
      slots.map((slot) => ({
        tournament_id: id,
        round: slot.round,
        team1_player1_id: slot.team1_player1_id,
        team1_player2_id: slot.team1_player2_id,
        team2_player1_id: slot.team2_player1_id,
        team2_player2_id: slot.team2_player2_id,
        team1_score: 0,
        team2_score: 0,
        status: "scheduled" as const,
      }))
    );

    setAutoScheduling(false);

    if (error) {
      toast.error("Sắp trận tự động thất bại");
      return;
    }

    const byeMsg =
      skippedBye > 0 ? ` · ${skippedBye} đội/người được bye` : "";
    toast.success(`Đã tạo ${slots.length} trận (${roundLabel})${byeMsg}`);
    load();
  }

  async function deleteMatch(matchId: string) {
    if (!confirm("Xóa trận đấu này?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", matchId);
    if (error) {
      toast.error("Xóa trận thất bại");
      return;
    }
    toast.success("Đã xóa trận");
    load();
  }

  async function updateMatchScore(
    matchId: string,
    team1_score: number,
    team2_score: number,
    status: "scheduled" | "ongoing" | "finished"
  ) {
    const { error } = await supabase
      .from("matches")
      .update({ team1_score, team2_score, status })
      .eq("id", matchId);
    if (error) {
      toast.error("Cập nhật điểm thất bại");
      return;
    }
    toast.success("Đã cập nhật kết quả");
    load();
  }

  async function handleTeamRequest(
    requestId: string,
    status: "accepted" | "rejected"
  ) {
    const { error } = await supabase
      .from("team_requests")
      .update({ status })
      .eq("id", requestId);
    if (error) {
      toast.error("Cập nhật yêu cầu thất bại");
      return;
    }
    toast.success(status === "accepted" ? "Đã chấp nhận" : "Đã từ chối");
    load();
  }

  const acceptedPairs = teamRequests.filter((r) => r.status === "accepted");
  const pendingRequests = teamRequests.filter((r) => r.status === "pending");
  const partneredIds = new Set<string>();
  acceptedPairs.forEach((r) => {
    partneredIds.add(r.requester_id);
    partneredIds.add(r.partner_id);
  });
  const soloMembers = tournamentMemberUsers.filter(
    (u) => !partneredIds.has(u.id)
  );

  if (loading) {
    return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  }

  if (!tournament) {
    return <p className="text-sm text-destructive">Không tìm thấy giải đấu</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{tournament.name}</h1>
            <StatusBadge type="tournament" status={tournament.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(tournament.date)}
            {tournament.venues?.name ? ` · ${tournament.venues.name}` : ""}
            {tournament.format ? ` · ${tournament.format}` : ""}
            {tournament.fee_per_person
              ? ` · ${formatCurrency(Number(tournament.fee_per_person))}/người`
              : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Sửa giải
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="matches">Trận đấu</TabsTrigger>
          <TabsTrigger value="teams">Đội hình</TabsTrigger>
          <TabsTrigger value="prizes">Giải thưởng</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 pt-4">
          <div className="grid gap-4 rounded-xl border border-border bg-bg-2 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tên giải
              </p>
              <p className="mt-1 font-medium">{tournament.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Sân
              </p>
              <p className="mt-1">{tournament.venues?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Ngày
              </p>
              <p className="mt-1">{formatDate(tournament.date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Thể thức
              </p>
              <p className="mt-1 capitalize">{tournament.format ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Phí tham dự
              </p>
              <p className="mt-1 font-mono">
                {tournament.fee_per_person
                  ? formatCurrency(Number(tournament.fee_per_person))
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Trạng thái
              </p>
              <p className="mt-1">
                <StatusBadge type="tournament" status={tournament.status} />
              </p>
            </div>
          </div>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Chỉnh sửa thông tin
          </Button>
        </TabsContent>

        <TabsContent value="members" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Select value={addUserId} onValueChange={(v) => setAddUserId(v ?? "")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn thành viên" />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter(
                    (u) => !members.some((m) => m.user_id === u.id)
                  )
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={addMember}>Thêm</Button>
          </div>
          <div className="space-y-2">
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chưa có thành viên — thêm trước khi tạo trận/ghép đôi.
              </p>
            )}
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg-2 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {m.users && <UserAvatar user={m.users} size="sm" />}
                  <span className="text-sm font-medium">{m.users?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={m.status}
                    onValueChange={(v) =>
                      updateMemberStatus(
                        m.id,
                        (v ?? "pending") as "confirmed" | "pending" | "withdrew"
                      )
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="withdrew">Đã rút</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(m.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {liveMatches.length} trận · thể thức{" "}
              {isDoubles ? "đôi/hỗn hợp" : "đơn"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={autoScheduleMatches}
                disabled={
                  tournamentMemberUsers.length < 2 || autoScheduling
                }
              >
                <Shuffle className="size-4" />
                {autoScheduling ? "Đang sắp..." : "Sắp trận tự động"}
              </Button>
              <Button
                onClick={openMatchDialog}
                disabled={tournamentMemberUsers.length < 2}
              >
                <Plus className="size-4" />
                Tạo trận thủ công
              </Button>
            </div>
          </div>

          {tournamentMemberUsers.length < 2 && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Cần ít nhất 2 thành viên đã xác nhận để tạo trận.
            </p>
          )}

          {liveMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có trận đấu.</p>
          ) : (
            liveMatches.map((match) => (
              <div key={match.id} className="space-y-3">
                <MatchCard match={match as MatchWithPlayers} />
                <div className="flex flex-wrap items-end gap-3 rounded-xl bg-bg-3 p-3">
                  <div className="space-y-1">
                    <Label>Điểm team 1</Label>
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={match.team1_score ?? 0}
                      id={`t1-${match.id}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Điểm team 2</Label>
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={match.team2_score ?? 0}
                      id={`t2-${match.id}`}
                    />
                  </div>
                  <Select
                    defaultValue={match.status}
                    onValueChange={(v) => {
                      const t1 = Number(
                        (
                          document.getElementById(
                            `t1-${match.id}`
                          ) as HTMLInputElement
                        ).value
                      );
                      const t2 = Number(
                        (
                          document.getElementById(
                            `t2-${match.id}`
                          ) as HTMLInputElement
                        ).value
                      );
                      updateMatchScore(
                        match.id,
                        t1,
                        t2,
                        (v ?? "scheduled") as "scheduled" | "ongoing" | "finished"
                      );
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Chưa đấu</SelectItem>
                      <SelectItem value="ongoing">Đang đấu</SelectItem>
                      <SelectItem value="finished">Kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => {
                      const t1 = Number(
                        (
                          document.getElementById(
                            `t1-${match.id}`
                          ) as HTMLInputElement
                        ).value
                      );
                      const t2 = Number(
                        (
                          document.getElementById(
                            `t2-${match.id}`
                          ) as HTMLInputElement
                        ).value
                      );
                      updateMatchScore(match.id, t1, t2, "finished");
                    }}
                  >
                    Lưu kết quả
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMatch(match.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-6 pt-4">
          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Cặp đôi đã ghép
            </h3>
            {acceptedPairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có cặp đôi nào được chấp nhận.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {acceptedPairs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl bg-bg-2 px-4 py-3"
                  >
                    {r.requester && <UserAvatar user={r.requester} size="sm" />}
                    <span className="text-sm font-medium">
                      {r.requester?.name}
                    </span>
                    <span className="text-muted-foreground">+</span>
                    {r.partner && <UserAvatar user={r.partner} size="sm" />}
                    <span className="text-sm font-medium">{r.partner?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Chưa có partner ({soloMembers.length})
            </h3>
            {soloMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tất cả thành viên đã có partner.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {soloMembers.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-2 rounded-full bg-bg-3 px-3 py-1.5 text-sm"
                  >
                    <UserAvatar user={u} size="sm" />
                    {u.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Yêu cầu ghép đôi chờ duyệt
            </h3>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Không có yêu cầu pending. Thành viên có thể gửi lời mời tại{" "}
                <Link
                  href={`/app/tournaments/${id}/team`}
                  className="text-primary underline"
                >
                  trang ghép đôi (member)
                </Link>
                .
              </p>
            ) : (
              pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-bg-2 px-4 py-3"
                >
                  <p className="text-sm">
                    <span className="font-medium">{r.requester?.name}</span>
                    {" → "}
                    <span className="font-medium">{r.partner?.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTeamRequest(r.id, "accepted")}
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTeamRequest(r.id, "rejected")}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))
            )}
          </section>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="prize">Mô tả giải thưởng</Label>
            <Input
              id="prize"
              value={prizeEdit}
              onChange={(e) => setPrizeEdit(e.target.value)}
              placeholder="VD: Cúp vàng + 500k tiền mặt"
            />
          </div>
          <Button onClick={savePrize}>Lưu giải thưởng</Button>
        </TabsContent>
      </Tabs>

      {/* Edit tournament dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giải đấu</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveTournament} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên giải</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Sân</Label>
              <Select
                value={editForm.venue_id}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, venue_id: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sân" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Ngày</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm({
                      ...editForm,
                      status: (v ?? "upcoming") as TournamentStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                    <SelectItem value="finished">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thể thức</Label>
                <Select
                  value={editForm.format}
                  onValueChange={(v) =>
                    setEditForm({
                      ...editForm,
                      format: (v ?? "doubles") as typeof editForm.format,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles">Đơn</SelectItem>
                    <SelectItem value="doubles">Đôi</SelectItem>
                    <SelectItem value="mixed">Hỗn hợp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fee">Phí (VND)</Label>
                <Input
                  id="edit-fee"
                  type="number"
                  value={editForm.fee_per_person}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fee_per_person: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prize">Giải thưởng</Label>
              <Input
                id="edit-prize"
                value={editForm.prize_description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    prize_description: e.target.value,
                  })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Lưu thay đổi
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create match dialog */}
      <Dialog
        open={matchOpen}
        onOpenChange={(open) => {
          setMatchOpen(open);
          if (!open) setMatchForm(emptyMatchForm);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo trận đấu mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={createMatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="round">Vòng</Label>
              <Input
                id="round"
                value={matchForm.round}
                onChange={(e) =>
                  setMatchForm({ ...matchForm, round: e.target.value })
                }
                placeholder="Vòng 1, Bán kết, Chung kết..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PlayerSelect
                label="Team 1 — Cầu thủ 1"
                value={matchForm.team1_player1_id}
                onChange={(v) =>
                  setMatchForm({ ...matchForm, team1_player1_id: v })
                }
                players={getAvailablePlayers(
                  tournamentMemberUsers,
                  matchForm,
                  "team1_player1_id"
                )}
              />
              {isDoubles && (
                <PlayerSelect
                  label="Team 1 — Cầu thủ 2"
                  value={matchForm.team1_player2_id}
                  onChange={(v) =>
                    setMatchForm({ ...matchForm, team1_player2_id: v })
                  }
                  players={getAvailablePlayers(
                    tournamentMemberUsers,
                    matchForm,
                    "team1_player2_id"
                  )}
                />
              )}
              <PlayerSelect
                label="Team 2 — Cầu thủ 1"
                value={matchForm.team2_player1_id}
                onChange={(v) =>
                  setMatchForm({ ...matchForm, team2_player1_id: v })
                }
                players={getAvailablePlayers(
                  tournamentMemberUsers,
                  matchForm,
                  "team2_player1_id"
                )}
              />
              {isDoubles && (
                <PlayerSelect
                  label="Team 2 — Cầu thủ 2"
                  value={matchForm.team2_player2_id}
                  onChange={(v) =>
                    setMatchForm({ ...matchForm, team2_player2_id: v })
                  }
                  players={getAvailablePlayers(
                    tournamentMemberUsers,
                    matchForm,
                    "team2_player2_id"
                  )}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={matchForm.status}
                onValueChange={(v) =>
                  setMatchForm({
                    ...matchForm,
                    status: (v ?? "scheduled") as typeof matchForm.status,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Chưa đấu</SelectItem>
                  <SelectItem value="ongoing">Đang đấu</SelectItem>
                  <SelectItem value="finished">Kết thúc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Tạo trận
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
