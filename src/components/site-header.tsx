"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="no-print pt-8 pb-2">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={site.name}
          /*
            leading-none clips this face — its ascenders and descenders both
            overshoot the em box — so the line box is opened up instead.
          */
          /*
            justify-items-center so the shorter word centres in the shared grid
            cell rather than left-aligning against the wider one — the cell is
            sized by the longer of the two.
          */
          className="group relative grid justify-items-center font-script text-[42px] leading-[1.4] text-accent sm:text-[50px]"
        >
          {/*
            Both words occupy the same grid cell so the header does not resize
            when they swap, and the wider of the two sets the width. Hidden from
            assistive tech because the link already carries an accessible name —
            otherwise it announces as both names at once.
          */}
          <span
            aria-hidden
            className="col-start-1 row-start-1 transition-opacity duration-200 group-hover:opacity-0"
          >
            {site.name}
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            {site.handle}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
          {nav.map((item, i) => {
            /*
              "/" would otherwise prefix-match every route, so home is only
              active on an exact match.
            */
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <span key={item.href} className="flex items-center gap-1">
                {i > 0 ? (
                  <span aria-hidden className="text-ink-faint select-none">
                    -
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-1.5 py-1 font-serif text-[20px] leading-none transition-colors ${
                    active ? "text-accent" : "text-ink hover:text-accent"
                  }`}
                >
                  {item.label}
                </Link>
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
