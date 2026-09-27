import { NextResponse, type NextRequest } from "next/server";
import { getArticles } from "@/lib/articles";
import {
  allowWrite,
  getReactions,
  isReactionKey,
  reactionsEnabled,
  setReaction,
  visitorId,
} from "@/lib/reactions";

/*
  Reactions are per visitor, and a visitor is identified by IP. On Vercel,
  x-forwarded-for is set by the platform's edge from the real connection, so a
  client cannot pick its own value. Elsewhere this header would need a trusted
  proxy in front before it could be relied on.
*/
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Only published articles take reactions, so the store holds real slugs only. */
function isKnownArticle(slug: string): boolean {
  return getArticles().some((article) => article.slug === slug);
}

const noStore = { "Cache-Control": "no-store" };

function error(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: noStore });
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/reactions/[slug]">,
) {
  const { slug } = await ctx.params;
  if (!reactionsEnabled()) return error(503, "Reactions are not configured.");
  if (!isKnownArticle(slug)) return error(404, "No such article.");

  try {
    const state = await getReactions(slug, visitorId(clientIp(request)));
    return NextResponse.json(state, { headers: noStore });
  } catch {
    return error(503, "Reactions are unavailable right now.");
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/reactions/[slug]">,
) {
  const { slug } = await ctx.params;
  if (!reactionsEnabled()) return error(503, "Reactions are not configured.");
  if (!isKnownArticle(slug)) return error(404, "No such article.");

  /*
    Browsers always send Origin on a cross-site POST, so a mismatch means
    another site is trying to react on its visitors' behalf.
  */
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return error(403, "Cross-site reactions are not allowed.");
  }

  let body: { reaction?: unknown; on?: unknown };
  try {
    body = await request.json();
  } catch {
    return error(400, "Expected a JSON body.");
  }
  if (!isReactionKey(body.reaction) || typeof body.on !== "boolean") {
    return error(400, "Expected { reaction, on }.");
  }

  try {
    const visitor = visitorId(clientIp(request));
    if (!(await allowWrite(visitor))) {
      return error(429, "Slow down a little.");
    }
    const state = await setReaction(slug, visitor, body.reaction, body.on);
    return NextResponse.json(state, { headers: noStore });
  } catch {
    return error(503, "Reactions are unavailable right now.");
  }
}
