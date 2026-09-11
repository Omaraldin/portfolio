import type { Metadata } from "next";
import { getArticles } from "@/lib/articles";
import { ArticleRow } from "@/components/article-row";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on system design, data flow, and building across stacks.",
};

export default function WritingPage() {
  const articles = getArticles();

  return (
    <>
      <PageTitle
        index="INDEX / WRITING"
        title="Writing"
        intro="Notes on architecture, data flow, and what actually transfers between stacks."
      />

      {articles.length > 0 ? (
        <div>
          {articles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
          Nothing published yet
        </p>
      )}
    </>
  );
}
