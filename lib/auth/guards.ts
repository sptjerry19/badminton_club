import type { SessionUser, UserRole } from "@/types";

export function getRedirectPath(role: UserRole): "/admin" | "/app" {
  return role === "admin" ? "/admin" : "/app";
}

export function canAccessAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}

export function canAccessApp(user: SessionUser | null): boolean {
  return user !== null;
}

export function toSessionUser(user: {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  role: UserRole;
  level: string | null;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
    avatar_emoji: user.avatar_emoji,
    role: user.role,
    level: user.level,
  };
}
