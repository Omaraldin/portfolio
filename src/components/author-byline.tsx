import Image from "next/image";
import Link from "next/link";
import { author, site } from "@/content/site";

/**
 * Byline at the foot of an article. Answers the question a reader has after
 * finishing something technical — who wrote this, and why should I weigh it.
 */
export function AuthorByline() {
  return (
    <aside className="surface mt-16 flex items-start gap-5 p-6 text-ink sm:p-8">
      {author.portrait ? (
        <Image
          src={author.portrait}
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 rounded-full border border-rule object-cover"
        />
      ) : (
        // Initials keep the block's shape while there is no photograph, rather
        // than collapsing the layout or showing a broken image.
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-rule bg-paper-raised text-[15px] font-semibold"
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
            className="btn btn-primary btn-sm"
          >
            More about me
          </Link>
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
