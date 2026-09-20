import type { UIMessage } from "ai";
import { useCallback, useEffect, useState } from "react";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = "cet-counsellor-threads-v1";
const EVENT = "cet-threads-changed";

export function newThreadId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event(EVENT));
}

export function getThread(id: string): Thread | undefined {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(thread: Thread) {
  const threads = loadThreads().filter((t) => t.id !== thread.id);
  saveThreads([thread, ...threads]);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function createThread(id = newThreadId()): Thread {
  const thread: Thread = { id, title: "New question", updatedAt: Date.now(), messages: [] };
  upsertThread(thread);
  return thread;
}

export function titleFromMessages(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New question";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New question";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

/** Reactive list of threads kept in sync with localStorage. */
export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);

  const refresh = useCallback(() => setThreads(loadThreads()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { threads, refresh };
}
