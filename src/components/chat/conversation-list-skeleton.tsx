import { Skeleton } from "@/components/ui/skeleton";

export function ConversationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-1 px-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="ml-auto h-3 w-10" />
            </div>
            <Skeleton className="h-3" style={{ width: `${55 + ((index * 13) % 35)}%` }} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading conversations</span>
    </div>
  );
}
