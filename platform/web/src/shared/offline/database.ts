import { openDB, type DBSchema } from "idb";

export type QueuedMutation = {
  id: string;
  path: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body: unknown;
  createdAt: string;
  attempts: number;
  state: "queued" | "conflict" | "failed";
};

interface InterviewDb extends DBSchema {
  mutations: { key: string; value: QueuedMutation; indexes: { "by-created": string } };
  cache: { key: string; value: { key: string; value: unknown; updatedAt: string } };
}

export const interviewDb = openDB<InterviewDb>("interview-platform", 1, {
  upgrade(database) {
    const mutations = database.createObjectStore("mutations", { keyPath: "id" });
    mutations.createIndex("by-created", "createdAt");
    database.createObjectStore("cache", { keyPath: "key" });
  },
});
