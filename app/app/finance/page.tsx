"use client";

import { useEffect, useState } from "react";

import { FinanceRow } from "@/components/finance/finance-row";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { PaymentWithTournament } from "@/types";

export default function UserFinancePage() {
  const { user } = useSession();
  const [payments, setPayments] = useState<PaymentWithTournament[]>([]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("payments")
      .select("*, tournaments(id, name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data ?? []) as PaymentWithTournament[]));
  }, [user]);

  const totals = payments.reduce(
    (acc, p) => ({
      amount: acc.amount + Number(p.amount),
      paid: acc.paid + Number(p.paid_amount),
    }),
    { amount: 0, paid: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Tài chính cá nhân</h1>
        <p className="text-sm text-muted-foreground">Chỉ xem — không chỉnh sửa</p>
      </div>

      <FinanceSummary totalAmount={totals.amount} totalPaid={totals.paid} />

      <section className="space-y-2">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có khoản phí nào.</p>
        ) : (
          payments.map((p) => <FinanceRow key={p.id} payment={p} readOnly />)
        )}
      </section>
    </div>
  );
}
