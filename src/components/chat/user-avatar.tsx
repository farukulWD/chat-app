import { Users } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Presence } from "@/types/chat";

/** Which of the five chart hues a person gets. Stable for a given id, so a
 *  face keeps its colour across the roster, the header and the group list. */
const hueIndex = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 5) + 1;
};

export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const PRESENCE_CLASS: Record<Presence, string> = {
  online: "bg-status-online",
  away: "bg-status-away",
  busy: "bg-status-busy",
  offline: "bg-status-offline",
};

export const PRESENCE_LABEL: Record<Presence, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

export const UserAvatar = ({
  name,
  seed,
  presence,
  isGroup = false,
  size = "default",
  className,
}: {
  name: string;
  /** Usually the user or conversation id — decides the colour. */
  seed: string;
  presence?: Presence;
  isGroup?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}) => {
  const hue = `var(--chart-${hueIndex(seed)})`;

  return (
    <Avatar size={size} className={cn("after:border-transparent", className)}>
      <AvatarFallback
        className="font-medium"
        style={{
          backgroundColor: `color-mix(in oklch, ${hue} 16%, var(--card))`,
          color: hue,
        }}
      >
        {isGroup ? (
          <Users className="size-[45%]" aria-hidden="true" />
        ) : (
          initialsOf(name)
        )}
      </AvatarFallback>

      {presence && presence !== "offline" && (
        <AvatarBadge
          className={cn("ring-background", PRESENCE_CLASS[presence])}
        >
          <span className="sr-only">{PRESENCE_LABEL[presence]}</span>
        </AvatarBadge>
      )}
    </Avatar>
  );
};
