import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { featuredProjects, projects } from "@/content/projects";
import { certifications, featuredCertifications } from "@/content/certifications";
import { getArticles } from "@/lib/articles";
import { ProjectCard } from "@/components/project-card";
import { ArticleCard } from "@/components/article-card";
import { CertificationChip } from "@/components/certification-row";
import { Sparkles } from "@/components/sparkles";
import { Reveal } from "@/components/reveal";
import { EmptyState, PillLink, SpecHeader } from "@/components/ui";

/*
  How I approach a problem, in three steps. Shared as a way of thinking, not as
  a sales pitch — it is the idea most of the writing keeps coming back to.
*/
const METHOD = [
  {
    step: "01",
    title: "Understand the problem",
    body: "Who is it hurting, what is it costing, and what would \"fixed\" actually look like? Most of the answer is here.",
    emoji: "🔍",
  },
  {
    step: "02",
    title: "Find the simplest fix",
    body: "Weigh the trade-offs — time, money, risk — and pick the smallest thing that moves the needle. Sometimes that isn't code at all.",
    emoji: "🧩",
  },
  {
    step: "03",
    title: "Build, measure, repeat",
    body: "Choose whatever tools fit, ship it, and check it did what it was meant to. Then make it better.",
    emoji: "🚀",
  },
];

export default function Home() {
  const articles = getArticles();
  const [latest, ...moreArticles] = articles;

  const domains = Array.from(new Set(projects.flatMap((p) => p.domains)));

  const showcase = (
    featuredProjects.length > 0 ? featuredProjects : projects
  ).slice(0, 5);
  /*
    Wide cards take two of the three columns. Which ones are wide is chosen so
    the bento always closes flush: the lead is wide unless the count already
    fills whole rows, and the last is wide too when one slot would be left.
  */
  const n = showcase.length;
  const wideLead = n % 3 !== 0;
  const wideLast = n > 1 && (n + (wideLead ? 1 : 0)) % 3 === 2;
  const isWide = (i: number) =>
    (i === 0 && wideLead) || (i === n - 1 && wideLast);

  const certs =
    featuredCertifications.length > 0 ? featuredCertifications : certifications;

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="grid items-center gap-12 pt-10 pb-8 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pt-20">
        <div>
          {/*
            The newest post, Josh Comeau style — the freshest thing on the
            site is the first thing offered. Absent until something is out.
          */}
          {latest ? (
            <Link
              href={`/writing/${latest.slug}`}
              className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-rule bg-paper py-1.5 pr-4 pl-1.5 text-[14px] font-semibold transition-colors hover:border-ink"
            >
              <span className="rounded-full bg-brand px-2.5 py-0.5 font-mono text-[11px] font-bold text-on-brand">
                new post
              </span>
              <span className="truncate">{latest.title}</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          ) : null}

          <h1 className="mt-6 font-display text-[52px] leading-[0.92] font-extrabold tracking-[-0.05em] sm:text-[80px] xl:text-[96px]">
            I turn messy{" "}
            <Sparkles>
              <span className="inline-block -rotate-2 rounded-[18px] border-2 border-on-pop bg-pop-yellow px-3 text-on-pop">
                problems
              </span>
            </Sparkles>{" "}
            into things that{" "}
            <span className="inline-block rotate-1 rounded-[18px] border-2 border-on-pop bg-forest px-3 text-on-forest">
              work.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-[19px] leading-relaxed text-ink-muted sm:text-[21px]">
            Hi, I&apos;m <strong className="text-ink">{site.name}</strong> — a
            software engineer in {site.location.split(",")[0]}. I start with
            the business problem, then reach for whatever solves it best — and
            write down what I learn along the way.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <PillLink href="/writing">
              Read the blog <span aria-hidden>→</span>
            </PillLink>
            <PillLink href="/work" variant="outline">
              See what I&apos;ve built <span aria-hidden>🛠️</span>
            </PillLink>
          </div>
        </div>

        {/*
          The portrait with a few stickers stuck to it — who this is, in the
          voice of a terminal and a notebook, rather than a pitch.
        */}
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[44px] border-2 border-on-pop bg-forest shadow-[10px_10px_0_0_var(--shadow)]">
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pop-yellow"
            />
            <Image
              src="/portrait.png"
              alt={`Illustrated portrait of ${site.name}`}
              width={880}
              height={1320}
              sizes="(min-width: 1024px) 520px, 90vw"
              priority
              className="relative h-full w-full object-cover object-[50%_100%]"
            />
          </div>

          <div
            aria-hidden
            style={{ ["--tilt" as string]: "-3deg" }}
            className="absolute top-8 -left-3 animate-float rounded-[18px] border-2 border-on-pop bg-cream px-4 py-3 font-mono text-[13px] leading-relaxed text-on-pop shadow-[4px_4px_0_0_var(--on-pop)] sm:-left-10"
          >
            <span className="text-[#1d5b3a]">$</span> whoami
            <br />
            <span className="text-on-pop/70">engineer · writer · tinkerer</span>
          </div>

          <div
            aria-hidden
            style={{ ["--tilt" as string]: "3deg", animationDelay: "1.2s" }}
            className="absolute -right-2 bottom-24 animate-float rounded-full border-2 border-on-pop bg-pop-yellow px-4 py-2.5 text-[15px] font-semibold text-on-pop shadow-[4px_4px_0_0_var(--on-pop)] sm:-right-8"
          >
            building in public ✦
          </div>

          <div
            aria-hidden
            style={{ ["--tilt" as string]: "-6deg", animationDelay: "2.4s" }}
            className="absolute -bottom-5 left-6 animate-float rounded-full border-2 border-on-pop bg-cream px-4 py-2 font-mono text-[13px] font-bold text-on-pop shadow-[4px_4px_0_0_var(--on-pop)]"
          >
            {domains.length} fields · 1 way of thinking
          </div>
        </div>
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

      {/* ───────────── Work ───────────── */}
      <section>
        <SpecHeader
          eyebrow="// things I've built"
          title="Selected work"
          href="/work"
          hrefLabel="All work"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {showcase.map((project, i) => (
            <Reveal
              key={project.slug}
              delay={(i % 3) * 80}
              className={isWide(i) ? "md:col-span-2" : ""}
            >
              <ProjectCard
                project={project}
                index={i}
                size={isWide(i) ? "lg" : "md"}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── Method ───────────── */}
      <section>
        <SpecHeader
          eyebrow="// how I approach problems"
          title="Problem first, tools second"
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {METHOD.map((item, i) => (
            <li key={item.step} className="h-full">
              <Reveal delay={i * 80} className="h-full">
                <div className="relative h-full rounded-[28px] border-2 border-rule bg-paper-raised p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-accent">
                      step_{item.step}
                    </span>
                    <span aria-hidden className="text-[32px]">
                      {item.emoji}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
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
