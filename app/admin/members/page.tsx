"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    avatar_emoji: "🏸",
    role: "member" as "admin" | "member",
    level: "B",
  });
  const [editing, setEditing] = useState<User | null>(null);

  function openCreate() {
    setForm({ name: "", avatar_emoji: "🏸", role: "member", level: "B" });
    setOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      name: user.name,
      avatar_emoji: user.avatar_emoji ?? "🏸",
      role: user.role,
      level: user.level ?? "B",
    });
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
  }
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

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const { error } = await supabase
      .from("users")
      .update({
        name: form.name,
        avatar_emoji: form.avatar_emoji || null,
        role: form.role,
        level: form.level,
      })
      .eq("id", editing.id);

    if (error) {
      toast.error("Cập nhật thành viên thất bại");
      return;
    }

    toast.success("Đã cập nhật thành viên");
    closeEdit();
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
        <Button onClick={openCreate}>
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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <Button onClick={() => openEdit(m)} variant="outline" size="sm">
                      <Pencil className="size-4" />
                      Chỉnh sửa
                    </Button>
                  </TableCell>
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

      <Dialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeEdit();
          else setEditOpen(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-bg-2 p-3">
              <UserAvatar
                user={{
                  name: form.name || editing.name,
                  avatar_url: editing.avatar_url,
                  avatar_emoji: form.avatar_emoji,
                }}
                size="md"
              />
              <div>
                <p className="text-sm font-medium">{form.name || editing.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {form.role} · Level {form.level}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emoji">Avatar emoji</Label>
              <Input
                id="edit-emoji"
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
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C"].map((l) => (
                      <SelectItem key={l} value={l} label={l}>
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
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member" label="Member">
                      Member
                    </SelectItem>
                    <SelectItem value="admin" label="Admin">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeEdit}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
