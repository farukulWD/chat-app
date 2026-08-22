"use client";

import { useState } from "react";
import { MessageSquareOff } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { StateBlock } from "@/components/chat/state-block";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/types/chat";
import { Eyebrow, Lede, Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";
import { ScrollEtiquetteDemo } from "./scroll-etiquette-demo";

const SAMPLE = {
  id: "craft-failed",
  conversationId: "68f3a2",
  senderId: "demo-you",
  text: "Sent this one with the wifi off.",
  sentAt: new Date(2026, 0, 1, 12, 4),
};

/** The retry here does what retry does in the app: the message goes back to
 *  pending and then settles. A control that is shown is a control that works. */
function FailedSendSample() {
  const [status, setStatus] = useState<Message["status"]>("failed");

  const retry = () => {
    setStatus("pending");
    setTimeout(() => setStatus("sent"), 700);
  };

  return (
    <MessageBubble
      message={{ ...SAMPLE, status }}
      isOwn
      isFirstOfGroup
      isLastOfGroup
      onRetry={status === "failed" ? retry : undefined}
    />
  );
}

function Tile({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 rounded-xl bg-background p-3">{children}</div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
    </div>
  );
}

export function CraftSection() {
  return (
    <Section id="craft" className="border-t border-border">
      <Reveal>
        <Eyebrow>Craft</Eyebrow>
        <SectionHeading className="mt-3">
          The behaviour nobody screenshots.
        </SectionHeading>
        <Lede className="mt-4">
          A chat app is judged on the awkward moments: the second before data
          arrives, the thread with nothing in it, the message that did not go
          out, and the reader who has scrolled up. Here they are, running.
        </Lede>
      </Reveal>

      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        <Reveal className="lg:relative lg:col-span-7">
          {/* On wide screens the card is taken out of flow so the row height
              comes from the tiles beside it. The message list then fills
              whatever is left instead of growing with its own messages. */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 lg:absolute lg:inset-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
                Auto-scroll etiquette
              </p>
              <p className="text-xs text-muted-foreground">
                Scroll up while it talks — it will wait for you.
              </p>
            </div>
            <div className="mt-3 min-h-0 flex-1">
              <ScrollEtiquetteDemo />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              At the bottom, the view follows every new message. One scroll up
              and it freezes where you left it, counts what arrived, and gives
              you a pill to come back — the same rule the real conversation
              panel runs on.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:col-span-5">
          <Reveal delay={70}>
            <Tile
              label="Loading"
              caption="Skeletons match the shape of the rows that replace them, so the panel does not jump when the data lands."
            >
              <div className="space-y-2.5">
                {[80, 62, 70].map((width, index) => (
                  <div key={width} className="flex items-center gap-2.5">
                    <Skeleton className="size-7 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3" style={{ width: `${width}%` }} />
                      <Skeleton
                        className="h-2.5"
                        style={{ width: `${width - 20 - index * 5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Tile>
          </Reveal>

          <Reveal delay={140}>
            <Tile
              label="Empty"
              caption="An empty screen says what to do next, in the same voice as the rest of the interface."
            >
              <StateBlock
                icon={MessageSquareOff}
                title="No messages yet"
                description="Say hello — your first message starts the thread."
                className="px-0 py-2"
              />
            </Tile>
          </Reveal>

          <Reveal delay={210}>
            <Tile
              label="Failed send"
              caption="A send that fails keeps its text on screen and offers one retry — press it and watch the message settle."
            >
              <FailedSendSample />
            </Tile>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
