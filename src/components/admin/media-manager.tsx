"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectMedia } from "@/content/types";
import { Button, TextInput } from "./form";

/**
 * Upload and arrange a project's screenshots.
 *
 * Dimensions are never typed by hand — the upload endpoint reads them from the
 * file and returns them, because a wrong number here means the page reflows as
 * images load. Alt text *is* typed by hand, and is the one field the editor
 * nags about: an undescribed screenshot is invisible to part of the audience.
 */
export function MediaManager({
  slug,
  media,
  onChange,
}: {
  /** Uploads are filed under this slug, so it must be saved before uploading. */
  slug: string;
  /** Tolerates undefined: records written before media existed lack the key. */
  media: ProjectMedia[] | undefined;
  onChange: (media: ProjectMedia[]) => void;
}) {
  const items = media ?? [];
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;

    if (!slug.trim()) {
      setError("Give the project a slug before uploading — it names the folder.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      /*
        Sequential rather than parallel: the endpoint appends -2, -3 to avoid
        clobbering a name that already exists, and concurrent uploads of two
        identically-named files could both see the name as free.
      */
      const uploaded: ProjectMedia[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("slug", slug.trim());

        const response = await fetch("/api/admin/media", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as
          | { ok: true; media: ProjectMedia }
          | { ok: false; error: string };

        if (!result.ok) throw new Error(result.error);
        uploaded.push(result.media);
      }

      onChange([...items, ...uploaded]);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
      // Clears the picker so the same file can be chosen again after a failure.
      if (input.current) input.current.value = "";
    }
  };

  const patch = (index: number, changes: Partial<ProjectMedia>) => {
    onChange(items.map((m, i) => (i === index ? { ...m, ...changes } : m)));
  };

  const remove = async (index: number) => {
    const [removed] = items.slice(index, index + 1);
    onChange(items.filter((_, i) => i !== index));

    // Best effort: the record is already gone, so a failed unlink only leaves
    // an orphaned file rather than a broken reference.
    try {
      await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: removed.src }),
      });
    } catch {
      // Ignored deliberately — see above.
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
          className="text-[13px] file:mr-3 file:cursor-pointer file:rounded-[3px] file:border file:border-rule file:bg-paper-raised file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:tracking-[0.1em] file:text-ink file:lowercase hover:file:border-accent hover:file:text-accent"
        />
        {busy ? (
          <span className="font-mono text-[11px] tracking-[0.1em] text-ink-muted lowercase">
            uploading…
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-red-400">
          {error}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <li
              key={item.src}
              className="flex gap-4 rounded-[3px] border border-rule bg-paper-raised p-3"
            >
              <Image
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                sizes="96px"
                className="h-16 w-24 shrink-0 rounded-[2px] border border-rule object-cover"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <TextInput
                  value={item.alt}
                  placeholder="Alt text — describe the image"
                  onChange={(e) => patch(index, { alt: e.target.value })}
                />
                <TextInput
                  value={item.caption ?? ""}
                  placeholder="Caption (optional)"
                  onChange={(e) => patch(index, { caption: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <span className="tabular font-mono text-[10px] tracking-[0.08em] text-ink-faint">
                    {item.width}×{item.height}
                  </span>
                  {!item.alt.trim() ? (
                    <span className="font-mono text-[10px] tracking-[0.08em] text-amber-400 lowercase">
                      needs alt text
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                >
                  ↓
                </Button>
                <Button type="button" onClick={() => remove(index)}>
                  ✕
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
