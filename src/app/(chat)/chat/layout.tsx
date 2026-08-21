"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { cn } from "@/lib/utils";

export default function ChatShellLayout({ children }: LayoutProps<"/chat">) {
  const segment = useSelectedLayoutSegment();
  const panelOpen = segment !== null;

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <aside
        aria-label="Conversations"
        className={cn(
          "w-full shrink-0 border-sidebar-border md:w-80 md:border-r xl:w-88",
          panelOpen && "hidden md:block",
        )}
      >
        <ChatSidebar activeId={segment} />
      </aside>

      <main
        className={cn(
          "min-w-0 flex-1 bg-background",
          !panelOpen && "hidden md:block",
        )}
      >
        {children}
      </main>
    </div>
  );
}
