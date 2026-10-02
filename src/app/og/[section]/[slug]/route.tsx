import { ImageResponse } from "next/og";
import { projects, getProject } from "@/content/projects";
import { site } from "@/content/site";
import { getArticle, getArticles } from "@/lib/articles";
import { OG_SIZE } from "@/lib/metadata";

/*
  The share card for a project or post that has no cover of its own: the
  page's title written on a small whiteboard, in the site's own type. Rendered
  once per page at build time.
*/

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...projects.map((p) => ({ section: "work", slug: p.slug })),
    ...getArticles().map((a) => ({ section: "writing", slug: a.slug })),
  ];
}

/*
  ImageResponse needs raw font files. Google Fonts serves TrueType to a client
  that doesn't announce woff2 support, and `text=` trims the file to the
  glyphs this card uses. If the fetch fails the card still renders, in the
  renderer's default sans.
*/
async function googleFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/og/[section]/[slug]">,
) {
  const { section, slug } = await params;
  const page =
    section === "work"
      ? (() => {
          const p = getProject(slug);
          return p && { kicker: "case study", title: p.title };
        })()
      : (() => {
          const a = getArticle(slug);
          return a && { kicker: "from the blog", title: a.title };
        })();
  if (!page) return new Response("Not found", { status: 404 });

  const domain = new URL(site.url).host;
  const [display, hand] = await Promise.all([
    googleFont("Bricolage+Grotesque", 800, page.title),
    googleFont("Kalam", 700, `${page.kicker}${site.name}${domain}`),
  ]);
  const fonts = [
    display && { name: "Display", data: display, weight: 800 as const, style: "normal" as const },
    hand && { name: "Hand", data: hand, weight: 700 as const, style: "normal" as const },
  ].filter((f) => f !== null);

  const titleSize = page.title.length > 48 ? 64 : page.title.length > 28 ? 78 : 96;

  return new ImageResponse(
    (
      // The board's aluminium rim around its white surface.
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 22,
          background: "linear-gradient(180deg, #f3f4f2 0%, #c9cdc6 18%, #aeb3ab 60%, #8f958c 100%)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 68px",
            borderRadius: 8,
            background: "#f9faf7",
            color: "#1f2326",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Hand", fontSize: 40, color: "#c23a2e" }}>
            {page.kicker}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Display",
                fontSize: titleSize,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.035em",
              }}
            >
              {page.title}
            </div>
            {/* A green marker stroke under the title. */}
            <div
              style={{
                display: "flex",
                marginTop: 22,
                width: 220,
                height: 10,
                borderRadius: 6,
                background: "#2f6b45",
                transform: "rotate(-1deg)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Hand",
              fontSize: 32,
              color: "#474d51",
            }}
          >
            <span>{site.name}</span>
            <span>{domain}</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
