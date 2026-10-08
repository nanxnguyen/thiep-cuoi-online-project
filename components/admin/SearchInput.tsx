"use client";

import { useEffect, useRef, useState } from "react";

export type SearchInputProps = {
  defaultValue?: string;
  placeholder?: string;
  /** Debounce delay in ms (default 300). */
  delay?: number;
  ariaLabel?: string;
  /** Called with the debounced query; the signal aborts when a newer query supersedes it. */
  onSearch: (q: string, signal: AbortSignal) => void;
};

// Debounced search: waits `delay` after the last keystroke, aborts the
// previous in-flight request before firing the new one.
export function SearchInput({ defaultValue = "", placeholder = "Tìm kiếm…", delay = 300, ariaLabel, onSearch }: SearchInputProps) {
  const [text, setText] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      onSearchRef.current(text.trim(), controller.signal);
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, delay]);

  useEffect(() => () => inflight.current?.abort(), []);

  return (
    <div className="adm-search">
      <svg className="adm-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.8 10.8L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        id="adm-search"
        name="q"
        className="adm-search-input"
        type="search"
        value={text}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => setText(event.target.value)}
      />
      {text ? (
        <button type="button" className="adm-search-clear" aria-label="Xoá tìm kiếm" onClick={() => setText("")}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
