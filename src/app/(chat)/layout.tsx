"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { SocketProvider } from "@/providers/socket-provider";
import { useAppSelector } from "@/redux/hooks";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useAppSelector((state) => state.auth.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-5 text-muted-foreground" />
        <span className="sr-only">Restoring your session</span>
      </div>
    );
  }

  return <SocketProvider>{children}</SocketProvider>;
}
