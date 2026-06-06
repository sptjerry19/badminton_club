"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AvatarRing } from "@/components/avatar/avatar-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { getRedirectPath, toSessionUser } from "@/lib/auth/guards";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { User } from "@/types";

type AvatarUser = Pick<
  User,
  "id" | "name" | "avatar_url" | "avatar_emoji" | "role" | "level"
>;

export function AvatarSelector() {
  const router = useRouter();
  const { setSession } = useSession();
  const [users, setUsers] = useState<AvatarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, avatar_url, avatar_emoji, role, level")
        .order("name");

      if (error) {
        console.error("[AvatarSelector] Supabase error:", error);
        toast.error(`Không thể tải thành viên: ${error.message}`);
        setLoading(false);
        return;
      }

      if ((data ?? []).length === 0) {
        console.warn(
          "[AvatarSelector] Query returned 0 rows — likely RLS blocking anon access. Run supabase/migrations/20250606000001_rls_policies.sql"
        );
      }

      setUsers(data ?? []);
      setLoading(false);
    }

    loadUsers();
  }, []);

  async function handleSelect(user: AvatarUser) {
    setSelectedId(user.id);
    const sessionUser = toSessionUser(user);
    setSession(sessionUser);
    toast.success(`Xin chào, ${user.name}!`);
    router.push(getRedirectPath(user.role));
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="size-[72px] rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-2 p-8 text-center">
        <p className="text-lg font-medium">Không tải được danh sách thành viên</p>
        <p className="mt-2 text-sm text-muted-foreground">
          DB có data nhưng Row Level Security (RLS) đang chặn truy cập từ app.
          Chạy file{" "}
          <code className="rounded bg-bg-3 px-1.5 py-0.5 font-mono text-xs">
            supabase/migrations/20250606000001_rls_policies.sql
          </code>{" "}
          trong Supabase SQL Editor, hoặc chạy{" "}
          <code className="rounded bg-bg-3 px-1.5 py-0.5 font-mono text-xs">
            npx supabase db push
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 sm:grid-cols-5 lg:grid-cols-6">
      {users.map((user) => (
        <AvatarRing
          key={user.id}
          user={user}
          selected={selectedId === user.id}
          onClick={() => handleSelect(user)}
        />
      ))}
    </div>
  );
}
