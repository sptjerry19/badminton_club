"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/venues", label: "Sân" },
  { href: "/admin/tournaments", label: "Giải đấu" },
  { href: "/admin/members", label: "Thành viên" },
  { href: "/admin/evaluations", label: "Đánh giá" },
  { href: "/admin/finance", label: "Tài chính" },
];

const memberLinks = [
  { href: "/app", label: "Trang chủ" },
  { href: "/app/tournaments", label: "Giải đấu" },
  { href: "/app/finance", label: "Tài chính" },
  { href: "/app/profile", label: "Hồ sơ" },
];

interface AppShellProps {
  variant: "admin" | "member";
  children: React.ReactNode;
}

export function AppShell({ variant, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearSession } = useSession();
  const links = variant === "admin" ? adminLinks : memberLinks;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href={variant === "admin" ? "/admin" : "/app"} className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm">
              🏸
            </div>
            <span className="hidden text-[15px] font-semibold sm:inline">
              ShuttlePro
            </span>
          </Link>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname === link.href ||
                    (link.href !== "/admin" &&
                      link.href !== "/app" &&
                      pathname.startsWith(link.href))
                    ? "bg-primary/15 text-accent-3"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full bg-bg-3 px-2 py-1 sm:flex">
                <UserAvatar user={user} size="sm" />
                <span className="text-xs font-medium">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSession();
                  router.replace("/");
                }}
              >
                Đổi avatar
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
