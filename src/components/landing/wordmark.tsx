import { cn } from "@/lib/utils";

export const PRODUCT_NAME = "Chat app";

export function Wordmark({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-6 shrink-0 text-primary"
      >
        <path
          fill="currentColor"
          d="M12 2.5c5.24 0 9.5 3.7 9.5 8.3s-4.26 8.3-9.5 8.3a11 11 0 0 1-2.6-.31l-4.3 2.5a.7.7 0 0 1-1.05-.7l.72-3.68C2.9 15.4 2.5 13.4 2.5 10.8c0-4.6 4.26-8.3 9.5-8.3Z"
        />
        <circle cx="9.4" cy="10.8" r="1.55" className="fill-card" />
        <circle cx="14.6" cy="10.8" r="1.55" className="fill-card" />
      </svg>

      {showName && (
        <span className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-foreground">
          {PRODUCT_NAME}
        </span>
      )}
    </span>
  );
}
