"use client";

import { Check } from "lucide-react";

import { UserAvatar } from "@/components/avatar/user-avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface AvatarRingProps {
  user: Pick<User, "id" | "name" | "avatar_url" | "avatar_emoji" | "role" | "level">;
  selected?: boolean;
  onClick?: () => void;
}

export function AvatarRing({ user, selected, onClick }: AvatarRingProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div
        className={cn(
          "relative flex size-[72px] items-center justify-center rounded-full border-2 border-border-2 bg-bg-3 transition-all duration-[250ms] ease-[cubic-bezier(.34,1.56,.64,1)]",
          "group-hover:scale-[1.08] group-hover:border-primary group-hover:bg-bg-4",
          selected && "scale-[1.08] border-primary shadow-[0_0_0_3px_rgba(124,109,250,0.3)]"
        )}
      >
        <UserAvatar user={user} size="lg" className="size-full border-0 bg-transparent" />
        {selected && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">
            <Check className="size-3" />
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {user.role === "admin" ? "Admin" : user.level ?? "Thành viên"}
        </p>
      </div>
    </button>
  );
}
