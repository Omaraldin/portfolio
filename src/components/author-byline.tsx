import Image from "next/image";
import Link from "next/link";
import { author, site } from "@/content/site";

/**
 * Byline at the foot of an article. Answers the question a reader has after
 * finishing something technical — who wrote this, and why should I weigh it.
 */
export function AuthorByline() {
  return (
    <aside className="mt-16 flex items-start gap-5 rounded-[28px] border-2 border-rule bg-tint-1 p-6 text-ink sm:p-8">
      {author.portrait ? (
        <Image
          src={author.portrait}
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 -rotate-6 rounded-[22px] border-2 border-on-pop bg-pop-yellow object-cover"
        />
      ) : (
        // Initials keep the block's shape while there is no photograph, rather
        // than collapsing the layout or showing a broken image.
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-on-pop bg-pop-yellow font-mono text-[15px]"
        >
          {author.name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() ?? "")
            .join("")}
        </span>
      )}

      <div className="min-w-0">
        <p className="text-[19px]" style={{ fontFamily: "var(--font-hand)" }}>
          written by
        </p>
        <p className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.02em]">
          {author.name}
        </p>
        <p className="mt-1 max-w-prose text-[16px] leading-relaxed">
          {author.bio}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/about"
            className="pill inline-flex rounded-full border-2 border-on-pop bg-brand px-4 py-1.5 text-[14px] font-semibold text-on-brand"
          >
            More about me
          </Link>
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="pill inline-flex rounded-full border-2 border-on-pop bg-white px-4 py-1.5 text-[14px] font-semibold"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
