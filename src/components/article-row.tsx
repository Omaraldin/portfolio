import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/content/types";
import { formatDate } from "@/lib/format";

export function ArticleRow({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/writing/${article.slug}`}
      /*
        The rail is the left border; the dot is an ::before-style span pinned
        onto it. No bottom rule — the continuous rail is what separates rows.
      */
      className="group relative flex items-start gap-5 border-l-2 border-rule-strong py-5 pl-7"
    >
      {/*
        The ring is drawn in the page ground rather than left transparent, so
        the rail passing behind the dot is masked instead of showing through it.
      */}
      <span
        aria-hidden
        className="absolute top-1/2 -left-[9px] h-[16px] w-[16px] -translate-y-1/2 rounded-full border-4 border-paper bg-accent"
      />
      {article.cover ? (
        <Image
          src={article.cover}
          alt=""
          width={160}
          height={90}
          sizes="160px"
          className="hidden h-[72px] w-32 shrink-0 border border-rule bg-paper-raised object-cover sm:block"
        />
      ) : null}

      <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="relative font-serif text-[26px] leading-tight font-semibold lowercase">
          {article.title}
          <span
            aria-hidden
            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100"
          />
        </h3>
        <span className="tabular font-mono text-[11px] text-ink-muted">
          {formatDate(article.date)} · {article.readingTime} min
        </span>
      </div>

      {article.description ? (
        <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {article.description}
        </p>
      ) : null}

      {article.tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-x-3">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      </div>
    </Link>
  );
}
