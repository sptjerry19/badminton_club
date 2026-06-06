"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { FinanceRow } from "@/components/finance/finance-row";
import { FinanceSummary } from "@/components/finance/finance-summary";
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
import { computePaymentStatus, formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { PaymentWithTournament, User } from "@/types";

export default function AdminFinancePage() {
  const [payments, setPayments] = useState<PaymentWithTournament[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<
    { user: User; total: number; paid: number; debt: number }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    amount: "",
    description: "",
    due_date: "",
  });

  async function load() {
    const [paymentsRes, usersRes] = await Promise.all([
      supabase
        .from("payments")
        .select("*, tournaments(id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("users").select("*").order("name"),
    ]);

    const paymentList = (paymentsRes.data ?? []) as PaymentWithTournament[];
    const userList = usersRes.data ?? [];
    setPayments(paymentList);
    setUsers(userList);

    const grouped = userList.map((user) => {
      const userPayments = paymentList.filter((p) => p.user_id === user.id);
      const total = userPayments.reduce((s, p) => s + Number(p.amount), 0);
      const paid = userPayments.reduce((s, p) => s + Number(p.paid_amount), 0);
      return { user, total, paid, debt: total - paid };
    });
    setSummary(grouped.filter((g) => g.total > 0));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    const { error } = await supabase.from("payments").insert({
      user_id: form.user_id,
      amount,
      paid_amount: 0,
      description: form.description || null,
      due_date: form.due_date || null,
      status: "unpaid",
    });
    if (error) {
      toast.error("Tạo khoản phí thất bại");
      return;
    }
    toast.success("Đã tạo khoản phí");
    setOpen(false);
    load();
  }

  async function recordPayment(paymentId: string) {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const addPaid = Number(payAmount);
    const newPaid = Number(payment.paid_amount) + addPaid;
    const status = computePaymentStatus(Number(payment.amount), newPaid);

    const { error } = await supabase
      .from("payments")
      .update({ paid_amount: newPaid, status })
      .eq("id", paymentId);

    if (error) {
      toast.error("Ghi nhận thất bại");
      return;
    }
    toast.success("Đã ghi nhận thanh toán");
    setPayOpen(null);
    setPayAmount("");
    load();
  }

  const totals = payments.reduce(
    (acc, p) => ({
      amount: acc.amount + Number(p.amount),
      paid: acc.paid + Number(p.paid_amount),
    }),
    { amount: 0, paid: 0 }
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý tài chính</h1>
          <p className="text-sm text-muted-foreground">
            Công nợ và thanh toán thành viên
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Tạo khoản phí
        </Button>
      </div>

      <FinanceSummary
        totalAmount={totals.amount}
        totalPaid={totals.paid}
      />

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Tổng hợp theo thành viên
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Phát sinh</TableHead>
                <TableHead>Đã trả</TableHead>
                <TableHead>Còn nợ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((row) => (
                <TableRow key={row.user.id}>
                  <TableCell className="font-medium">{row.user.name}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(row.total)}
                  </TableCell>
                  <TableCell className="font-mono text-success">
                    {formatCurrency(row.paid)}
                  </TableCell>
                  <TableCell className="font-mono text-destructive">
                    {formatCurrency(row.debt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Chi tiết khoản phí
        </h2>
        {payments.map((p) => (
          <FinanceRow
            key={p.id}
            payment={p}
            onRecordPayment={() => setPayOpen(p.id)}
          />
        ))}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo khoản phí mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Thành viên</Label>
              <Select
                value={form.user_id}
                onValueChange={(v) => setForm({ ...form, user_id: v ?? "" })}
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
              <Label htmlFor="amount">Số tiền (VND)</Label>
              <Input
                id="amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Input
                id="desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Hạn thanh toán</Label>
              <Input
                id="due"
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Tạo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!payOpen} onOpenChange={() => setPayOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Số tiền đã trả</Label>
              <Input
                id="pay-amount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => payOpen && recordPayment(payOpen)}
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
