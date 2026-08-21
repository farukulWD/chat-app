"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/brand/logo";
import { useAppSelector } from "@/redux/hooks";

export default function ChatPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <Logo className="text-sm" markClassName="size-7" />
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-100 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-lg font-semibold">{user?.name}</p>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground tabular-nums">
            {user?.phone}
          </p>
        </div>
      </main>
    </div>
  );
}
