"use client";

import { useEffect, useRef, useState } from "react";

type Preview =
  | { kind: "idle" }
  | { kind: "rendering" }
  | { kind: "ready"; html: string }
  | { kind: "error"; message: string };

/** How long typing must pause before the preview recompiles. */
const DEBOUNCE_MS = 400;

/**
 * Split-view MDX editor: raw source on the left, rendered output on the right.
 *
 * The preview is compiled server-side through the same pipeline the published
 * article pages use, so code blocks are highlighted by shiki exactly as they
 * will be on the site — the pane is a real render, not an approximation.
 */
export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [preview, setPreview] = useState<Preview>({ kind: "idle" });
  const [showPreview, setShowPreview] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPreview) return;

    // Compiling on every keystroke would queue far more work than the pane can
    // display, so recompilation waits for a pause.
    const timer = setTimeout(async () => {
      setPreview((current) =>
        current.kind === "ready" ? current : { kind: "rendering" },
      );

      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: value }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          html?: string;
          error?: string;
        };

        setPreview(
          result.ok
            ? { kind: "ready", html: result.html ?? "" }
            : { kind: "error", message: result.error ?? "Could not render." },
        );
      } catch (error) {
        setPreview({ kind: "error", message: (error as Error).message });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, showPreview]);

  /**
   * Inserts a fenced code block, or wraps the selection in one. Tab and the
   * other markdown syntax are left to be typed by hand; a fence is the one
   * construct fiddly enough to be worth a shortcut.
   */
  const insertFence = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const { selectionStart: start, selectionEnd: end } = editor;
    const selected = value.slice(start, end);
    const fence = `\`\`\`ts\n${selected || ""}\n\`\`\``;

    onChange(value.slice(0, start) + fence + value.slice(end));

    // Put the caret on the language token so it can be replaced immediately.
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + 3, start + 5);
    });
  };

  /** Tab indents rather than moving focus, which matters inside code blocks. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();

    const editor = event.currentTarget;
    const { selectionStart: start, selectionEnd: end } = editor;

    onChange(`${value.slice(0, start)}  ${value.slice(end)}`);
    requestAnimationFrame(() => {
      editor.setSelectionRange(start + 2, start + 2);
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={insertFence}
          className="rounded-[3px] border border-rule px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-ink-muted hover:text-ink"
        >
          Code block
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          aria-pressed={showPreview}
          className={`rounded-[3px] border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
            showPreview
              ? "border-accent bg-accent-quiet text-accent"
              : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
          }`}
        >
          Preview
        </button>

        {preview.kind === "rendering" ? (
          <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
            Rendering…
          </span>
        ) : null}
      </div>

      {/*
        Stacked rather than side by side: prose and code both want width, and a
        half-width pane wraps lines that will not wrap on the published page,
        which makes the preview misleading about line length.
      */}
      <div className="flex flex-col gap-3">
        <textarea
          ref={editorRef}
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={22}
          className="admin-scroll w-full resize-y border border-rule bg-paper px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none transition-colors focus:border-accent"
        />

        {showPreview ? (
          <div
            ref={previewRef}
            className="admin-scroll max-h-[70vh] overflow-y-auto border border-rule bg-paper-raised px-6 py-5"
          >
            {preview.kind === "error" ? (
              <p className="font-mono text-[12px] leading-relaxed text-accent">
                {preview.message}
              </p>
            ) : preview.kind === "ready" && preview.html ? (
              // The HTML is produced by our own server from the author's own
              // input, in a panel that only runs locally.
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            ) : (
              <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
                Nothing to preview yet
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
