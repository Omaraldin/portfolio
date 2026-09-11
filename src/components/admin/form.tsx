"use client";

import { useState } from "react";

/**
 * Form primitives for the admin panel. They reuse the site's tokens so the
 * panel reads as part of the same document rather than as a bolted-on tool.
 */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </span>
      {hint ? (
        <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">
          {hint}
        </span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full border border-rule bg-paper px-3 py-2 text-[15px] text-ink outline-none transition-colors focus:border-accent";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea({
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`${inputClass} resize-y leading-relaxed`}
    />
  );
}

export function MonoArea({
  rows = 20,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      spellCheck={false}
      className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
    />
  );
}

/** Multi-select rendered as toggle chips, matching the site's filter bars. */
export function ChipSelect<T extends string>({
  options,
  labels,
  selected,
  onChange,
}: {
  options: readonly T[];
  labels: Record<T, string>;
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(
                active
                  ? selected.filter((s) => s !== option)
                  : [...selected, option],
              )
            }
            className={`rounded-[3px] border px-2 py-1 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors ${
              active
                ? "border-accent bg-accent-quiet text-accent"
                : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}

export function Button({
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger";
}) {
  const styles = {
    default: "border-rule text-ink hover:border-ink-muted",
    primary: "border-accent bg-accent-quiet text-accent hover:opacity-80",
    danger: "border-rule text-ink-muted hover:border-accent hover:text-accent",
  }[variant];

  return (
    <button
      {...props}
      className={`rounded-[3px] border px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors disabled:opacity-40 ${styles}`}
    />
  );
}

/**
 * Edits a list of short strings as one-per-line text, which is far quicker than
 * managing add and remove buttons for things like a tech stack.
 */
export function LineList({
  value,
  onChange,
  rows = 4,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  rows?: number;
}) {
  // Kept as raw text while focused so a trailing newline does not vanish
  // mid-typing; the parsed value is what leaves the component.
  const [text, setText] = useState(value.join("\n"));

  return (
    <MonoArea
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

/** Inline save state, so the panel never needs a toast system. */
export function SaveState({
  state,
}: {
  state: { kind: "idle" | "saving" | "saved" } | { kind: "error"; message: string };
}) {
  if (state.kind === "idle") return null;

  const isError = state.kind === "error";
  const text = isError
    ? state.message
    : state.kind === "saving"
      ? "Saving…"
      : "Saved";

  return (
    <span
      role="status"
      className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
        isError ? "text-accent" : "text-ink-muted"
      }`}
    >
      {text}
    </span>
  );
}
