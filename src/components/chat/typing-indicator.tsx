import { cn } from "@/lib/utils";

export const TypingIndicator = ({ name }: { name?: string }) => {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-bubble-peer px-3 py-2.5">
        <span className="sr-only">{name ? `${name} is typing` : "Typing"}</span>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            style={{ animationDelay: `${index * 160}ms` }}
            className={cn(
              "size-1.5 rounded-full bg-muted-foreground/70",
              "motion-safe:animate-bounce",
            )}
          />
        ))}
      </div>
    </div>
  );
};
