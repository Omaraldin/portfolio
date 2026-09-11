import Image from "next/image";
import Link from "next/link";
import { author, site } from "@/content/site";

/**
 * Byline at the foot of an article. Answers the question a reader has after
 * finishing something technical — who wrote this, and why should I weigh it.
 */
export function AuthorByline() {
  return (
    <aside className="mt-16 flex items-start gap-4 border-t border-rule-strong pt-6">
      {author.portrait ? (
        <Image
          src={author.portrait}
          alt=""
          width={56}
          height={56}
          className="shrink-0 rounded-full border border-rule object-cover"
        />
      ) : (
        // Initials keep the block's shape while there is no photograph, rather
        // than collapsing the layout or showing a broken image.
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-rule font-mono text-[15px] text-ink-muted"
        >
          {author.name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() ?? "")
            .join("")}
        </span>
      )}

      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
          Written by
        </p>
        <p className="mt-1 text-[16px] font-semibold">{author.name}</p>
        <p className="mt-1 max-w-prose text-[14px] leading-relaxed text-ink-muted">
          {author.bio}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/about"
            className="font-mono text-[10px] tracking-[0.1em] text-accent uppercase transition-opacity hover:opacity-70"
          >
            More about me →
          </Link>
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:text-accent"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
