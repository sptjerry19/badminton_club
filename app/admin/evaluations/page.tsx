"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Evaluation, User } from "@/types";

export default function AdminEvaluationsPage() {
  const { user } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [evaluations, setEvaluations] = useState<
    (Evaluation & { evaluated: User | null })[]
  >([]);
  const [form, setForm] = useState({
    evaluated_user_id: "",
    score: "4",
    comment: "",
    technique: "4",
    teamwork: "4",
    attitude: "4",
  });

  async function load() {
    const [usersRes, evalsRes] = await Promise.all([
      supabase.from("users").select("*").order("name"),
      supabase
        .from("evaluations")
        .select("*, evaluated:users!evaluations_evaluated_user_id_fkey(*)")
        .order("created_at", { ascending: false }),
    ]);
    setUsers(usersRes.data ?? []);
    setEvaluations(
      (evalsRes.data ?? []) as (Evaluation & { evaluated: User | null })[]
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("evaluations").insert({
      evaluator_id: user.id,
      evaluated_user_id: form.evaluated_user_id,
      score: Number(form.score),
      comment: form.comment || null,
      criteria: {
        technique: Number(form.technique),
        teamwork: Number(form.teamwork),
        attitude: Number(form.attitude),
      },
    });

    if (error) {
      toast.error("Lưu đánh giá thất bại");
      return;
    }
    toast.success("Đã lưu đánh giá");
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Đánh giá thành viên</h1>
        <p className="text-sm text-muted-foreground">
          Nhập điểm và tiêu chí cho từng thành viên
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-4 rounded-xl border border-border bg-bg-2 p-4"
      >
        <div className="space-y-2">
          <Label>Thành viên</Label>
          <Select
            value={form.evaluated_user_id}
            onValueChange={(v) =>
              setForm({ ...form, evaluated_user_id: v ?? "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn thành viên" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="score">Điểm tổng (1-5)</Label>
          <Input
            id="score"
            type="number"
            min={1}
            max={5}
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["technique", "teamwork", "attitude"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key}</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment">Nhận xét</Label>
          <Input
            id="comment"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>
        <Button type="submit">Lưu đánh giá</Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Lịch sử đánh giá
        </h2>
        {evaluations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>
        ) : (
          evaluations.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-border bg-bg-2 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{ev.evaluated?.name}</p>
                <p className="font-mono text-accent-3">{ev.score}/5</p>
              </div>
              {ev.comment && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {ev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
