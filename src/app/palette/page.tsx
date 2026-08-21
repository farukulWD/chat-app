"use client";

import { useState } from "react";

/**
 * Dev reference for the "Signal" palette. Not part of the product surface —
 * delete this route once the tokens are settled.
 */

type Swatch = { token: string; label: string; on?: string };

const groups: { title: string; note: string; swatches: Swatch[] }[] = [
  {
    title: "Surfaces",
    note: "Page sits tinted so panels lift away from it.",
    swatches: [
      { token: "background", label: "background", on: "foreground" },
      { token: "card", label: "card", on: "card-foreground" },
      { token: "popover", label: "popover", on: "popover-foreground" },
      { token: "sidebar", label: "sidebar", on: "sidebar-foreground" },
      { token: "muted", label: "muted", on: "muted-foreground" },
      { token: "accent", label: "accent", on: "accent-foreground" },
    ],
  },
  {
    title: "Brand",
    note: "Blue leads: primary action, own bubble, read receipts.",
    swatches: [
      { token: "primary", label: "primary", on: "primary-foreground" },
      { token: "secondary", label: "secondary", on: "secondary-foreground" },
      { token: "bubble-own", label: "bubble-own", on: "bubble-own-foreground" },
      { token: "bubble-peer", label: "bubble-peer", on: "bubble-peer-foreground" },
      { token: "unread", label: "unread", on: "unread-foreground" },
      { token: "mention", label: "mention", on: "mention-foreground" },
    ],
  },
  {
    title: "System states",
    note: "Red is destructive only — it never carries a forward action.",
    swatches: [
      { token: "success", label: "success", on: "success-foreground" },
      { token: "warning", label: "warning", on: "warning-foreground" },
      { token: "destructive", label: "destructive", on: "destructive-foreground" },
    ],
  },
  {
    title: "Lines",
    note: "Dividers stay quiet; control boundaries and focus rings hit 3:1.",
    swatches: [
      { token: "border", label: "border" },
      { token: "input", label: "input" },
      { token: "ring", label: "ring" },
    ],
  },
  {
    title: "Presence and delivery",
    note: "Green means one thing only: this person is available.",
    swatches: [
      { token: "status-online", label: "status-online" },
      { token: "status-away", label: "status-away" },
      { token: "status-busy", label: "status-busy" },
      { token: "status-offline", label: "status-offline" },
      { token: "receipt-pending", label: "receipt-pending" },
      { token: "receipt-delivered", label: "receipt-delivered" },
      { token: "receipt-read", label: "receipt-read" },
    ],
  },
  {
    title: "Charts",
    note: "Five hues, all pulled from the same lowered-brightness ramp.",
    swatches: [
      { token: "chart-1", label: "chart-1" },
      { token: "chart-2", label: "chart-2" },
      { token: "chart-3", label: "chart-3" },
      { token: "chart-4", label: "chart-4" },
      { token: "chart-5", label: "chart-5" },
    ],
  },
];

export default function PalettePage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <header className="mb-10 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Signal palette</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Blue leads, green means available, red only destroys. Every hue
                sits at lowered brightness, and neutrals carry a blue cast rather
                than running gray.
              </p>
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="shrink-0 rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {dark ? "Light" : "Dark"}
            </button>
          </header>

          <section className="mb-12 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-medium">In place</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-status-online" />
                <span className="text-xs text-muted-foreground">Ada is online</span>
              </div>
              <div className="max-w-[70%] self-start rounded-2xl rounded-bl-md bg-bubble-peer px-3.5 py-2 text-sm text-bubble-peer-foreground">
                Did the deploy finish?
              </div>
              <div className="max-w-[70%] self-end rounded-2xl rounded-br-md bg-bubble-own px-3.5 py-2 text-sm text-bubble-own-foreground">
                Just now. Logs are clean.
              </div>
              <div className="self-end text-[11px] text-receipt-read">Read 2:14 PM</div>
              <div className="mt-2 max-w-[70%] self-start rounded-2xl rounded-bl-md bg-mention px-3.5 py-2 text-sm text-mention-foreground">
                @you can you confirm the rollback plan?
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-input bg-composer px-3 py-2 text-sm text-muted-foreground">
                  Write a message
                </div>
                <button className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
                  Send
                </button>
                <span className="rounded-full bg-unread px-2 py-0.5 text-xs font-medium text-unread-foreground">
                  3
                </span>
              </div>
            </div>
          </section>

          {groups.map((g) => (
            <section key={g.title} className="mb-10">
              <h2 className="text-sm font-medium">{g.title}</h2>
              <p className="mb-3 text-xs text-muted-foreground">{g.note}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.swatches.map((s) => (
                  <div
                    key={s.token}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <div
                      className="flex h-16 items-end p-2"
                      style={{
                        backgroundColor: `var(--${s.token})`,
                        color: s.on ? `var(--${s.on})` : undefined,
                      }}
                    >
                      {s.on ? <span className="text-xs">Aa</span> : null}
                    </div>
                    <div className="bg-card px-2 py-1.5">
                      <code className="text-[11px] text-muted-foreground">
                        --{s.token}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
