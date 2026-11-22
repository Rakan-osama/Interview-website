import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./client";

let cookie = "";

beforeEach(() => {
  cookie = "";
  vi.restoreAllMocks();
  vi.stubGlobal("document", {
    get cookie() { return cookie; },
    set cookie(value: string) { cookie = value; },
  });
});

describe("apiRequest CSRF handling", () => {
  it("initializes CSRF before an unsafe request when the cookie is missing", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input).endsWith("/sanctum/csrf-cookie")) {
        cookie = "XSRF-TOKEN=fresh-token";
        return new Response(null, { status: 204 });
      }
      expect(new Headers(init?.headers).get("X-XSRF-TOKEN")).toBe("fresh-token");
      return Response.json({ data: { status: "pending" } }, { status: 202 });
    });

    await expect(apiRequest("/lessons/1/attempts", { method: "POST", body: "{}" }))
      .resolves.toEqual({ status: "pending" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes CSRF and retries once after a 419 response", async () => {
    cookie = "XSRF-TOKEN=stale-token";
    let apiCalls = 0;
    const seenTokens: Array<string | null> = [];
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input).endsWith("/sanctum/csrf-cookie")) {
        cookie = "XSRF-TOKEN=renewed-token";
        return new Response(null, { status: 204 });
      }
      apiCalls += 1;
      seenTokens.push(new Headers(init?.headers).get("X-XSRF-TOKEN"));
      if (apiCalls === 1) return Response.json({ message: "CSRF token mismatch." }, { status: 419 });
      return Response.json({ data: { status: "pending" } }, { status: 202 });
    });

    await expect(apiRequest("/lessons/1/attempts", { method: "POST", body: "{}" }))
      .resolves.toEqual({ status: "pending" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(seenTokens).toEqual(["stale-token", "renewed-token"]);
  });

  it("does not request CSRF for safe reads", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: { id: "lesson-1" } }),
    );

    await apiRequest("/lessons/lesson-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/v1/lessons/lesson-1");
  });
});
