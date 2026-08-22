const MINUTE = 60_000;
const DAY = 86_400_000;

const startOfDay = (date: Date): number => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
};

export const isSameDay = (a: Date, b: Date): boolean => {
  return startOfDay(a) === startOfDay(b);
};

/** Whole days between two dates, ignoring the time of day. */
export const daysApart = (a: Date, b: Date): number => {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
};

/** Clock time inside a bubble: "9:41 AM". */
export const formatClock = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

/** Full stamp for the bubble's tooltip and `<time dateTime>` title. */
export const formatFull = (date: Date): string => {
  return date.toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** The divider that separates one day of messages from the next. */
export const formatDayDivider = (date: Date, now = new Date()): string => {
  const delta = daysApart(date, now);
  if (delta === 0) return "Today";
  if (delta === 1) return "Yesterday";
  if (delta < 7) return date.toLocaleDateString(undefined, { weekday: "long" });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
    });
  }
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * The timestamp on a conversation row. Kept short — the row is dense and the
 * column is narrow, so this degrades from a clock to a weekday to a date.
 */
export const formatListTime = (date: Date, now = new Date()): string => {
  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) return "now";

  const delta = daysApart(date, now);
  if (delta === 0) return formatClock(date);
  if (delta === 1) return "Yesterday";
  if (delta < 7)
    return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const HOUR = 3_600_000;
const ACTIVE_NOW = 5 * MINUTE;
const ACTIVITY_HORIZON = 7 * DAY;

/** Last seen *sending* — a lower bound, not a claim of being online. */
export const formatLastActive = (
  date: Date,
  now = new Date(),
): string | null => {
  const elapsed = now.getTime() - date.getTime();

  // Clock skew would otherwise read "Active 0m ago".
  if (elapsed < 0) return "Active now";
  if (elapsed < ACTIVE_NOW) return "Active now";
  if (elapsed >= ACTIVITY_HORIZON) return null;

  if (elapsed < HOUR) return `Active ${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `Active ${Math.floor(elapsed / HOUR)}h ago`;
  return `Active ${Math.floor(elapsed / DAY)}d ago`;
};
