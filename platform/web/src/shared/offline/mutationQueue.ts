import { apiRequest, ApiError } from "../api/client";
import { interviewDb, type QueuedMutation } from "./database";

export async function queueMutation(
  mutation: Omit<QueuedMutation, "id" | "createdAt" | "attempts" | "state">,
) {
  const item: QueuedMutation = {
    ...mutation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    attempts: 0,
    state: "queued",
  };
  await (await interviewDb).put("mutations", item);
  return item;
}

export async function flushMutationQueue() {
  const database = await interviewDb;
  const queued = await database.getAllFromIndex("mutations", "by-created");
  for (const item of queued) {
    try {
      await apiRequest(item.path, {
        method: item.method,
        body: JSON.stringify(item.body),
        headers: { "Idempotency-Key": item.id },
      });
      await database.delete("mutations", item.id);
    } catch (error) {
      const state = error instanceof ApiError && error.status === 409 ? "conflict" : "failed";
      await database.put("mutations", { ...item, attempts: item.attempts + 1, state });
      if (!navigator.onLine) break;
    }
  }
}
