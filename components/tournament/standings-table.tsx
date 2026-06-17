import { UserAvatar } from "@/components/avatar/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerStanding } from "@/lib/tournament/standings";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: PlayerStanding[];
  className?: string;
}

function formatGoalDiff(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function StandingsTable({ standings, className }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có thành viên để xếp hạng.
      </p>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-bg-2", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Thành viên</TableHead>
            <TableHead className="text-center">Điểm</TableHead>
            <TableHead className="text-center">T</TableHead>
            <TableHead className="text-center">B</TableHead>
            <TableHead className="text-center">Hiệu số</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((row) => (
            <TableRow key={row.user.id}>
              <TableCell className="text-center font-mono text-muted-foreground">
                {row.rank}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserAvatar user={row.user} size="sm" />
                  <span className="font-medium">{row.user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-mono font-semibold">
                {row.points}
              </TableCell>
              <TableCell className="text-center font-mono text-muted-foreground">
                {row.wins}
              </TableCell>
              <TableCell className="text-center font-mono text-muted-foreground">
                {row.losses}
              </TableCell>
              <TableCell
                className={cn(
                  "text-center font-mono",
                  row.goalDifference > 0 && "text-primary",
                  row.goalDifference < 0 && "text-destructive"
                )}
              >
                {formatGoalDiff(row.goalDifference)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        Thắng +1 điểm · Hòa điểm bằng nhau xếp theo hiệu số (tổng chênh lệch
        điểm từng trận)
      </p>
    </div>
  );
}
