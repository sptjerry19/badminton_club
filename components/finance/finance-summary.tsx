import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FinanceSummaryProps {
  totalAmount: number;
  totalPaid: number;
  className?: string;
}

export function FinanceSummary({
  totalAmount,
  totalPaid,
  className,
}: FinanceSummaryProps) {
  const remaining = totalAmount - totalPaid;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Tổng phát sinh
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Đã trả
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold text-success">
          {formatCurrency(totalPaid)}
        </p>
      </div>
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Còn nợ
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold text-destructive">
          {formatCurrency(remaining)}
        </p>
      </div>
    </div>
  );
}
