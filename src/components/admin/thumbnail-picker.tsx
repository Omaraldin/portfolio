"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectMedia } from "@/content/types";
import { Button, TextInput } from "./form";
import { deleteMedia, uploadMedia } from "./media-manager";

/**
 * The project's cover image. One slot: uploading replaces whatever is there,
 * and the replaced file is removed from disk so covers do not pile up.
 *
 * The preview is cropped to 16:10, the same shape cards use, so what you see
 * here is what the index shows.
 */
export function ThumbnailPicker({
  slug,
  thumbnail,
  onChange,
}: {
  /** Uploads are filed under this slug, so it must be set before uploading. */
  slug: string;
  thumbnail: ProjectMedia | undefined;
  onChange: (thumbnail: ProjectMedia | undefined) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;

    if (!slug.trim()) {
      setError("Give the project a slug before uploading — it names the folder.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const uploaded = await uploadMedia(file, slug.trim());
      const previous = thumbnail;
      // Keeps any alt text already written for the old cover.
      onChange({ ...uploaded, alt: previous?.alt ?? "" });
      if (previous) await deleteMedia(previous.src);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
      // Clears the picker so the same file can be chosen again after a failure.
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    if (!thumbnail) return;
    const { src } = thumbnail;
    onChange(undefined);
    await deleteMedia(src);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="group relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-[3px] border border-dashed border-rule bg-paper-raised transition-colors hover:border-accent sm:w-64"
      >
        {thumbnail ? (
          <Image
            src={thumbnail.src}
            alt=""
            fill
            sizes="256px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-mono text-[11px] tracking-[0.1em] text-ink-muted lowercase group-hover:text-accent">
            {busy ? "uploading…" : "+ upload cover"}
          </span>
        )}
        {thumbnail && busy ? (
          <span className="absolute inset-0 grid place-items-center bg-paper/70 font-mono text-[11px] text-ink">
            uploading…
          </span>
        ) : null}
      </button>

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        disabled={busy}
        onChange={(e) => upload(e.target.files?.[0])}
        className="hidden"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {thumbnail ? (
          <>
            <TextInput
              value={thumbnail.alt}
              placeholder="Alt text — describe the image"
              onChange={(e) => onChange({ ...thumbnail, alt: e.target.value })}
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="tabular font-mono text-[10px] tracking-[0.08em] text-ink-faint">
                {thumbnail.width}×{thumbnail.height}
              </span>
              {!thumbnail.alt.trim() ? (
                <span className="font-mono text-[10px] tracking-[0.08em] text-amber-400 lowercase">
                  needs alt text
                </span>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => input.current?.click()}
                disabled={busy}
              >
                Replace
              </Button>
              <Button type="button" onClick={remove} disabled={busy}>
                Remove
              </Button>
            </div>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Shown on project cards and at the top of the project page. 16:10
            crops best, e.g. 1600×1000. Without one, the first screenshot is
            used.
          </p>
        )}

        {error ? (
          <p className="font-mono text-[11px] tracking-[0.08em] text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
