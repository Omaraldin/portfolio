import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getArticles } from "@/lib/articles";
import { WritingIndex } from "@/components/writing-index";
import { EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  path: "/writing",
  title: "Blog",
  description:
    "Notes on system design, data flow, and building across stacks.",
});

export default function WritingPage() {
  const articles = getArticles();

  return (
    <>
      <PageTitle
        index="the blog"
        title="Thinking out loud"
        intro="Notes on architecture, data flow, and what actually transfers between stacks. No hot takes — just what held up in production."
      />

      {articles.length > 0 ? (
        <WritingIndex articles={articles} />
      ) : (
        <EmptyState>First article is cooking ✍️</EmptyState>
      )}
    </>
  );
}
