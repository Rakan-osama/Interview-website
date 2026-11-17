const DEFAULT_PROGRESS_API = "http://localhost/interview-api/progress.php";

export type ProgressStorageMode = "mysql" | "browser";

function apiUrl() {
  return process.env.NEXT_PUBLIC_PROGRESS_API_URL || DEFAULT_PROGRESS_API;
}

export async function loadProgress<T>(
  browserValue: T,
  isValid: (value: unknown) => boolean,
): Promise<{ value: T; mode: ProgressStorageMode }> {
  try {
    const response = await fetch(apiUrl(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Progress API returned ${response.status}`);

    const payload = (await response.json()) as { progress?: unknown };
    if (payload.progress != null && isValid(payload.progress)) {
      return { value: payload.progress as T, mode: "mysql" };
    }

    // The database is reachable but empty. The next save migrates the browser copy.
    return { value: browserValue, mode: "mysql" };
  } catch {
    return { value: browserValue, mode: "browser" };
  }
}

export async function saveProgress(progress: unknown): Promise<boolean> {
  try {
    const response = await fetch(apiUrl(), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ progress }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
