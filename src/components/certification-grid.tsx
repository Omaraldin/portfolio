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
import { popFill } from "./ui";

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
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    <article className="pop-card h-full overflow-hidden rounded-[28px] bg-paper">
      {hasDocument ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${certification.name}`}
          className="group block w-full cursor-pointer overflow-hidden border-b-2 border-on-pop bg-paper-raised"
        >
          <div className="relative aspect-[4/3] w-full">
            {isPdf(certification.document) ? (
              <PdfThumbnail
                src={certification.document}
                className="h-full w-full transition-transform duration-500 group-hover:scale-105"
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
        <div
          className={`grid aspect-[4/3] w-full place-items-center border-b-2 border-on-pop text-ink dark:border-rule ${popFill(index)}`}
        >
          <span className="grid h-24 w-24 -rotate-6 place-items-center rounded-[28px] border-2 border-on-pop bg-white text-[48px] shadow-[5px_5px_0_0_var(--on-pop)]">
            <span aria-hidden>🏅</span>
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="min-w-0">
          <h3 className="font-display text-[20px] leading-tight font-bold tracking-[-0.02em]">
            {certification.url ? (
              <a
                href={certification.url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {certification.name}
                <span className="ml-1 font-mono text-[12px] text-accent">
                  ↗
                </span>
              </a>
            ) : (
              certification.name
            )}
          </h3>

          <p className="mt-2 font-mono text-[12px] text-ink-muted">
            {meta}
            {expired ? " · Lapsed" : ""}
          </p>

          {certification.credentialId ? (
            <p className="tabular mt-0.5 font-mono text-[11px] text-ink-faint">
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
          <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em]">{certification.name}</h2>
          <p className="mt-1 font-mono text-[12px] text-ink-muted">
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
            className="pill rounded-full border-2 border-ink px-4 py-2 text-[14px] font-semibold hover:bg-ink hover:text-paper"
          >
            Open original ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pill rounded-full border-2 border-ink px-4 py-2 text-[14px] font-semibold hover:bg-ink hover:text-paper"
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
            className="h-full w-full rounded-[20px] border-2 border-rule bg-paper-raised"
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-[20px] border-2 border-rule bg-white">
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
