"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { author, nav, site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";
import { ChibiPeek } from "./chibi-peek";

/**
 * A floating pill bar, sticky at the top. On narrow screens the links drop to a
 * second row that scrolls sideways instead of collapsing into a menu — five
 * links fit, and a hidden menu costs a tap every visit.
 */
export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="no-print sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="relative mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-2 rounded-[28px] border border-rule bg-paper/80 py-2 pr-2 pl-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl md:flex-nowrap md:rounded-full">
        {/* Hangs from the bar's underside on the right, where page content
            leaves room. Desktop only — on phones the bar wraps to two rows
            and he would cover the nav. */}
        <ChibiPeek className="right-44 hidden md:block" />

        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="group flex shrink-0 items-center gap-2.5 rounded-full py-0.5 pr-3 pl-0.5"
        >
          <span className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-on-pop bg-pop-yellow">
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
                className={`shrink-0 rounded-full px-3 py-2 text-[15px] sm:px-4 font-semibold transition-colors ${
                  active
                    ? "bg-brand text-on-brand"
                    : "text-ink-muted hover:bg-paper-raised hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <ThemeToggle />
          <a
            href="/rss.xml"
            className="pill hidden items-center gap-2 rounded-full border-2 border-on-pop bg-brand px-4 py-2 text-[14px] font-semibold text-on-brand sm:inline-flex"
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
            Subscribe
          </a>
        </div>
      </div>
    </header>
  );
}
