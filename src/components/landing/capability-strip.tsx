import { Reveal } from "./reveal";

const CAPABILITIES = [
  "Direct + group",
  "Delivery receipts",
  "Presence",
  "Auto-scroll etiquette",
  "Light + dark",
  "Keyboard-complete",
];

export function CapabilityStrip() {
  return (
    <Reveal>
      <div className="border-y border-border">
        <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
          {CAPABILITIES.map((item) => (
            <li
              key={item}
              className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
