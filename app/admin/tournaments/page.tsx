"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/tournament/status-badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Tournament, TournamentStatus, Venue } from "@/types";

const statuses: (TournamentStatus | "all")[] = [
  "all",
  "upcoming",
  "ongoing",
  "finished",
];

export default function AdminTournamentsPage() {
  const { user } = useSession();
  const [tournaments, setTournaments] = useState<
    (Tournament & { venues: Venue | null })[]
  >([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<TournamentStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    venue_id: "",
    date: "",
    format: "doubles" as "singles" | "doubles" | "mixed",
    prize_description: "",
    fee_per_person: "",
  });

  const load = useCallback(async () => {
    let query = supabase
      .from("tournaments")
      .select("*, venues(*)")
      .order("date", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const [{ data, error }, venuesRes] = await Promise.all([
      query,
      supabase.from("venues").select("*").order("name"),
    ]);

    if (error) toast.error("Không thể tải giải đấu");
    else setTournaments((data ?? []) as (Tournament & { venues: Venue | null })[]);
    setVenues(venuesRes.data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("tournaments").insert({
      name: form.name,
      venue_id: form.venue_id || null,
      date: form.date || null,
      format: form.format,
      prize_description: form.prize_description || null,
      fee_per_person: form.fee_per_person ? Number(form.fee_per_person) : null,
      created_by: user.id,
      status: "upcoming",
    });

    if (error) {
      toast.error("Tạo giải thất bại");
      return;
    }

    toast.success("Đã tạo giải đấu");
    setOpen(false);
    setForm({
      name: "",
      venue_id: "",
      date: "",
      format: "doubles",
      prize_description: "",
      fee_per_person: "",
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Giải đấu</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và tạo giải đấu mới
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Tạo giải
        </Button>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as TournamentStatus | "all")}
      >
        <TabsList>
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s === "all"
                ? "Tất cả"
                : s === "upcoming"
                  ? "Sắp diễn ra"
                  : s === "ongoing"
                    ? "Đang diễn ra"
                    : "Đã kết thúc"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên giải</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Sân</TableHead>
                <TableHead>Phí</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((t) => (
                <TableRow key={t.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <Link
                      href={`/admin/tournaments/${t.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell>{t.venues?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono">
                    {t.fee_per_person
                      ? formatCurrency(Number(t.fee_per_person))
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="tournament" status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo giải đấu mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-name">Tên giải</Label>
              <Input
                id="t-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Sân</Label>
              <Select
                value={form.venue_id}
                onValueChange={(v) => setForm({ ...form, venue_id: v ?? "" })}
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
                <Label htmlFor="t-date">Ngày</Label>
                <Input
                  id="t-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thể thức</Label>
                <Select
                  value={form.format}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      format: (v ?? "doubles") as typeof form.format,
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-prize">Giải thưởng</Label>
              <Input
                id="t-prize"
                value={form.prize_description}
                onChange={(e) =>
                  setForm({ ...form, prize_description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-fee">Phí tham dự (VND)</Label>
              <Input
                id="t-fee"
                type="number"
                value={form.fee_per_person}
                onChange={(e) =>
                  setForm({ ...form, fee_per_person: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Tạo giải
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
