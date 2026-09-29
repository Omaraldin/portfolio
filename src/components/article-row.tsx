import Link from "next/link";
import type { ArticleMeta } from "@/content/types";
import { formatDate } from "@/lib/format";

/**
 * One article in a list: the date in the board's handwriting, then the title,
 * description and tags. Editorial rows rather than cards — writing is read, so
 * it is set like a table of contents, not like a product grid.
 */
export function ArticleRow({
  article,
  lead = false,
}: {
  article: ArticleMeta;
  /** The newest post: a larger title. */
  lead?: boolean;
}) {
  return (
    <Link
      href={`/writing/${article.slug}`}
      className="group grid gap-x-10 gap-y-2 border-t border-rule py-7 sm:grid-cols-[150px_1fr]"
    >
      <p
        className="tabular pt-1 text-[19px] text-ink-muted"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        {formatDate(article.date)}
        <span className="block text-[16px]">{article.readingTime} min read</span>
      </p>
      <div className="min-w-0">
        <h3
          className={`font-display leading-[1.08] font-extrabold tracking-[-0.03em] decoration-[color:var(--wb-red)] decoration-[3px] underline-offset-[6px] group-hover:underline ${
            lead ? "text-[32px] sm:text-[40px]" : "text-[24px] sm:text-[28px]"
          }`}
        >
          {article.title}
        </h3>
        {article.description ? (
          <p
            className={`mt-2 max-w-2xl leading-relaxed text-ink-muted ${
              lead ? "text-[19px]" : "text-[17px]"
            }`}
          >
            {article.description}
          </p>
        ) : null}
        {article.tags.length > 0 ? (
          <p className="mt-3 text-[14px] font-semibold text-accent">
            {article.tags.map((tag) => `#${tag}`).join("  ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
