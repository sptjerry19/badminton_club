"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";
import { canAccessAdmin, canAccessApp } from "@/lib/auth/guards";

interface RouteGuardProps {
  requireAdmin?: boolean;
  children: React.ReactNode;
}

export function RouteGuard({ requireAdmin = false, children }: RouteGuardProps) {
  const { user, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (requireAdmin) {
      if (!canAccessAdmin(user)) {
        router.replace(user ? "/app" : "/");
      }
      return;
    }

    if (!canAccessApp(user)) {
      router.replace("/");
    }
  }, [user, hydrated, requireAdmin, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  if (requireAdmin && !canAccessAdmin(user)) return null;
  if (!requireAdmin && !canAccessApp(user)) return null;

  return <>{children}</>;
}
