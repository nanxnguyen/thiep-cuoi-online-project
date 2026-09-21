"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

// Debounced, serialized autosave for a draft that is REPLACED (never mutated) on every edit, so "changed" is a
// reference comparison. Never two saves in flight: edits that arrive during a save are picked up by the same loop.
// `flush()` saves right now and resolves when the server has the latest draft (used before publishing).
export function useAutosave<T>(
  value: T | null,
  save: (value: T, options: { keepalive: boolean }) => Promise<void>,
  { enabled, delay = 800 }: { enabled: boolean; delay?: number },
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const latest = useRef(value);
  latest.current = value;
  const saved = useRef<T | null>(null); // the last draft the server acknowledged
  const running = useRef<Promise<void> | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const saveRef = useRef(save);
  saveRef.current = save;

  const isDirty = () => latest.current !== null && latest.current !== saved.current;

  const run = useCallback((keepalive = false): Promise<void> => {
    if (running.current) return running.current;
    const task = (async () => {
      try {
        while (isDirty()) {
          const snapshot = latest.current as T;
          setStatus("saving");
          await saveRef.current(snapshot, { keepalive });
          saved.current = snapshot;
        }
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        running.current = null;
      }
    })();
    running.current = task;
    return task;
  }, []);

  useEffect(() => {
    if (!enabled || !isDirty()) return;
    setStatus("dirty");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void run(), delay);
    return () => window.clearTimeout(timer.current);
  }, [value, enabled, delay, run]);

  // Leaving the tab: push whatever is pending while the page can still send a request.
  useEffect(() => {
    const flushOnHide = () => {
      if (isDirty()) void run(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushOnHide();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushOnHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushOnHide);
    };
  }, [run]);

  return {
    status,
    retry: () => void run(),
    flush: () => run(),
    /** Tell the hook the server already has this draft (call once, right after loading). */
    markSaved: (draft: T) => {
      saved.current = draft;
    },
  };
}
