const raw = process.env.NEXT_PUBLIC_API_URL;

/** Host root. /health and the Socket.io endpoint live here. */
export const API_ROOT = raw ? raw.replace(/\/+$/, "") : undefined;

/** REST base. Every /api route hangs off this one. */
export const API_BASE_URL = API_ROOT ? `${API_ROOT}/api` : undefined;
