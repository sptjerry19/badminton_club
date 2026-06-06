"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    avatar_emoji: "🏸",
    role: "member" as "admin" | "member",
    level: "B",
  });

  async function load() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name");

    if (error) toast.error("Không thể tải thành viên");
    else setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("users").insert(form);
    if (error) {
      toast.error("Thêm thành viên thất bại");
      return;
    }
    toast.success("Đã thêm thành viên");
    setOpen(false);
    setForm({ name: "", avatar_emoji: "🏸", role: "member", level: "B" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Thành viên</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý avatar và role
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Thêm thành viên
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <UserAvatar user={m} size="sm" />
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.level ?? "—"}</TableCell>
                  <TableCell className="capitalize">{m.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-name">Tên</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-emoji">Avatar emoji</Label>
              <Input
                id="m-emoji"
                value={form.avatar_emoji}
                onChange={(e) =>
                  setForm({ ...form, avatar_emoji: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) =>
                    setForm({ ...form, level: v ?? "B" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      role: (v ?? "member") as typeof form.role,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Thêm
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
