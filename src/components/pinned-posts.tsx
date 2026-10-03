import Link from "next/link";
import type { ArticleMeta } from "@/content/types";
import { formatDate } from "@/lib/format";

/*
  The latest posts, pinned up beside the board: the newest on a yellow sticky
  note (the board's own "posts" yellow), the rest on ruled index cards. Both
  are physical paper, so they keep their colours in either theme and carry
  dark ink on them.
*/

const hand = { fontFamily: "var(--font-hand)" };

function Tape() {
  return (
    <span
      aria-hidden
      className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] rounded-[2px] border border-black/5 bg-white/55 shadow-[0_1px_2px_rgb(0_0_0/0.12)] backdrop-blur-[1px]"
    />
  );
}

export function Pinned({ article, sticky, tilt }: { article: ArticleMeta; sticky: boolean; tilt: string }) {
  return (
    <Link
      href={`/writing/${article.slug}`}
      className={`pinned group relative block p-6 pt-7 text-[#1f2326] shadow-[0_10px_22px_-14px_rgb(0_0_0/0.55),0_2px_4px_-2px_rgb(0_0_0/0.2)] transition-transform duration-200 ${
        sticky ? "bg-[var(--wb-note)]" : "pinned-card bg-[#fbfaf4]"
      }`}
      style={{ ["--tilt" as string]: tilt }}
    >
      <Tape />
      <p className={`text-[18px] ${sticky ? "text-[#4a4535]" : "text-[#474d51]"}`} style={hand}>
        {formatDate(article.date)} · {article.readingTime} min read
      </p>
      <h3 className="mt-2 font-display text-[24px] leading-[1.1] font-extrabold tracking-[-0.02em] decoration-[#c23a2e] decoration-[3px] underline-offset-[5px] group-hover:underline sm:text-[26px]">
        {article.title}
      </h3>
      {article.description ? (
        <p className={`mt-3 text-[16px] leading-relaxed ${sticky ? "text-[#3d3a2e]" : "text-[#3c4246]"}`}>
          {article.description}
        </p>
      ) : null}
      <p className="mt-4 text-[20px] font-bold" style={hand}>
        read it →
      </p>
    </Link>
  );
}

export function PinnedPosts({ articles }: { articles: ArticleMeta[] }) {
  const tilts = ["-1.2deg", "0.8deg", "-0.6deg"];
  return (
    <div
      className={`grid gap-8 pt-3 ${
        articles.length === 1 ? "max-w-xl" : articles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {articles.map((article, i) => (
        <Pinned key={article.slug} article={article} sticky={i === 0} tilt={tilts[i % tilts.length]} />
      ))}
    </div>
  );
}
