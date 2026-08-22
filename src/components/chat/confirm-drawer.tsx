"use client";

import { TriangleAlert } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending = false,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  error?: string | null;
  onConfirm: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent aria-label={title}>
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="text-balance">
            {description}
          </DrawerDescription>
        </DrawerHeader>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 px-4 pt-3 text-xs leading-snug text-destructive"
          >
            <TriangleAlert className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <DrawerFooter className="pt-4">
          <Button
            variant="destructive"
            className="h-10"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Spinner />}
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            className="h-10"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
