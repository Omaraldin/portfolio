import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import {
  assertSafeSlug,
  deleteArticleFile,
  readArticleFile,
  renameArticleFile,
  writeArticleFile,
  type ArticleFile,
} from "@/lib/admin-store";

function parseArticle(input: unknown): ArticleFile {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected an object.");
  }
  const a = input as Record<string, unknown>;

  const slug = String(a.slug ?? "").trim();
  assertSafeSlug(slug);

  const title = String(a.title ?? "").trim();
  if (!title) throw new Error("A title is required.");

  const date = String(a.date ?? "").trim();
  // The date sorts the index and is parsed as an ISO instant, so its shape
  // cannot be left to the caller.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date must be in YYYY-MM-DD form.");
  }

  const list = (key: string): string[] =>
    Array.isArray(a[key])
      ? (a[key] as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
      : [];

  const str = (key: string) =>
    typeof a[key] === "string" ? (a[key] as string).trim() : "";

  // The cover is rendered by next/image and shared as a social preview, so it
  // has to be a real path inside /public rather than an arbitrary URL.
  const cover = str("cover");
  if (cover && !/^\/[\w\-./]+\.(png|jpe?g|webp|avif|gif)$/i.test(cover)) {
    throw new Error(
      "The cover must be a path under /public, e.g. /articles/post.jpg",
    );
  }
  if (cover.includes("..")) {
    throw new Error("The cover path may not traverse directories.");
  }

  const updated = str("updated");
  if (updated && !/^\d{4}-\d{2}-\d{2}$/.test(updated)) {
    throw new Error("The updated date must be in YYYY-MM-DD form.");
  }

  return {
    slug,
    title,
    description: String(a.description ?? "").trim(),
    date,
    tags: list("tags"),
    related: list("related"),
    draft: Boolean(a.draft),
    cover,
    coverAlt: str("coverAlt"),
    updated,
    body: String(a.body ?? ""),
  };
}

export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const body = (await request.json()) as {
      article: unknown;
      originalSlug?: string;
    };

    const article = parseArticle(body.article);
    const original = body.originalSlug;

    if (original && original !== article.slug) {
      assertSafeSlug(original);
      // Rename first so the write below lands on the new path.
      renameArticleFile(original, article.slug);
    } else if (!original && readArticleFile(article.slug)) {
      throw new Error(`An article named "${article.slug}" exists.`);
    }

    writeArticleFile(article);
    return NextResponse.json({ ok: true, article });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  assertLocalOnly();

  try {
    const { slug } = (await request.json()) as { slug: string };
    assertSafeSlug(slug);

    if (!readArticleFile(slug)) throw new Error(`No article named "${slug}".`);
    deleteArticleFile(slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
