import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The shared empty / error / idle block. One component so every one of these
 * states in the app has the same rhythm and the same retry affordance.
 */
export const StateBlock = ({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  tone?: "muted" | "destructive";
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
      role={tone === "destructive" ? "alert" : undefined}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            tone === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-70 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
