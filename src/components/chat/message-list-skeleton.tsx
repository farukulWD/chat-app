import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SHAPE = [
  { own: false, width: "60%" },
  { own: false, width: "38%" },
  { own: true, width: "45%" },
  { own: false, width: "72%" },
  { own: true, width: "30%" },
  { own: true, width: "55%" },
];

export function MessageListSkeleton() {
  return (
    <div className="space-y-2 px-4 py-4" aria-hidden="true">
      {SHAPE.map((row, index) => (
        <div
          key={index}
          className={cn("flex", row.own ? "justify-end" : "justify-start")}
        >
          <Skeleton
            className="h-11 rounded-2xl"
            style={{ width: `min(${row.width}, 22rem)` }}
          />
        </div>
      ))}
      <span className="sr-only">Loading messages</span>
    </div>
  );
}
