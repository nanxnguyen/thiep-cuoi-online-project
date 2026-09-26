"use client";

import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { Content } from "@/lib/content";
import "@/components/studio/panels.css";

// Small controlled field kit shared by every Studio panel. Built on the global .field/.input/.select/
// .textarea classes; every control has a visible label, hints and errors are wired with aria-describedby,
// and the error slot is always mounted so aria-live announces it the moment it fills.

export type PanelProps = { content: Content; onChange: (next: Content) => void };
export type Option = { value: string; label: string };

// Mirrors `httpUrl` in lib/content.ts: what the backend accepts for a link.
export const isHttpUrl = (v: string) => v.length <= 500 && /^https?:\/\/\S+$/i.test(v);

// ---------- icons ----------
const GLYPHS = {
  up: "M12 19V5m0 0-6 6m6-6 6 6",
  down: "M12 5v14m0 0-6-6m6 6 6-6",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  upload: "M12 16V4m0 0-4 4m4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3",
  close: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5l4.5 4.5L19 7",
  music: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  image: "M4 5h16v14H4zM4 16l4.5-4.5L13 16m-1.5-1.5 2-2L20 19M9 9.5h.01",
} as const;
export type GlyphName = keyof typeof GLYPHS;

// Decorative: the button or heading next to it carries the meaning.
export function Glyph({ name, size = 20 }: { name: GlyphName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={GLYPHS[name]} />
    </svg>
  );
}

// ---------- buttons ----------
type IconButtonProps = { label: string; tone?: "danger" } & Omit<ComponentPropsWithoutRef<"button">, "type" | "className" | "aria-label" | "title">;

// 40px round icon button. `label` is both the accessible name and the tooltip.
export function IconButton({ label, tone, children, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={`pn-icon-btn${tone === "danger" ? " pn-icon-btn--danger" : ""}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function AddButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="button-ghost pn-add" data-add="" onClick={onClick} disabled={disabled}>
      <Glyph name="plus" />
      {children}
    </button>
  );
}

// Reordering or deleting re-creates or moves DOM nodes, which drops keyboard focus to <body>.
// Call focusNext(itemKey, action) with the same handler that changes the list; after the next render
// focus lands on that item's button (or the section's add button when the list is now empty).
// Items need data-key, their buttons data-act="up" | "down" | "remove".
export function useListFocus<T extends HTMLElement>() {
  const listRef = useRef<T>(null);
  const wanted = useRef<{ key: string | null; act: string } | null>(null);
  useEffect(() => {
    const want = wanted.current;
    const list = listRef.current;
    if (!want || !list) return;
    wanted.current = null;
    const item = Array.from(list.querySelectorAll<HTMLElement>("[data-key]")).find((el) => el.dataset.key === want.key);
    const enabled = (root: ParentNode | null | undefined, sel: string) => root?.querySelector<HTMLElement>(`${sel}:not(:disabled)`) ?? null;
    (enabled(item, `[data-act="${want.act}"]`) ?? enabled(item, "[data-act]") ?? enabled(list.closest("section"), "[data-add]"))?.focus();
  });
  return {
    listRef,
    focusNext(key: string | null, act: string) {
      wanted.current = { key, act };
    },
  };
}

// ---------- layout ----------
export function PanelSection({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section className="pn-section card" aria-labelledby={id} data-section={title}>
      <header className="pn-section__head">
        <div>
          <h3 id={id}>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="pn-section__body">{children}</div>
    </section>
  );
}

// ---------- fields ----------
type Meta = { label: string; hint?: string; error?: string };

function Shell({ id, label, hint, error, counter, children }: Meta & { id: string; counter?: ReactNode; children: ReactNode }) {
  return (
    <div className="field pn-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint || counter ? (
        <div className="pn-meta">
          {hint ? <small id={`${id}-hint`}>{hint}</small> : <span />}
          {counter}
        </div>
      ) : null}
      <small id={`${id}-err`} className="pn-error" aria-live="polite">
        {error || null}
      </small>
    </div>
  );
}

const describedBy = (id: string, hint?: string, counter?: boolean) =>
  [hint ? `${id}-hint` : "", counter ? `${id}-count` : "", `${id}-err`].filter(Boolean).join(" ");

type TextFieldProps = Meta & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "date" | "time";
  inputMode?: "text" | "numeric" | "url";
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export function TextField({ label, hint, error, value, onChange, onBlur, type = "text", inputMode, maxLength, placeholder, autoComplete = "off", autoFocus }: TextFieldProps) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint)}
      />
    </Shell>
  );
}

// With maxLength it shows a live "used/limit" counter; the browser enforces the limit itself.
export function TextAreaField({ label, hint, error, value, onChange, maxLength, rows = 4, placeholder }: Meta & { value: string; onChange: (value: string) => void; maxLength?: number; rows?: number; placeholder?: string }) {
  const id = useId();
  const counter = maxLength ? (
    <small id={`${id}-count`} className={`pn-counter${value.length >= maxLength * 0.9 ? " pn-counter--warn" : ""}`}>
      <span className="pn-sr">Đã nhập </span>
      {value.length}/{maxLength}
      <span className="pn-sr"> ký tự</span>
    </small>
  ) : null;
  return (
    <Shell id={id} label={label} hint={hint} error={error} counter={counter}>
      <textarea
        id={id}
        className="textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, Boolean(counter))}
      />
    </Shell>
  );
}

// `placeholder` adds a leading "nothing chosen" option with value "".
export function SelectField({ label, hint, error, value, onChange, options, placeholder, autoFocus }: Meta & { value: string; onChange: (value: string) => void; options: readonly Option[]; placeholder?: string; autoFocus?: boolean }) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint)}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

// A real checkbox (role="switch") stretched over the whole row, so the target is the row and
// keyboard, screen readers and form semantics come from the platform.
export function ToggleField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <label className="pn-toggle">
      <input
        type="checkbox"
        role="switch"
        className="pn-toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      <span className="pn-toggle__text">
        <strong id={`${id}-label`}>{label}</strong>
        {hint ? <small id={`${id}-hint`}>{hint}</small> : null}
      </span>
      <span className="pn-toggle__track" aria-hidden="true">
        <span className="pn-toggle__thumb" />
      </span>
    </label>
  );
}
