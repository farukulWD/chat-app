import { cn } from "@/lib/utils";

/**
 * The mark reads the palette's thesis back: blue carries the message, green
 * says someone is there. The presence dot is knocked out of the bubble rather
 * than set on top of it, so the dot holds its edge on any surface it lands on.
 */
export function LogoMark({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  const notchId = "logo-presence-notch";

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      className={cn("size-8", className)}
      {...props}
    >
      <mask id={notchId}>
        <rect width="32" height="32" fill="#fff" />
        <circle cx="24.5" cy="24" r="6" fill="#000" />
      </mask>
      <g
        mask={`url(#${notchId})`}
        fill="var(--primary)"
        stroke="var(--primary)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="24" height="19" rx="6.5" stroke="none" />
        <path d="M9 19 L6.8 27.2 L15.5 21.5 Z" />
      </g>
      <circle cx="24.5" cy="24" r="3.9" fill="var(--status-online)" />
    </svg>
  );
}

/**
 * Mark plus wordmark. Change `name` in one place to rebrand — nothing else in
 * the lockup is tied to the string.
 */
export function Logo({
  name = "Chat App",
  className,
  markClassName,
  ...props
}: React.ComponentProps<"div"> & {
  name?: string;
  markClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <LogoMark className={markClassName} />
      <span className="text-[1.35em] leading-none font-semibold tracking-[-0.03em] text-foreground">
        {name}
      </span>
    </div>
  );
}
