"use client";

import { SessionProvider } from "next-auth/react";
import { isAuthEnabled } from "@/lib/auth";

export function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 总是提供 SessionProvider，即使认证未启用
  // 这样 useSession 不会报错，只是返回 null
  return <SessionProvider>{children}</SessionProvider>;
}
