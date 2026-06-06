import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger";
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-bg-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-2",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs uppercase tracking-wide">
            {label}
          </CardDescription>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <CardTitle
          className={cn(
            "font-mono text-3xl font-semibold tracking-tight",
            variant === "danger" && "text-destructive"
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      {delta && (
        <CardContent>
          <p
            className={cn(
              "text-xs",
              variant === "danger" ? "text-destructive" : "text-success"
            )}
          >
            {delta}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
