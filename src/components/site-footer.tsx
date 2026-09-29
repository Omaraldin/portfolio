import Link from "next/link";
import { site } from "@/content/site";

/*
  Everything a reader might want once they reach the bottom: where to follow
  along, and the pages that are useful but not headline — the CV among them.
*/
const MORE = [
  { label: "Blog", href: "/writing" },
  { label: "Work", href: "/work" },
  { label: "Certifications", href: "/certifications" },
  { label: "About", href: "/about" },
  { label: "CV", href: "/cv" },
];

export function SiteFooter() {
  return (
    <footer className="no-print px-3 pb-3 sm:px-6 sm:pb-6">
      {/*
        The chibi who stands on this card lives in ChibiDock, rendered just
        above the footer in the root layout: on phones he rides along the
        bottom of the screen and lands here.
      */}
      <div className="relative mx-auto w-full max-w-[1240px]">
        {/*
          A chalkboard in both themes: the home page hangs a whiteboard, the
          footer closes on its dark sibling, framed the same way.
        */}
        <div className="relative rounded-[22px] border-[6px] border-[#34443b] bg-[#1f2b25] px-6 py-14 text-[#ecebe3] sm:px-12 sm:py-16">

          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {/* Chalk on the dark panel: the same hand as the board. */}
              <h2
                className="max-w-2xl text-[44px] leading-[1.05] font-bold sm:text-[60px]"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                Thanks for reading.
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">
                I post what I build and what I learn building it. Follow along
                wherever suits you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <a
                  href="/rss.xml"
                  className="btn border-[#ecebe3] bg-[#ecebe3] text-[#1f2b25] hover:bg-transparent hover:text-[#ecebe3]"
                >
                  RSS feed
                </a>
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn border-white/35 text-[#ecebe3] hover:border-[#ecebe3] hover:bg-transparent hover:text-[#ecebe3]"
                  >
                    {social.label}
                  </a>
                ))}
                <a
                  href={`mailto:${site.email}`}
                  className="btn border-white/35 text-[#ecebe3] hover:border-[#ecebe3] hover:bg-transparent hover:text-[#ecebe3]"
                >
                  Email
                </a>
              </div>
            </div>

            <nav aria-label="Footer" className="lg:justify-self-end">
              <p className="text-[20px] text-white/60" style={{ fontFamily: "var(--font-hand)" }}>
                around the site
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5">
                {MORE.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[17px] font-semibold text-white/80 transition-colors hover:text-[#9fd4a2]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="relative mt-14 flex flex-col gap-2 border-t border-white/15 pt-6 text-[14px] text-white/55 sm:flex-row sm:justify-between">
            <span>
              © {new Date().getFullYear()} {site.name} · {site.location}
            </span>
            <span>problem first, tools second.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
