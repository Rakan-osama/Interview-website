const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function ensureCsrfCookie(): Promise<void> {
  const response = await fetch("/sanctum/csrf-cookie", { credentials: "include" });
  if (!response.ok) throw new ApiError("Unable to initialize the secure session.", response.status);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  const method = (options.method ?? "GET").toUpperCase();
  const csrfToken = readCookie("XSRF-TOKEN");
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(csrfToken));
  }
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new ApiError("تعذّر إكمال الطلب.", response.status, details);
  }

  if (response.status === 204) return undefined as T;
  const payload = await response.json();
  return (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T;
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
