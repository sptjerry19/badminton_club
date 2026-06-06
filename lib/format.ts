export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function computePaymentStatus(
  amount: number,
  paidAmount: number
): "unpaid" | "partial" | "paid" {
  if (paidAmount >= amount) return "paid";
  if (paidAmount > 0) return "partial";
  return "unpaid";
}
