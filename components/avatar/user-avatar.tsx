import { cn } from "@/lib/utils";
import type { SessionUser, User } from "@/types";

interface UserAvatarProps {
  user: Pick<User | SessionUser, "name" | "avatar_url" | "avatar_emoji">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-7 text-sm",
  md: "size-10 text-lg",
  lg: "size-[72px] text-3xl",
};

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.name}
        className={cn(
          "rounded-full object-cover bg-bg-3",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-bg-3 font-medium",
        sizes[size],
        className
      )}
      aria-label={user.name}
    >
      {user.avatar_emoji ?? user.name.charAt(0).toUpperCase()}
    </div>
  );
}
