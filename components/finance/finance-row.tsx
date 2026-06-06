import { StatusBadge } from "@/components/tournament/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentStatus, PaymentWithTournament } from "@/types";

interface FinanceRowProps {
  payment: PaymentWithTournament;
  readOnly?: boolean;
  onRecordPayment?: () => void;
  className?: string;
}

export function FinanceRow({
  payment,
  readOnly = false,
  onRecordPayment,
  className,
}: FinanceRowProps) {
  const remaining = Number(payment.amount) - Number(payment.paid_amount);

  return (
    <div
      className={cn(
        "group flex flex-wrap items-center gap-3 rounded-[10px] bg-bg-2 px-3.5 py-3 transition-colors hover:bg-bg-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{payment.description ?? "Khoản phí"}</p>
        <p className="text-xs text-muted-foreground">
          {payment.tournaments?.name ?? "Phí độc lập"}
          {payment.due_date ? ` · Hạn ${formatDate(payment.due_date)}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-destructive">
          {formatCurrency(Number(payment.amount))}
        </p>
        <p className="font-mono text-xs text-success">
          Đã trả {formatCurrency(Number(payment.paid_amount))}
        </p>
      </div>
      <StatusBadge
        type="payment"
        status={payment.status as PaymentStatus}
      />
      {!readOnly && remaining > 0 && onRecordPayment && (
        <button
          type="button"
          onClick={onRecordPayment}
          className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-accent-3 opacity-0 transition-opacity group-hover:opacity-100"
        >
          Ghi nhận thanh toán
        </button>
      )}
    </div>
  );
}
