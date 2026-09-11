"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * A collapsible home-page section.
 *
 * Built on native <details>/<summary> rather than a div with state, so the
 * section is expandable before hydration, keyboard-operable for free, and
 * findable by in-page search when open. The one-at-a-time behaviour is layered
 * on top by `name`, which browsers implement natively as an exclusive
 * accordion group.
 *
 * Note the deliberate absence of an open-state React value: letting <details>
 * own it avoids fighting the element over a value it already tracks.
 */
export function AccordionSection({
  title,
  href,
  hrefLabel,
  defaultOpen = false,
  children,
}: {
  title: string;
  /** Optional "view all" link, shown in the header when the section is open. */
  href?: string;
  hrefLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /*
      Safari and Firefox only shipped exclusive accordions (the `name`
      attribute) recently. Where it is missing, closing the siblings by hand
      keeps the behaviour identical rather than silently degrading to
      independent sections.
    */
    if ("name" in HTMLDetailsElement.prototype) return;

    const onToggle = () => {
      if (!node.open) return;
      const group = node.parentElement;
      if (!group) return;
      for (const other of group.querySelectorAll("details")) {
        if (other !== node) other.open = false;
      }
    };

    node.addEventListener("toggle", onToggle);
    return () => node.removeEventListener("toggle", onToggle);
  }, []);

  return (
    <details
      ref={ref}
      name="home-section"
      open={defaultOpen}
      className="group/accordion border-b border-rule"
    >
      <summary
        /*
          list-none plus the ::-webkit-details-marker rule in globals.css drops
          the native triangle; the chevron below replaces it so the affordance
          matches the rest of the page.
        */
        className="flex cursor-pointer list-none items-center gap-4 py-6"
      >
        <span
          aria-hidden
          className="h-[14px] w-[14px] shrink-0 bg-accent transition-transform duration-200 group-open/accordion:rotate-45"
        />

        <h2 className="font-serif text-[30px] leading-none font-semibold lowercase">
          {title}
        </h2>

        <span aria-hidden className="flex-1" />

        {href ? (
          /*
            Nested inside <summary>, so a click would toggle the section as well
            as navigate. stopPropagation keeps the link a link.
          */
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="hidden font-mono text-[11px] font-medium tracking-[0.12em] text-accent lowercase transition-opacity group-open/accordion:inline hover:opacity-70"
          >
            {hrefLabel ?? "view all"} →
          </Link>
        ) : null}

        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink-muted transition-transform duration-200 group-open/accordion:-rotate-180"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="pb-8">{children}</div>
    </details>
  );
}
