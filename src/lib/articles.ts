import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Article, ArticleMeta } from "@/content/types";

const ARTICLES_DIR = path.join(process.cwd(), "src", "articles");

/** Average adult reading speed for technical prose, rounded up to the minute. */
const WORDS_PER_MINUTE = 200;

function readArticle(filename: string): Article | null {
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), "utf8");
  const { data, content } = matter(raw);

  // A post without a title or date is malformed rather than merely incomplete.
  if (!data.title || !data.date) return null;

  const words = content.trim().split(/\s+/).length;

  return {
    slug,
    title: String(data.title),
    description: String(data.description ?? ""),
    date: String(data.date),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    related: Array.isArray(data.related) ? data.related.map(String) : undefined,
    draft: Boolean(data.draft),
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    updated: data.updated ? String(data.updated) : undefined,
    readingTime: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
    body: content,
  };
}

function allArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map(readArticle)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Drafts are excluded from production but stay visible while developing. */
export function getArticles(): ArticleMeta[] {
  return allArticles()
    .filter((a) => !a.draft || process.env.NODE_ENV === "development")
    .map(({ body: _body, ...meta }) => meta);
}

export function getArticle(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}
