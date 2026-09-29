"use client";

import { useMemo, useState } from "react";
import type { ArticleMeta } from "@/content/types";
import { ArticleRow } from "./article-row";

/**
 * The blog index: every post as an editorial row, newest first with a larger
 * title, filterable by tag. Filtering is client-side over the already
 * rendered list, so it is instant and needs no navigation.
 */
export function WritingIndex({ articles }: { articles: ArticleMeta[] }) {
  const [tag, setTag] = useState<string | null>(null);

  // Most-used first, so the useful filters lead.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articles) {
      for (const t of article.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [articles]);

  const visible = tag ? articles.filter((a) => a.tags.includes(tag)) : articles;
  // The feature slot only makes sense on the unfiltered, newest-first list.
  const [feature, ...rest] = tag ? [undefined, ...visible] : visible;

  return (
    <div>
      {tags.length > 1 ? (
        <div className="flex flex-wrap gap-2 pb-8">
          <TagPill active={tag === null} onClick={() => setTag(null)}>
            All posts
          </TagPill>
          {tags.map((t) => (
            <TagPill key={t} active={tag === t} onClick={() => setTag(t)}>
              #{t}
            </TagPill>
          ))}
        </div>
      ) : null}

      <div className="border-b border-rule">
        {feature ? <ArticleRow article={feature} lead /> : null}
        {rest.map((article) =>
          article ? <ArticleRow key={article.slug} article={article} /> : null,
        )}
      </div>
    </div>
  );
}

function TagPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pill rounded-full border-2 px-4 py-2 text-[14px] font-semibold ${
        active
          ? "border-on-pop bg-brand text-on-brand"
          : "border-rule bg-paper text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
