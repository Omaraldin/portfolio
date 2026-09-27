import Link from "next/link";
import { site } from "@/content/site";
import { Chibi } from "./chibi";

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
      <div className="relative mx-auto w-full max-w-[1240px] pt-28 sm:pt-36">
        {/*
          The chibi fills the top padding exactly (same height), so his feet
          land on the card's edge. He sits outside the card's clipped box so the
          rounded corner never cuts him off.
        */}
        <div className="absolute top-0 right-6 flex translate-y-1.5 items-end gap-2 sm:right-16">
          <p className="mb-16 hidden rounded-[18px] rounded-br-sm border-2 border-on-pop bg-white px-4 py-2 text-[14px] font-semibold text-on-pop shadow-[3px_3px_0_0_var(--on-pop)] sm:block">
            see you next post 👋
          </p>
          <Chibi className="h-28 sm:h-36" sizes="110px" />
        </div>
        <div className="relative overflow-hidden rounded-[36px] bg-night px-6 py-14 text-white sm:px-12 sm:py-16">
          {/* Decorative blobs. Behind the text, never under a link. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-pop-yellow opacity-15 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-[13px] text-pop-yellow">
                {"$ tail -f omaraldin.log"}
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-[40px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[64px]">
                Thanks for{" "}
                <span className="inline-block -rotate-1 rounded-2xl bg-pop-yellow px-3 text-on-pop">
                  reading.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">
                I post what I build and what I learn building it. Follow along
                wherever suits you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <a
                  href="/rss.xml"
                  className="pill inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-2.5 text-[15px] font-semibold text-night"
                >
                  RSS feed
                </a>
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pill inline-flex items-center rounded-full border-2 border-white/30 px-5 py-2.5 text-[15px] font-semibold hover:border-white"
                  >
                    {social.label}
                  </a>
                ))}
                <a
                  href={`mailto:${site.email}`}
                  className="pill inline-flex items-center rounded-full border-2 border-white/30 px-5 py-2.5 text-[15px] font-semibold hover:border-white"
                >
                  Email
                </a>
              </div>
            </div>

            <nav aria-label="Footer" className="lg:justify-self-end">
              <p className="font-mono text-[12px] text-white/50">
                {"// around the site"}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5">
                {MORE.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[17px] font-semibold text-white/80 transition-colors hover:text-pop-yellow"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="relative mt-14 flex flex-col gap-2 border-t border-white/15 pt-6 font-mono text-[12px] text-white/55 sm:flex-row sm:justify-between">
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
