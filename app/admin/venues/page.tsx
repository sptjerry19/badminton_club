"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { Venue } from "@/types";

const emptyForm = {
  name: "",
  address: "",
  courts_count: "",
  price_per_hour: "",
  notes: "",
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Không thể tải danh sách sân");
      return;
    }
    setVenues(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadVenues();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(venue: Venue) {
    setEditing(venue);
    setForm({
      name: venue.name,
      address: venue.address ?? "",
      courts_count: String(venue.courts_count ?? ""),
      price_per_hour: String(venue.price_per_hour ?? ""),
      notes: venue.notes ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      address: form.address || null,
      courts_count: form.courts_count ? Number(form.courts_count) : null,
      price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase
        .from("venues")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error("Cập nhật thất bại");
        return;
      }
      toast.success("Đã cập nhật sân");
    } else {
      const { error } = await supabase.from("venues").insert(payload);
      if (error) {
        toast.error("Thêm sân thất bại");
        return;
      }
      toast.success("Đã thêm sân mới");
    }

    setOpen(false);
    loadVenues();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa sân này?")) return;
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) {
      toast.error("Không thể xóa sân");
      return;
    }
    toast.success("Đã xóa sân");
    loadVenues();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý sân</h1>
          <p className="text-sm text-muted-foreground">
            CRUD sân thi đấu
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm sân
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Chỉnh sửa sân" : "Thêm sân mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sân</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courts">Số sân con</Label>
                  <Input
                    id="courts"
                    type="number"
                    value={form.courts_count}
                    onChange={(e) =>
                      setForm({ ...form, courts_count: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Giá/giờ (VND)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price_per_hour}
                    onChange={(e) =>
                      setForm({ ...form, price_per_hour: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Lưu thay đổi" : "Thêm sân"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : venues.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có sân nào.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Số sân</TableHead>
                <TableHead>Giá/giờ</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell>{venue.address ?? "—"}</TableCell>
                  <TableCell>{venue.courts_count ?? "—"}</TableCell>
                  <TableCell className="font-mono">
                    {venue.price_per_hour
                      ? formatCurrency(Number(venue.price_per_hour))
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(venue)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(venue.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
