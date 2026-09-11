import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { featuredProjects, projects } from "@/content/projects";
import { DOMAIN_LABELS } from "@/content/taxonomy";
import { getArticles } from "@/lib/articles";
import { featuredCertifications } from "@/content/certifications";
import { WorkRow } from "@/components/work-row";
import { ArticleRow } from "@/components/article-row";
import { CertificationChip } from "@/components/certification-row";
import { AccordionSection } from "@/components/accordion-section";
import { FieldRow, SpecHeader } from "@/components/ui";

export default function Home() {
  const articles = getArticles().slice(0, 3);

  // Domains are listed from the work itself, so the claim always matches the
  // evidence directly beneath it.
  const coveredDomains = Array.from(
    new Set(projects.flatMap((p) => p.domains)),
  );

  return (
    /*
      Two columns for the whole page rather than for the intro alone: the
      portrait column is sticky, so it stays in view while every section scrolls
      past it. Below `lg` the grid collapses and the portrait leads the page as
      a single full-width block.
    */
    <div className="grid items-start gap-10 pt-4 lg:grid-cols-2 lg:gap-14">
      {/*
        The sticky column is the grid item itself; the panel inside it is what
        sticks. A sticky element only travels within its own grid area, so this
        has to be the direct child for it to range over the full page height.
      */}
      {/*
        Second column on wide screens, first on narrow. The portrait leads on
        mobile, where it reads as a header, but sits right of the content once
        there is room for two columns.
      */}
      <div className="order-first lg:sticky lg:top-8 lg:order-last">
        {/*
          The one place the accent appears as a large fill. The portrait is cut
          out, so the panel behind it is what supplies the colour. The figure
          sits low in a square canvas with transparent margin above, so the
          panel takes a 4:5 ratio and the image is anchored bottom-centre —
          which crops the empty margin rather than the figure.
        */}
        {/*
          Fills the column edge to edge — no max-width, or the panel would sit
          centred in its track with dead space either side. Height is capped
          against the viewport: a sticky element taller than the screen scrolls
          its own bottom into view before it pins, which reads as drifting.
        */}
        {/*
          Below `lg` the portrait leads a single column, where a full-height
          panel would fill the first screen before any text — so it keeps a
          portrait ratio there and only takes the viewport height once it is a
          column of its own.
        */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-accent lg:aspect-auto lg:h-[calc(100vh-6rem)]">
          <Image
            src="/portrait.png"
            alt={`Illustrated portrait of ${site.name}`}
            width={880}
            height={1320}
            sizes="(min-width: 1024px) 440px, 100vw"
            priority
            /*
              The source is square and the panel is tall, so object-cover crops
              the sides. Anchored to the bottom so the empty headroom above the
              figure is what gets lost rather than the top of the head.
            */
            className="h-full w-full object-cover object-[50%_100%]"
          />
        </div>
      </div>

      {/* Every section lives in the scrolling column. */}
      <div className="min-w-0 lg:order-first">
        <section>
          <SpecHeader title="about" />

          <h1 className="sr-only">
            {site.name} — {site.role}
          </h1>

          <p className="max-w-2xl text-[17px] leading-relaxed">{site.thesis}</p>

          <dl className="mt-8">
            <FieldRow label="Location">{site.location}</FieldRow>
            <FieldRow label="Focus">Systems design · Data flow</FieldRow>
            <FieldRow label="Domains">
              {coveredDomains.map((d) => DOMAIN_LABELS[d]).join(" · ")}
            </FieldRow>
            <FieldRow label="Status" accent>
              {site.status}
            </FieldRow>
          </dl>
        </section>

        {/*
          One <details> group: opening any section closes the others. `about`
          above stays outside it — it is the page's opening statement and is
          never collapsed.
        */}
        <div className="mt-6">
          {articles.length > 0 ? (
            <AccordionSection
              title="blogs"
              href="/writing"
              hrefLabel="all articles"
              defaultOpen
            >
              {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </AccordionSection>
          ) : null}

          <AccordionSection
            title="showcase"
            href="/work"
            hrefLabel="all projects"
          >
            {featuredProjects.map((project, i) => (
              <WorkRow key={project.slug} project={project} index={i} />
            ))}
          </AccordionSection>

          {featuredCertifications.length > 0 ? (
            <AccordionSection
              title="certs"
              href="/certifications"
              hrefLabel="all certificates"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {featuredCertifications.map((certification) => (
                  <CertificationChip
                    key={certification.slug}
                    certification={certification}
                  />
                ))}
              </div>
            </AccordionSection>
          ) : null}

          <AccordionSection title="cv" href="/cv" hrefLabel="open cv">
            <p className="max-w-2xl text-[17px] leading-relaxed">
              The same record, ordered for the role you are hiring for. Pick a
              profile and the document rebuilds around it — summary, projects,
              and skills all reordered.
            </p>
            <Link
              href="/cv"
              className="mt-5 inline-block rounded-[3px] border border-rule px-4 py-2 font-mono text-[11px] tracking-[0.12em] lowercase transition-colors hover:border-accent hover:text-accent"
            >
              select a profile →
            </Link>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}
