"use client";

import Link from "next/link";
import { cvs } from "@/content/cvs";

/**
 * Role selector for the CV. Each version is a real URL so a specific CV can be
 * sent directly, and Next's client-side navigation keeps the switch instant.
 */
export function ProfileSwitch({ active }: { active: string }) {
  if (cvs.length < 2) return null;

  return (
    <div className="no-print flex flex-col gap-2 border-b border-rule py-5 sm:flex-row sm:items-center sm:gap-4">
      <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase sm:w-20 sm:shrink-0">
        Version
      </span>
      <div className="flex flex-wrap gap-1.5">
        {cvs.map((cv) => {
          const isActive = cv.handle === active;
          return (
            <Link
              key={cv.handle}
              href={`/cv/${cv.handle}`}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-[3px] border px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors ${
                isActive
                  ? "border-accent bg-accent-quiet text-accent"
                  : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
              }`}
            >
              {cv.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The PDF link is the primary action: it is the file a recruiter actually
 * keeps, and it is generated for machine parsing rather than being a print of
 * the page.
 */
export function CVActions({ handle }: { handle: string }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <a
        href={`/cv/${handle}.pdf`}
        className="rounded-[3px] border border-accent bg-accent-quiet px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] text-accent uppercase transition-opacity hover:opacity-80"
      >
        Download PDF ↓
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-[3px] border border-rule px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors hover:border-accent hover:text-accent"
      >
        Print
      </button>
    </div>
  );
}
