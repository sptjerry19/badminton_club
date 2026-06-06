"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, DollarSign, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { Tournament } from "@/types";

export default function AdminDashboardPage() {
  const [memberCount, setMemberCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [tournaments, setTournaments] = useState<
    (Tournament & { venues: { name: string } | null })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [membersRes, ongoingRes, paymentsRes, tournamentsRes] =
        await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase
            .from("tournaments")
            .select("id", { count: "exact", head: true })
            .eq("status", "ongoing"),
          supabase.from("payments").select("amount, paid_amount, status"),
          supabase
            .from("tournaments")
            .select("*, venues(name)")
            .order("date", { ascending: false })
            .limit(5),
        ]);

      setMemberCount(membersRes.count ?? 0);
      setOngoingCount(ongoingRes.count ?? 0);

      const debt = (paymentsRes.data ?? []).reduce((sum, p) => {
        if (p.status === "paid") return sum;
        return sum + (Number(p.amount) - Number(p.paid_amount));
      }, 0);
      setTotalDebt(debt);

      setTournaments(
        (tournamentsRes.data ?? []) as (Tournament & {
          venues: { name: string } | null;
        })[]
      );
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan câu lạc bộ cầu lông
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Thành viên" value={memberCount} icon={Users} />
        <StatCard
          label="Giải đang diễn ra"
          value={ongoingCount}
          icon={Activity}
        />
        <StatCard
          label="Tổng nợ chưa trả"
          value={formatCurrency(totalDebt)}
          icon={DollarSign}
          variant={totalDebt > 0 ? "danger" : "default"}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/tournaments" className={buttonVariants()}>
          Tạo giải đấu
        </Link>
        <Link
          href="/admin/members"
          className={buttonVariants({ variant: "outline" })}
        >
          Thêm thành viên
        </Link>
        <Link
          href="/admin/finance"
          className={buttonVariants({ variant: "outline" })}
        >
          Quản lý tài chính
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Giải đấu gần nhất
        </h2>
        {tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có giải đấu nào.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                href={`/admin/tournaments/${t.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
