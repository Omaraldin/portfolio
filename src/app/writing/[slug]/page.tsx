import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { mdxComponents } from "@/components/mdx-components";
import { AuthorByline } from "@/components/author-byline";
import { ReactionBar } from "@/components/reaction-bar";
import { getArticle, getArticles } from "@/lib/articles";
import { getProject } from "@/content/projects";
import { author, site } from "@/content/site";
import { formatDate } from "@/lib/format";
import { popFill } from "@/components/ui";
import { ReadingProgress } from "@/components/reading-progress";

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(
  props: PageProps<"/writing/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) return {};

  const url = `${site.url}/writing/${slug}`;
  // Without an image a shared link renders as bare text, which is what kills
  // click-through, so an article with no cover of its own falls back to the
  // site card.
  const image = article.cover
    ? {
        url: article.cover,
        width: 1600,
        height: 900,
        alt: article.coverAlt ?? article.title,
      }
    : site.ogImage;

  return {
    title: article.title,
    description: article.description,
    // Tells search engines which URL is authoritative when the same article is
    // reachable through more than one path.
    alternates: { canonical: url },
    authors: [{ name: author.name, url: site.url }],
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url,
      siteName: site.name,
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: [author.name],
      tags: article.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

export default async function ArticlePage(
  props: PageProps<"/writing/[slug]">,
) {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) notFound();

  // Cross-references are resolved here so a stale slug drops the link rather
  // than rendering a dead one.
  const related = (article.related ?? [])
    .map(getProject)
    .filter((p) => p !== undefined);

  return (
    /*
      Long-form reading wants a measured column, so the whole article is capped
      and centred rather than left-aligned inside the full-width container —
      otherwise the rules and headings stretch across dead space to the right of
      the text.
    */
    <article className="mx-auto max-w-[70ch] pt-10 sm:pt-14">
      <ReadingProgress />
      <header>
        <Link
          href="/writing"
          className="pill inline-flex items-center gap-1.5 rounded-full border-2 border-rule px-4 py-2 text-[14px] font-semibold text-ink-muted hover:border-ink hover:text-ink"
        >
          <span aria-hidden>←</span> Blog
        </Link>
        {article.tags.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag, i) => (
              <span
                key={tag}
                className={`rounded-full border-2 border-rule px-3 py-1 font-mono text-[12px] font-semibold text-ink ${popFill(i + 1)}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <h1 className="mt-5 font-display text-[44px] leading-[1] font-extrabold tracking-[-0.045em] sm:text-[64px]">
          {article.title}
        </h1>
        {article.description ? (
          <p className="mt-5 text-[21px] leading-relaxed text-ink-muted">
            {article.description}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-rule py-4">
          <Image
            src={author.portrait}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-on-pop bg-pop-yellow object-cover"
          />
          <span className="text-[15px] font-semibold">{author.name}</span>
          <span className="tabular font-mono text-[13px] text-ink-muted">
            {formatDate(article.date)} · {article.readingTime} min read
            {article.updated && article.updated !== article.date
              ? ` · updated ${formatDate(article.updated)}`
              : ""}
          </span>
        </div>
      </header>

      {article.cover ? (
        <Image
          src={article.cover}
          alt={article.coverAlt ?? ""}
          width={1600}
          height={900}
          priority
          sizes="(min-width: 768px) 70ch, 100vw"
          className="mt-8 h-auto w-full rounded-[28px] border-2 border-on-pop bg-paper-raised"
        />
      ) : null}

      <div className="prose pt-10">
        <MDXRemote
          source={article.body}
          options={mdxOptions}
          components={mdxComponents}
        />
      </div>

      {related.length > 0 ? (
        <aside className="mt-16 rounded-[28px] border-2 border-rule bg-paper-raised p-6">
          <h2 className="font-mono text-[12px] font-semibold text-ink-muted">
            {"// referenced work"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="pill inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-4 py-1.5 text-[14px] font-semibold hover:bg-ink hover:text-paper"
              >
                {project.title} <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}

      <ReactionBar slug={slug} />

      <AuthorByline />

      {/*
        Structured data. This is what lets a search engine show the article with
        its date and author rather than as an anonymous page, and it states the
        same facts the visible byline does.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            dateModified: article.updated ?? article.date,
            author: {
              "@type": "Person",
              name: author.name,
              url: site.url,
            },
            publisher: { "@type": "Person", name: author.name },
            mainEntityOfPage: `${site.url}/writing/${slug}`,
            ...(article.cover ? { image: `${site.url}${article.cover}` } : {}),
            keywords: article.tags.join(", "),
          }),
        }}
      />
    </article>
  );
}
