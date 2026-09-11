import { NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { assertLocalOnly } from "@/lib/admin-guard";

/**
 * Renders an article body to HTML for the admin preview pane.
 *
 * This goes straight from markdown to HTML rather than through MDX and React.
 * Route handlers cannot import `react-dom/server`, and the preview only needs
 * markup — the plugins that decide how the result *looks* (gfm, slugs, and
 * shiki highlighting via rehype-pretty-code) are the same ones the published
 * page uses, so code blocks preview exactly as they will ship.
 *
 * The gap is JSX: an MDX component in the body renders as literal text here.
 * That is an acceptable trade for a preview pane, and the article page remains
 * the source of truth.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // Raw HTML in the source is passed through rather than escaped, matching MDX.
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark" },
    keepBackground: false,
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function POST(request: Request) {
  assertLocalOnly();

  try {
    const { body } = (await request.json()) as { body?: string };

    if (typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ ok: true, html: "" });
    }

    const file = await processor.process(body);
    return NextResponse.json({ ok: true, html: String(file) });
  } catch (error) {
    // Malformed input is expected while typing, so this is a normal response
    // rather than a server error — the pane shows the message in place.
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}
