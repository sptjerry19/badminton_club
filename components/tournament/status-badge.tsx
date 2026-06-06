import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  MatchStatus,
  MemberStatus,
  PaymentStatus,
  TournamentStatus,
} from "@/types";

type StatusType = "tournament" | "payment" | "member" | "match";

const configs: Record<
  StatusType,
  Record<string, { label: string; className: string }>
> = {
  tournament: {
    upcoming: {
      label: "Sắp diễn ra",
      className: "border-info/20 bg-info/10 text-info",
    },
    ongoing: {
      label: "Đang diễn ra",
      className: "border-success/20 bg-success/10 text-success",
    },
    finished: {
      label: "Đã kết thúc",
      className: "border-border bg-white/6 text-muted-foreground",
    },
  },
  payment: {
    unpaid: {
      label: "Chưa trả",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    partial: {
      label: "Một phần",
      className: "border-warning/20 bg-warning/10 text-warning",
    },
    paid: {
      label: "Đã trả",
      className: "border-success/20 bg-success/10 text-success",
    },
  },
  member: {
    confirmed: {
      label: "Đã xác nhận",
      className: "border-success/20 bg-success/10 text-success",
    },
    pending: {
      label: "Chờ xác nhận",
      className: "border-warning/20 bg-warning/10 text-warning",
    },
    withdrew: {
      label: "Đã rút",
      className: "border-border bg-white/6 text-muted-foreground",
    },
  },
  match: {
    scheduled: {
      label: "Chưa đấu",
      className: "border-info/20 bg-info/10 text-info",
    },
    ongoing: {
      label: "Đang đấu",
      className: "border-success/20 bg-success/10 text-success",
    },
    finished: {
      label: "Kết thúc",
      className: "border-border bg-white/6 text-muted-foreground",
    },
  },
};

interface StatusBadgeProps {
  type: StatusType;
  status:
    | TournamentStatus
    | PaymentStatus
    | MemberStatus
    | MatchStatus
    | string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const config = configs[type][status] ?? {
    label: status,
    className: "border-border bg-white/6 text-muted-foreground",
  };

  return (
    <Badge className={cn(config.className, className)}>{config.label}</Badge>
  );
}
