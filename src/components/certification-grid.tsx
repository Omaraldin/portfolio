"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  hasExpired,
  isPdf,
  type Certification,
} from "@/content/certifications";
import { formatMonth } from "@/lib/format";
import { PdfThumbnail } from "./pdf-thumbnail";

/**
 * Certificates as a grid of document thumbnails. Clicking one opens the full
 * document in an overlay — images inline, PDFs in the browser's own viewer.
 */
export function CertificationGrid({
  certifications,
}: {
  certifications: Certification[];
}) {
  const [open, setOpen] = useState<Certification | null>(null);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    // The page behind must not scroll while the overlay is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification, index) => (
          <li key={certification.slug}>
            <Card
              certification={certification}
              index={index}
              onOpen={() => setOpen(certification)}
            />
          </li>
        ))}
      </ul>

      {open ? <Overlay certification={open} onClose={close} /> : null}
    </>
  );
}

function Card({
  certification,
  index,
  onOpen,
}: {
  certification: Certification;
  index: number;
  onOpen: () => void;
}) {
  const expired = hasExpired(certification);
  const hasDocument = Boolean(certification.document);

  const meta = [
    certification.issuer,
    certification.issued ? formatMonth(certification.issued) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article>
      {hasDocument ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${certification.name}`}
          className="group block w-full cursor-pointer overflow-hidden border border-rule bg-paper-raised transition-colors hover:border-accent"
        >
          <div className="relative aspect-[4/3] w-full">
            {isPdf(certification.document) ? (
              <PdfThumbnail
                src={certification.document}
                className="h-full w-full"
              />
            ) : (
              <Image
                src={certification.document}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="bg-white object-contain"
              />
            )}
          </div>
        </button>
      ) : (
        // No document yet: the slot still holds its place in the grid so the
        // rhythm does not break, and says plainly that nothing is attached.
        <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-rule">
          <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
            No document
          </span>
        </div>
      )}

      <div className="mt-3 flex items-baseline gap-3">
        <span className="tabular font-mono text-[11px] text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] leading-snug font-semibold">
            {certification.url ? (
              <a
                href={certification.url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {certification.name}
                <span className="ml-1 font-mono text-[10px] text-ink-faint">
                  ↗
                </span>
              </a>
            ) : (
              certification.name
            )}
          </h3>

          <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
            {meta}
            {expired ? " · Lapsed" : ""}
          </p>

          {certification.credentialId ? (
            <p className="tabular mt-0.5 font-mono text-[10px] text-ink-faint">
              ID {certification.credentialId}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Overlay({
  certification,
  onClose,
}: {
  certification: Certification;
  onClose: () => void;
}) {
  const pdf = isPdf(certification.document);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={certification.name}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col bg-paper p-4 sm:p-8"
    >
      <header className="mx-auto flex w-full max-w-5xl shrink-0 items-start justify-between gap-6 pb-4">
        <div>
          <h2 className="text-[18px] font-semibold">{certification.name}</h2>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
            {certification.issuer}
            {certification.issued ? ` · ${formatMonth(certification.issued)}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={certification.document}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-[3px] border border-rule px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Open original ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-[3px] border border-rule px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>
      </header>

      {/*
        Stops a click on the document itself from closing the overlay, which
        would make a PDF impossible to interact with.
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto min-h-0 w-full max-w-5xl flex-1"
      >
        {pdf ? (
          <iframe
            src={certification.document}
            title={certification.name}
            className="h-full w-full border border-rule bg-paper-raised"
          />
        ) : (
          <div className="relative h-full w-full border border-rule bg-white">
            <Image
              src={certification.document}
              alt={certification.name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
