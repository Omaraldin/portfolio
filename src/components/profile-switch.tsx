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
    <div className="surface no-print mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-[20px] text-ink-muted sm:shrink-0" style={{ fontFamily: "var(--font-hand)" }}>
        pick a role
      </span>
      <div className="flex flex-wrap gap-2">
        {cvs.map((cv) => {
          const isActive = cv.handle === active;
          return (
            <Link
              key={cv.handle}
              href={`/cv/${cv.handle}`}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={`chip ${isActive ? "chip-active" : "hover:border-ink hover:text-ink"}`}
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
        className="btn btn-primary"
      >
        Download PDF ↓
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="btn"
      >
        Print
      </button>
    </div>
  );
}
