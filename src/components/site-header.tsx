"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { author, nav, site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";
import { ChibiPeek } from "./chibi-peek";
import { MarkerUnderline } from "./ui";

/**
 * A plain bar, sticky at the top, with a hairline beneath. The current page is
 * marked with the board's red marker stroke rather than a filled pill. On
 * narrow screens the links drop to a second row that scrolls sideways instead
 * of collapsing into a menu — four links fit, and a hidden menu costs a tap.
 */
export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6 md:flex-nowrap">
        {/* Hangs from the bar's underside on the right, where page content
            leaves room. Desktop only — on phones the bar wraps to two rows
            and he would cover the nav. */}
        {pathname !== "/" ? (
          <ChibiPeek className="right-44 hidden md:block" />
        ) : null}

        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="group flex shrink-0 items-center gap-2.5 rounded-lg py-0.5 pr-3"
        >
          <span className="relative h-9 w-9 overflow-hidden rounded-full border border-rule">
            <Image
              src={author.portrait}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </span>
          <span className="font-display text-[19px] font-extrabold tracking-[-0.03em]">
            {site.handle}
            <span className="text-accent">.</span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="no-scrollbar order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 md:order-none md:mx-auto md:w-auto md:justify-center"
        >
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 px-3 py-2 text-[15px] font-semibold transition-colors sm:px-4 ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
                {active ? (
                  // An SVG does not stretch between left/right offsets, so a span
                  // sets the width and the stroke fills it.
                  <span className="absolute inset-x-3 bottom-0.5 sm:inset-x-4">
                    <MarkerUnderline className="w-full" />
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <ThemeToggle />
          {/* Labelled for what it is: the feed, not an email signup. */}
          <a
            href="/rss.xml"
            className="btn btn-primary btn-sm hidden sm:inline-flex"
            aria-label="RSS feed"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="currentColor"
            >
              <circle cx="5" cy="19" r="2.5" />
              <path d="M2.5 9.5a12 12 0 0 1 12 12h-3.2a8.8 8.8 0 0 0-8.8-8.8zM2.5 2.5a19 19 0 0 1 19 19h-3.2A15.8 15.8 0 0 0 2.5 5.7z" />
            </svg>
            RSS
          </a>
        </div>
      </div>
    </header>
  );
}
