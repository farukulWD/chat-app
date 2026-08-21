"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import { useLogout } from "@/components/auth/use-logout";
import type { User } from "@/types/auth";

export function AccountMenu({ user }: { user: User | null }) {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 aria-expanded:bg-sidebar-accent"
      >
        <UserAvatar
          name={user?.name ?? "You"}
          seed={user?._id ?? "me"}
          presence="online"
          className="shrink-0"
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-sidebar-foreground">
            {user?.name ?? "Signed in"}
          </span>
          <span className="block truncate font-mono text-xs tabular-nums text-muted-foreground">
            {user?.phone}
          </span>
        </span>

        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start">
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
