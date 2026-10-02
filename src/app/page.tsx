import type { Metadata } from "next";
import Link from "next/link";
import { site, now } from "@/content/site";
import { projects } from "@/content/projects";
import { certifications, featuredCertifications } from "@/content/certifications";
import { getArticles } from "@/lib/articles";
import { layoutBoard } from "@/lib/board-layout";
import { ArticleRow } from "@/components/article-row";
import { CertificationChip } from "@/components/certification-row";
import { Chibi } from "@/components/chibi";
import { Whiteboard } from "@/components/board/whiteboard";
import { BoardFlow } from "@/components/board/board-flow";
import { BoardFrame } from "@/components/board/board-frame";
import { EmptyState, SpecHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Home() {
  const articles = getArticles();
  const [latest, ...moreArticles] = articles;

  /*
    Every project goes on the board, featured ones first. Grouping into zones
    is automatic; lines appear only where a project declares one.
  */
  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];
  const board = layoutBoard(ordered, articles);

  const certs =
    featuredCertifications.length > 0 ? featuredCertifications : certifications;

  return (
    <>
      {/* ───────────── Intro ───────────── */}
      <section className="pt-10 sm:pt-14">
        <div className="flex items-end gap-5">
          <Chibi className="h-28 shrink-0 sm:h-36" sizes="110px" priority />
          <div>
            <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-display text-[34px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[44px]">
              {site.name}
              <span
                lang="ar"
                dir="rtl"
                className="text-[26px] font-semibold tracking-normal text-accent sm:text-[32px]"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                {site.nameAr}
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-[19px] leading-relaxed text-ink-muted sm:text-[21px]">
              Software engineer in {site.location.split(",")[0]}. I work out how
              the pieces fit before I build them. This is my board.
            </p>
            {now ? (
              <p className="mt-2 text-[16px] text-ink-muted">
                Currently building{" "}
                <Link
                  href={`/work/${now.slug}`}
                  className="font-semibold text-ink underline decoration-rule decoration-2 underline-offset-4 hover:decoration-[color:var(--wb-red)]"
                >
                  {now.label}
                </Link>
                , {now.note}.
              </p>
            ) : null}
            {/* The next step: the work, the CV, or a message. Same buttons as the footer. */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link href="/work" className="btn btn-primary btn-sm">
                Work
              </Link>
              <Link href="/cv" className="btn btn-sm">
                CV
              </Link>
              <a href={`mailto:${site.email}`} className="btn btn-sm">
                Get in touch
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ───────────── The board ───────────── */}
      {/*
        Wider than the text column: the board is the page's one big object,
        a whiteboard (a chalkboard in dark mode) hanging on the site.
      */}
      <section aria-label="Projects board" className="relative left-1/2 mt-10 w-[min(100vw-24px,1600px)] -translate-x-1/2">
        <BoardFrame>
          <div className="px-3 py-6 sm:px-6">
            <div className="hidden md:block">
              <Whiteboard board={board} />
            </div>
            <div className="px-2 md:hidden">
              <BoardFlow board={board} />
            </div>
          </div>
        </BoardFrame>
      </section>

      {/* ───────────── Writing ───────────── */}
      <section>
        <SpecHeader
          title="Latest writing"
          href="/writing"
          hrefLabel="All posts"
        />
        {latest ? (
          <div className="border-b border-rule">
            <ArticleRow article={latest} lead />
            {moreArticles.slice(0, 3).map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState>First post is on its way ✍️</EmptyState>
        )}
      </section>

      {/* ───────────── Certifications ───────────── */}
      {certs.length > 0 ? (
        <section>
          <SpecHeader
            title="Certifications"
            href="/certifications"
            hrefLabel="All certificates"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certs.slice(0, 6).map((certification, i) => (
              <CertificationChip key={certification.slug} certification={certification} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
