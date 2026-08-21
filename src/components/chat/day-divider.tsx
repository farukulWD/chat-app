import { formatDayDivider } from "@/lib/datetime";

export function DayDivider({ date }: { date: Date }) {
  return (
    <div className="sticky top-0 z-10 flex justify-center py-2">
      <span className="rounded-full bg-background/85 px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground ring-1 ring-border backdrop-blur-sm">
        <time dateTime={date.toISOString()}>{formatDayDivider(date)}</time>
      </span>
    </div>
  );
}
