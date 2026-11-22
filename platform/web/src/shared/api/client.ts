const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_ENDPOINT = /^https?:\/\//i.test(API_BASE) ? new URL("/sanctum/csrf-cookie", API_BASE).toString() : "/sanctum/csrf-cookie";
let csrfRequest: Promise<void> | undefined;

export async function ensureCsrfCookie(): Promise<void> {
  if (!csrfRequest) {
    csrfRequest = fetch(CSRF_ENDPOINT, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new ApiError("Unable to initialize the secure session.", response.status);
      })
      .finally(() => { csrfRequest = undefined; });
  }
  return csrfRequest;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
  }
}

type ErrorPayload = { message?: string; errors?: Record<string, string[]> };
export function validationErrors(error: unknown): Record<string, string[]> {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  return (error.details as ErrorPayload | null)?.errors ?? {};
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 401) return "Your sign-in session expired. Sign in again and retry the action.";
  if (error.status === 419) return "The secure session expired. Refresh the page and try again.";
  if (error.status === 429) return "Too many attempts. Wait one minute and try again.";
  if (error.status === 422) return (error.details as ErrorPayload | null)?.message ?? fallback;
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const needsCsrf = !SAFE_METHODS.has(method);
  if (needsCsrf && !readCookie("XSRF-TOKEN")) await ensureCsrfCookie();

  let response = await sendRequest(path, options, method);
  if (needsCsrf && response.status === 419) {
    await ensureCsrfCookie();
    response = await sendRequest(path, options, method);
  }
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new ApiError("The request could not be completed.", response.status, details);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json();
  return (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T;
}

function sendRequest(path: string, options: RequestInit, method: string): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body != null) headers.set("Content-Type", "application/json");
  const csrfToken = readCookie("XSRF-TOKEN");
  if (csrfToken && !SAFE_METHODS.has(method)) headers.set("X-XSRF-TOKEN", decodeURIComponent(csrfToken));
  return fetch(`${API_BASE}${path}`, { credentials: "include", ...options, method, headers });
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1);
}
