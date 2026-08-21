export const THEME_STORAGE_KEY = "ch-app-theme";

export type Theme = "light" | "dark" | "system";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Runs before first paint, so a dark-mode visitor never sees a light flash.
 * Inlined into the document head — it cannot import anything.
 */
export const THEME_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var t=localStorage.getItem(k)||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

/* -------------------------------------------------------------------------
   The preference itself lives outside React.
   It is one value shared by the whole document, it is read from storage and
   from a media query, and it is written by a DOM class — an external system
   in every sense. Components subscribe to it with `useSyncExternalStore`,
   which keeps the server render deterministic and the client render honest.
------------------------------------------------------------------------- */

export type ThemeSnapshot = { theme: Theme; resolved: "light" | "dark" };

const SERVER_SNAPSHOT: ThemeSnapshot = { theme: "system", resolved: "light" };

let snapshot: ThemeSnapshot | null = null;
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    // Private mode or blocked storage.
    return "system";
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getThemeSnapshot(): ThemeSnapshot {
  if (!snapshot) {
    const theme = read();
    snapshot = { theme, resolved: resolveTheme(theme) };
  }
  return snapshot;
}

export function getServerThemeSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);

  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (getThemeSnapshot().theme !== "system") return;
    snapshot = { theme: "system", resolved: resolveTheme("system") };
    document.documentElement.classList.toggle(
      "dark",
      snapshot.resolved === "dark",
    );
    emit();
  };
  query.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", onSystemChange);
  };
}

export function setTheme(next: Theme): void {
  const resolved = resolveTheme(next);
  snapshot = { theme: next, resolved };
  document.documentElement.classList.toggle("dark", resolved === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // The preference simply will not persist.
  }
  emit();
}
