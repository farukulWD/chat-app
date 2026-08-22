import type { ApiErrorBody, ApiErrorDetail } from "@/types/auth";

const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Check the highlighted fields and try again.",
  NO_TOKEN: "Your session ended. Sign in again.",
  INVALID_TOKEN: "Your session ended. Sign in again.",
  UNKNOWN_USER: "We couldn't find that account.",
  FORBIDDEN: "You don't have access to that conversation.",
  NOT_FOUND: "That no longer exists.",
  NOT_A_GROUP: "That only works on a group conversation.",
  NOT_A_MEMBER: "That person isn't in this group.",
  SERVER_ERROR: "The server couldn't handle that. Try again.",
};

const GENERIC = "Something went wrong. Try again.";
const OFFLINE = "Can't reach the server. Check your connection and try again.";
const TIMED_OUT =
  "The server is still waking up. Give it a moment and try again.";

type QueryError = { status?: number; data?: unknown };

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ApiErrorBody).error === "object"
  );
}

export function getApiErrorCode(error: unknown): string | number | undefined {
  const data = (error as QueryError | undefined)?.data;
  return isApiErrorBody(data) ? data.error.code : undefined;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  const data = (error as QueryError | undefined)?.data;
  if (!isApiErrorBody(data) || !data.error.details) return {};

  return data.error.details.reduce<Record<string, string>>(
    (acc, detail: ApiErrorDetail) => {
      if (detail.path) acc[detail.path] = detail.message;
      return acc;
    },
    {},
  );
}

export function getApiErrorMessage(
  error: unknown,
  overrides?: Record<string, string>,
): string {
  const queryError = error as QueryError | undefined;
  if (!queryError) return GENERIC;

  if (queryError.status === undefined) {
    const message =
      typeof queryError.data === "string" ? queryError.data.toLowerCase() : "";
    return message.includes("timeout") ? TIMED_OUT : OFFLINE;
  }

  const code = getApiErrorCode(error);
  if (typeof code !== "string") return GENERIC;

  return overrides?.[code] ?? MESSAGES[code] ?? GENERIC;
}

export function isAuthError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return code === "INVALID_TOKEN" || code === "NO_TOKEN";
}
