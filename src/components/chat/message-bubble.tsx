"use client";

import { AlertCircle, Check, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatClock, formatFull } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

const Receipt = ({ status }: { status: Message["status"] }) => {
  if (status === "pending") {
    return (
      <Clock className="size-3 text-receipt-pending" aria-label="Sending" />
    );
  }
  if (status === "failed") {
    return (
      <AlertCircle className="size-3 text-destructive" aria-label="Not sent" />
    );
  }
  return <Check className="size-3 opacity-70" aria-label="Sent" />;
};

const senderHue = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return `var(--chart-${(Math.abs(hash) % 5) + 1})`;
};

export const MessageBubble = ({
  message,
  isOwn,
  senderName,
  isFirstOfGroup,
  isLastOfGroup,
}: {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start",
        isLastOfGroup ? "mb-1.5" : "mb-0.5",
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-3 py-2 text-sm/relaxed shadow-xs sm:max-w-[75%]",
          isOwn
            ? "bg-bubble-own text-bubble-own-foreground"
            : "bg-bubble-peer text-bubble-peer-foreground",
          isOwn && isLastOfGroup && "rounded-br-md",
          !isOwn && isLastOfGroup && "rounded-bl-md",
        )}
      >
        {senderName && isFirstOfGroup && (
          <p
            className="mb-0.5 text-xs font-semibold"
            style={{ color: senderHue(message.senderId) }}
          >
            {senderName}
          </p>
        )}

        <p className="wrap-break-word whitespace-pre-wrap">
          {message.text}
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-0 align-bottom",
              isOwn ? "w-19" : "w-16",
            )}
          />
        </p>

        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={cn(
                  "absolute right-3 bottom-1.5 flex items-center gap-1 text-[0.6875rem] tabular-nums",
                  isOwn
                    ? "text-bubble-own-foreground/75"
                    : "text-muted-foreground",
                )}
              />
            }
          >
            <time dateTime={message.sentAt.toISOString()}>
              {formatClock(message.sentAt)}
            </time>
            {isOwn && <Receipt status={message.status} />}
          </TooltipTrigger>
          <TooltipContent>{formatFull(message.sentAt)}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
