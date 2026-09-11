import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { mdxComponents } from "@/components/mdx-components";
import { AuthorByline } from "@/components/author-byline";
import { getArticle, getArticles } from "@/lib/articles";
import { getProject } from "@/content/projects";
import { author, site } from "@/content/site";
import { formatDate } from "@/lib/format";

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
  const image = article.cover ?? site.ogImage;

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
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: article.coverAlt ?? article.title,
        },
      ],
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
    <article className="mx-auto max-w-[68ch] pt-16">
      <header className="border-b border-rule-strong pb-6">
        <Link
          href="/writing"
          className="font-mono text-[11px] tracking-[0.12em] text-ink-muted lowercase transition-colors hover:text-accent"
        >
          ← blogs
        </Link>
        <h1 className="mt-4 font-serif text-[48px] leading-[1.1] font-semibold lowercase">
          {article.title}
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase">
          {formatDate(article.date)} · {article.readingTime} min read
          {article.tags.length ? ` · ${article.tags.join(" · ")}` : ""}
        </p>
        {article.updated && article.updated !== article.date ? (
          <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-ink-faint uppercase">
            Updated {formatDate(article.updated)}
          </p>
        ) : null}
      </header>

      {article.cover ? (
        <Image
          src={article.cover}
          alt={article.coverAlt ?? ""}
          width={1600}
          height={900}
          priority
          sizes="(min-width: 768px) 68ch, 100vw"
          className="mt-8 h-auto w-full border border-rule bg-paper-raised"
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
        <aside className="mt-16 border-t border-rule-strong pt-6">
          <h2 className="font-mono text-[11px] tracking-[0.12em] text-ink-muted uppercase">
            Referenced work
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {related.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="text-[15px] text-accent underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                {project.title}
              </Link>
            ))}
          </div>
        </aside>
      ) : null}

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
