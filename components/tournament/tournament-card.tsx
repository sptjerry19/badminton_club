import Link from "next/link";

import { StatusBadge } from "@/components/tournament/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Tournament, TournamentStatus } from "@/types";

interface TournamentCardProps {
  tournament: Tournament & { venues?: { name: string } | null };
  href: string;
  subtitle?: string;
}

export function TournamentCard({
  tournament,
  href,
  subtitle,
}: TournamentCardProps) {
  return (
    <Link href={href}>
      <Card className="border-border bg-bg-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-2">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{tournament.name}</CardTitle>
            <StatusBadge
              type="tournament"
              status={tournament.status as TournamentStatus}
            />
          </div>
          <CardDescription>
            {formatDate(tournament.date)}
            {tournament.venues?.name ? ` · ${tournament.venues.name}` : ""}
          </CardDescription>
        </CardHeader>
        {subtitle && (
          <CardContent>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
