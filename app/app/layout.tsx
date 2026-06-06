"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/components/layout/route-guard";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <AppShell variant="member">{children}</AppShell>
    </RouteGuard>
  );
}
