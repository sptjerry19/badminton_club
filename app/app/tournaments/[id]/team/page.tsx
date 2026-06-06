"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/avatar/user-avatar";
import { Button } from "@/components/ui/button";
import { useRealtimeTeamRequests } from "@/hooks/use-realtime-team-requests";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { TeamRequest, TournamentMember, User } from "@/types";

export default function TeamPairingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [members, setMembers] = useState<
    (TournamentMember & { users: User | null; hasPartner?: boolean })[]
  >([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [usersById, setUsersById] = useState<Record<string, User>>({});

  const liveRequests = useRealtimeTeamRequests(id, user?.id ?? null, requests);

  useEffect(() => {
    async function load() {
      const [membersRes, requestsRes, acceptedRes] = await Promise.all([
        supabase
          .from("tournament_members")
          .select("*, users(*)")
          .eq("tournament_id", id)
          .eq("status", "confirmed"),
        supabase.from("team_requests").select("*").eq("tournament_id", id),
        supabase
          .from("team_requests")
          .select("requester_id, partner_id")
          .eq("tournament_id", id)
          .eq("status", "accepted"),
      ]);

      const acceptedIds = new Set<string>();
      (acceptedRes.data ?? []).forEach((r) => {
        acceptedIds.add(r.requester_id);
        acceptedIds.add(r.partner_id);
      });

      const memberList = ((membersRes.data ?? []) as (TournamentMember & {
        users: User | null;
      })[]).map((m) => ({
        ...m,
        hasPartner: m.users ? acceptedIds.has(m.users.id) : false,
      }));

      setMembers(memberList);
      setRequests(requestsRes.data ?? []);

      const map: Record<string, User> = {};
      memberList.forEach((m) => {
        if (m.users) map[m.users.id] = m.users;
      });
      setUsersById(map);
    }

    load();
  }, [id]);

  async function sendInvite(partnerId: string) {
    if (!user) return;
    const { error } = await supabase.from("team_requests").insert({
      tournament_id: id,
      requester_id: user.id,
      partner_id: partnerId,
      status: "pending",
    });
    if (error) {
      toast.error("Gửi lời mời thất bại");
      return;
    }
    toast.success("Đã gửi lời mời partner");
  }

  async function respondRequest(
    requestId: string,
    status: "accepted" | "rejected"
  ) {
    const { error } = await supabase
      .from("team_requests")
      .update({ status })
      .eq("id", requestId);
    if (error) {
      toast.error("Cập nhật thất bại");
      return;
    }
    toast.success(status === "accepted" ? "Đã chấp nhận!" : "Đã từ chối");
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  }

  const pendingInvites = liveRequests.filter(
    (r) => r.status === "pending" && r.partner_id === user?.id
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ghép đôi</h1>
        <p className="text-sm text-muted-foreground">
          Mời partner hoặc phản hồi lời mời
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Lời mời đang chờ
          </h2>
          {pendingInvites.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl bg-bg-2 px-4 py-3"
            >
              <p className="text-sm">
                <span className="font-medium">
                  {usersById[r.requester_id]?.name ?? "Ai đó"}
                </span>{" "}
                mời bạn làm partner
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respondRequest(r.id, "accepted")}>
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respondRequest(r.id, "rejected")}
                >
                  Từ chối
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Thành viên tham dự
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {members
            .filter((m) => m.users?.id !== user?.id)
            .map((m) => (
              <div
                key={m.id}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-2 p-4"
              >
                {m.users && <UserAvatar user={m.users} size="md" />}
                <div className="text-center">
                  <p className="text-sm font-medium">{m.users?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.hasPartner ? "Đã có partner" : "Còn trống"}
                  </p>
                </div>
                {!m.hasPartner && (
                  <Button size="sm" onClick={() => sendInvite(m.users!.id)}>
                    Mời partner
                  </Button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
