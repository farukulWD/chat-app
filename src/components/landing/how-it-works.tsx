import { Check, Search, SendHorizonal } from "lucide-react";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Eyebrow, Lede, Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";

function PhoneVignette() {
  return (
    <div className="rounded-xl border border-input/60 bg-background px-3 py-2.5">
      <p className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
        Phone number
      </p>
      <p className="mt-1 flex items-center font-mono text-sm">
        +880 1712 000111
        <span className="ml-0.5 inline-block h-4 w-px bg-primary motion-safe:animate-pulse" />
      </p>
    </div>
  );
}

function SearchVignette() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-input/60 bg-background px-3 py-2 text-sm text-muted-foreground">
        <Search className="size-3.5" aria-hidden="true" />
        rafi
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-accent/60 px-2 py-1.5">
        <UserAvatar name="Rafi Ahmed" seed="demo-rafi" size="sm" />
        <span className="text-sm">Rafi Ahmed</span>
        <span className="ml-auto font-mono text-[0.6875rem] text-muted-foreground">
          …000222
        </span>
      </div>
    </div>
  );
}

function SendVignette() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-input/60 bg-background py-1.5 pr-1.5 pl-3">
      <span className="flex-1 truncate text-sm text-muted-foreground">
        Pushed the last commit
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <SendHorizonal className="size-3.5" aria-hidden="true" />
      </span>
    </div>
  );
}

function ArrivalVignette() {
  return (
    <div className="space-y-1.5">
      <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-bubble-own px-3 py-1.5 text-sm text-bubble-own-foreground">
        Pushed the last commit
      </div>
      <p className="flex items-center justify-end gap-1 font-mono text-[0.625rem] text-muted-foreground">
        <Check className="size-3" aria-hidden="true" />
        delivered · no refresh
      </p>
    </div>
  );
}

const STEPS = [
  {
    title: "Enter your number",
    body: "A number that has never been seen is registered on the spot. There is no second signup screen to design, and none to fill in.",
    vignette: <PhoneVignette />,
  },
  {
    title: "Find a person",
    body: "Search by name or by number. Matches come back as you type, and one tap opens the conversation.",
    vignette: <SearchVignette />,
  },
  {
    title: "Say something",
    body: "Write and send. Empty messages cannot be sent, and a send that fails keeps its text and offers a retry.",
    vignette: <SendVignette />,
  },
  {
    title: "It arrives",
    body: "Their screen updates without a refresh, and your own message ticks from sending to sent as the server confirms it.",
    vignette: <ArrivalVignette />,
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Reveal>
        <Eyebrow>Start to first message</Eyebrow>
        <SectionHeading className="mt-3">
          Four steps, and none of them is a signup form.
        </SectionHeading>
        <Lede className="mt-4">
          Most messengers ask you to invent an identity before you can say
          anything. Here the number is the identity, so the path from a cold
          open to a delivered message is short enough to print on one line.
        </Lede>
      </Reveal>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="h-full">
            <Reveal delay={index * 70} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                <span className="font-mono text-xs tracking-[0.18em] text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <div className="mt-5 pt-1">{step.vignette}</div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
