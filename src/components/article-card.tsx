import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/content/types";
import { formatDate } from "@/lib/format";
import { popFill } from "./ui";
import { Emoji } from "./emoji";

/**
 * An article as a card. With no cover image the title itself becomes the art,
 * set big on a pop fill, so an index of text-only posts still reads as a wall
 * of colour rather than a list.
 */
export function ArticleCard({
  article,
  index,
  size = "md",
}: {
  article: ArticleMeta;
  index: number;
  /** `lg` lays out side by side on wide screens — the featured post. */
  size?: "md" | "lg";
}) {
  const lg = size === "lg";

  return (
    <Link
      href={`/writing/${article.slug}`}
      className={`pop-card group flex h-full overflow-hidden rounded-[28px] bg-paper ${
        lg ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden border-on-pop text-ink dark:border-rule ${popFill(index + 1)} ${
          lg
            ? "h-56 border-b-2 md:h-auto md:min-h-80 md:w-1/2 md:border-r-2 md:border-b-0"
            : "h-44 border-b-2"
        }`}
      >
        {article.cover ? (
          <Image
            src={article.cover}
            alt={article.coverAlt ?? ""}
            fill
            sizes={lg ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 p-6">
            <span className="font-mono text-[12px] font-semibold opacity-70">
              {"</>"} {article.tags[0] ?? "notes"}
            </span>
            <p
              className={`absolute right-6 bottom-5 left-6 font-display leading-[0.95] font-extrabold tracking-[-0.04em] transition-transform duration-300 group-hover:-rotate-1 ${
                lg ? "text-[40px] sm:text-[52px]" : "line-clamp-3 text-[30px]"
              }`}
            >
              {article.title}
            </p>
          </div>
        )}
        {lg ? (
          <span className="absolute top-5 right-5 rotate-6 rounded-full border-2 border-on-pop bg-white px-3 py-1 font-mono text-[11px] font-bold">
            <Emoji char="✨" /> latest
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${lg ? "p-7 md:p-10" : "p-6"}`}>
        <p className="tabular font-mono text-[12px] text-ink-muted">
          {formatDate(article.date)} · {article.readingTime} min read
        </p>
        <h3
          className={`mt-2 font-display leading-[1.08] font-extrabold tracking-[-0.03em] ${
            lg ? "text-[32px] sm:text-[40px]" : "text-[23px]"
          }`}
        >
          {article.title}
        </h3>
        {article.description ? (
          <p
            className={`mt-2.5 leading-relaxed text-ink-muted ${
              lg ? "text-[18px]" : "line-clamp-3 text-[16px]"
            }`}
          >
            {article.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-quiet px-2.5 py-1 font-mono text-[11px] font-medium text-accent"
            >
              #{tag}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-[14px] font-semibold text-accent">
            Read
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
