"use client";

import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const MessageComposer = ({
  onSend,
  conversationTitle,
}: {
  onSend: (text: string) => void;
  conversationTitle: string;
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-border bg-composer px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="mx-auto flex w-full max-w-3xl items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={value}
          rows={1}
          aria-label={`Message ${conversationTitle}`}
          placeholder="Write a message…"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key !== "Enter" ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            ) {
              return;
            }
            event.preventDefault();
            send();
          }}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl px-3.5 py-2.5"
        />

        <Button
          type="submit"
          size="icon-lg"
          disabled={!canSend}
          aria-label="Send message"
          className="mb-px size-10 shrink-0 rounded-full"
        >
          <SendHorizontal />
        </Button>
      </form>

      <p className="mx-auto mt-1.5 hidden w-full max-w-3xl text-[0.6875rem] text-muted-foreground sm:block">
        <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
        <kbd className="font-sans font-medium">Shift</kbd> +{" "}
        <kbd className="font-sans font-medium">Enter</kbd> for a new line
      </p>
    </div>
  );
};
