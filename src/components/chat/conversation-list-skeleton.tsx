import { Skeleton } from "@/components/ui/skeleton";

const WAKING_HINT =
  "Still waking the server — the free tier can take up to a minute.";

export function ConversationListSkeleton({
  rows = 6,
  slow = false,
}: {
  rows?: number;
  slow?: boolean;
}) {
  return (
    <>
      {slow ? (
        <p
          role="status"
          className="px-5 pb-3 text-xs leading-relaxed text-muted-foreground"
        >
          {WAKING_HINT}
        </p>
      ) : (
        <span className="sr-only" role="status">
          Loading conversations
        </span>
      )}

      <div className="space-y-1 px-2" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="ml-auto h-3 w-10" />
              </div>
              <Skeleton
                className="h-3"
                style={{ width: `${55 + ((index * 13) % 35)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
