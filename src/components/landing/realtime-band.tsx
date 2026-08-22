import { Check, PlugZap, RefreshCw, Users } from "lucide-react";
import { Eyebrow, Lede, Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";

const EVENTS = [
  {
    icon: PlugZap,
    name: "message:new",
    title: "Messages arrive on their own",
    body: "An incoming message lands in the open thread and moves the conversation to the top of the list in the same tick. Nothing polls, and nobody has to press refresh.",
  },
  {
    icon: Users,
    name: "conversation:updated",
    title: "Group changes reach everyone",
    body: "Rename a group, add a member, remove one — every participant's list redraws from the same event, including the person who just lost access.",
  },
  {
    icon: RefreshCw,
    name: "disconnect / connect",
    title: "A dropped socket says so",
    body: "Your own status dims the moment delivery stops, and the client re-syncs conversations and messages on reconnect instead of pretending the gap never happened.",
  },
];

const LOG = [
  { time: "12:04:29", event: "connect", detail: "socket authenticated" },
  { time: "12:04:31", event: "message:new", detail: "conversation 68f3a2" },
  { time: "12:04:31", event: "inbox:patch", detail: "row moved to top" },
  { time: "12:05:02", event: "disconnect", detail: "transport close" },
  { time: "12:05:04", event: "connect", detail: "re-sync · 2 threads" },
];

export function RealtimeBand() {
  return (
    <div className="dark relative isolate border-y border-border bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />
      <Section id="real-time">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>Delivery</Eyebrow>
              <SectionHeading className="mt-3">
                The connection stays open, so the page never has to ask.
              </SectionHeading>
              <Lede className="mt-4">
                Every screen in the app is driven by the same socket the server
                already speaks. Three events do all of the work.
              </Lede>
            </Reveal>

            <ul className="mt-10 space-y-6">
              {EVENTS.map((item, index) => (
                <li key={item.name}>
                  <Reveal delay={index * 70}>
                    <div className="flex gap-4">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <item.icon className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-primary">
                          {item.name}
                        </p>
                        <h3 className="mt-1 text-base font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="size-1.5 rounded-full bg-status-online" />
                <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
                  socket · connected
                </p>
              </div>

              <div className="space-y-3 px-4 py-4">
                <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-bubble-peer px-3 py-2 text-sm text-bubble-peer-foreground">
                  Did the deploy go out?
                </div>
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-bubble-own px-3 py-2 text-sm text-bubble-own-foreground">
                  Just now — check the link.
                  <span className="ml-2 inline-flex items-center gap-1 align-middle font-mono text-[0.625rem] text-bubble-own-foreground/75">
                    12:04
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="border-t border-border bg-muted/30 px-4 py-3 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
                {LOG.map((line) => (
                  <p key={line.time + line.event} className="flex gap-2">
                    <span className="tabular-nums opacity-70">{line.time}</span>
                    <span className="text-foreground">{line.event}</span>
                    <span className="truncate">{line.detail}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
