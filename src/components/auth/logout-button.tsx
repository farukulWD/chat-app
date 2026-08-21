"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "./use-logout";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button variant="outline" size="sm" onClick={logout}>
      <LogOut />
      Sign out
    </Button>
  );
}
