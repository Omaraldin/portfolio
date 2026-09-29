import { site, now } from "@/content/site";
import { projects } from "@/content/projects";
import { certifications, featuredCertifications } from "@/content/certifications";
import { getArticles } from "@/lib/articles";
import { layoutBoard } from "@/lib/board-layout";
import { ArticleCard } from "@/components/article-card";
import { CertificationChip } from "@/components/certification-row";
import { Reveal } from "@/components/reveal";
import { Chibi } from "@/components/chibi";
import { Whiteboard } from "@/components/board/whiteboard";
import { BoardFlow } from "@/components/board/board-flow";
import { EmptyState, SpecHeader } from "@/components/ui";

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
      <section className="grid gap-10 pt-10 sm:pt-14 lg:grid-cols-[1fr_auto] lg:items-end">
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
          </div>
        </div>

        {/* What's done and what's next, in the board's handwriting. */}
        <div style={{ fontFamily: "var(--font-hand)" }} aria-label="To do">
          <p className="inline-block text-[30px] leading-none font-bold underline decoration-[color:var(--wb-red)] decoration-2 underline-offset-8">
            TODO
          </p>
          <ul className="mt-4 space-y-1.5 text-[20px]">
            {now.map((item) => (
              <li key={item.text} className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border-2 border-ink text-[15px] leading-none text-[color:var(--wb-green)]"
                >
                  {item.done ? "✓" : ""}
                </span>
                <span className={item.done ? "text-ink-muted line-through" : ""}>
                  {item.text}
                  <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── The board ───────────── */}
      {/*
        Wider than the text column: the board is the page's one big object,
        a whiteboard (a chalkboard in dark mode) hanging on the site.
      */}
      <section aria-label="Projects board" className="relative left-1/2 mt-10 w-[min(100vw-24px,1600px)] -translate-x-1/2">
        <div className="rounded-[22px] border-[6px] border-[color:var(--wb-frame)] bg-[color:var(--wb-bg)] px-3 py-6 shadow-[inset_0_2px_12px_rgb(0_0_0/0.06)] sm:px-6">
          <div className="hidden md:block">
            <Whiteboard board={board} />
          </div>
          <div className="px-2 md:hidden">
            <BoardFlow board={board} />
          </div>
        </div>
        <p className="mt-3 hidden text-center text-[18px] text-ink-muted md:block" style={{ fontFamily: "var(--font-hand)" }}>
          hover or tab to a project to trace what it connects to
        </p>
      </section>

      {/* ───────────── Writing ───────────── */}
      <section>
        <SpecHeader
          eyebrow="// thinking out loud"
          title="Latest writing"
          href="/writing"
          hrefLabel="All posts"
        />
        {latest ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Reveal className="md:col-span-full">
              <ArticleCard article={latest} index={0} size="lg" />
            </Reveal>
            {moreArticles.slice(0, 3).map((article, i) => (
              <Reveal key={article.slug} delay={i * 80} className="h-full">
                <ArticleCard article={article} index={i + 1} />
              </Reveal>
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
            eyebrow="// always learning"
            title="Certifications"
            href="/certifications"
            hrefLabel="All certificates"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certs.slice(0, 6).map((certification, i) => (
              <Reveal
                key={certification.slug}
                delay={(i % 3) * 80}
                className="h-full"
              >
                <CertificationChip certification={certification} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
