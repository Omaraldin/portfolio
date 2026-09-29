import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import type { Project } from "@/content/types";
import {
  CAPABILITY_LABELS,
  DOMAIN_LABELS,
} from "@/content/taxonomy";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { mdxComponents } from "@/components/mdx-components";
import { MarkerUnderline, StatBlock, TagChip } from "@/components/ui";
import { ProjectMediaGallery } from "@/components/project-media";
import { PartsSketch } from "@/components/board/parts-sketch";
import { sketchOf } from "@/lib/board-layout";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};

  /*
    A shared link previews with the project's own cover when it has one, else
    the site card. The fallback has to be explicit: a page's openGraph object
    replaces the layout's wholesale, images included.
  */
  const image = project.thumbnail
    ? {
        url: project.thumbnail.src,
        width: project.thumbnail.width,
        height: project.thumbnail.height,
        alt: project.thumbnail.alt || project.title,
      }
    : site.ogImage;

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const position = projects.findIndex((p) => p.slug === slug);
  const previous = position > 0 ? projects[position - 1] : null;
  const next =
    position < projects.length - 1 ? projects[position + 1] : null;

  /*
    The cover is the uploaded thumbnail only. Falling back to the first
    screenshot here would show that image twice — once as the cover and again
    in the gallery below.
  */
  const cover = project.thumbnail;

  return (
    <article>
      {/* ───────────── Header ───────────── */}
      <header className="pt-10 pb-10 sm:pt-14">
        <Link
          href="/work"
          className="btn btn-sm"
        >
          <span aria-hidden>←</span> Work
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {project.domains.map((d) => (
            <span key={d} className="chip chip-static">
              {DOMAIN_LABELS[d]}
            </span>
          ))}
          <span className="tabular text-[14px] text-ink-muted">
            · {project.timeline}
          </span>
        </div>

        {/* Not lowercased — project titles carry acronyms. */}
        <h1 className="mt-5 max-w-5xl font-display text-[48px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[80px]">
          {project.title}
        </h1>
        <p className="mt-6 max-w-3xl text-[20px] leading-relaxed text-ink-muted sm:text-[22px]">
          {project.summary}
        </p>
      </header>

      {/* ───────────── Cover ───────────── */}
      {cover ? (
        <div className="surface relative aspect-[16/9] overflow-hidden">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      {/* ───────────── Numbers ───────────── */}
      {project.metrics.length > 0 ? (
        <div
          className={`grid gap-4 sm:grid-cols-2 ${
            project.metrics.length >= 3 ? "lg:grid-cols-4" : ""
          } ${cover ? "mt-10" : ""}`}
        >
          {project.metrics.map((metric, i) => (
            <StatBlock
              key={metric.label}
              index={i}
              value={metric.value}
              label={metric.label}
            />
          ))}
        </div>
      ) : null}

      {/* ───────────── Body ───────────── */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0">
          {project.sections.map((entry) => (
            <section key={entry.title} className="mb-14 last:mb-0">
              <h2 className="spec-header-title inline-block font-display text-[30px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[34px]">
                {entry.title}
                <MarkerUnderline className="mt-1 w-[60%]" />
              </h2>
              {/*
                Bodies go through the article MDX pipeline, so a section can
                hold a list, a table, or highlighted code, not one paragraph.
              */}
              <div className="prose mt-5 max-w-[68ch]">
                <MDXRemote
                  source={entry.body}
                  options={mdxOptions}
                  components={mdxComponents}
                />
              </div>
            </section>
          ))}

          {project.media.length > 0 ? (
            <section className="mt-14">
              <h2 className="inline-block font-display text-[30px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[34px]">
                Screens
                <MarkerUnderline className="mt-1 w-[60%]" />
              </h2>
              <div className="mt-6">
                <ProjectMediaGallery media={project.media} />
              </div>
            </section>
          ) : null}
        </div>

        {/*
          The facts panel. Sticky on wide screens so the stack and links stay in
          reach while reading; on narrow screens it simply follows the write-up.
        */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Facts project={project} />
        </aside>
      </div>

      {/* ───────────── Prev / next ───────────── */}
      <nav
        aria-label="More work"
        className="mt-20 grid gap-4 border-t border-rule pt-10 sm:grid-cols-2"
      >
        {previous ? (
          <NeighbourLink project={previous} direction="Previous" />
        ) : (
          <span />
        )}
        {next ? <NeighbourLink project={next} direction="Next" /> : null}
      </nav>
    </article>
  );
}

function Facts({ project }: { project: Project }) {
  return (
    <div className="surface p-6">
      <dl className="space-y-5">
        <Fact label="Role">
          <span className="text-[16px] font-semibold">{project.role}</span>
        </Fact>
        <Fact label="Timeline">
          <span className="tabular text-[16px]">{project.timeline}</span>
        </Fact>
        <Fact label="Capabilities">
          <span className="flex flex-wrap gap-1.5">
            {project.capabilities.map((c) => (
              <span
                key={c}
                className="chip chip-static"
              >
                {CAPABILITY_LABELS[c]}
              </span>
            ))}
          </span>
        </Fact>
        <Fact label="Stack">
          <span className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <TagChip key={tech}>{tech}</TagChip>
            ))}
          </span>
        </Fact>
      </dl>

      {project.links.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2 border-t border-rule pt-6">
          {project.links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`btn justify-between ${i === 0 ? "btn-primary" : ""}`}
            >
              {link.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[14px] font-semibold text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1.5">{children}</dd>
    </div>
  );
}

function NeighbourLink({
  project,
  direction,
}: {
  project: Project;
  direction: "Previous" | "Next";
}) {
  const isNext = direction === "Next";
  const cover = project.thumbnail ?? project.media[0];
  const sketch = sketchOf(project);

  return (
    <Link
      href={`/work/${project.slug}`}
      className={`card group flex items-center gap-4 p-4 ${
        isNext ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-[10px] border border-rule bg-paper-raised">
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-[color:var(--wb-bg)]">
            <PartsSketch parts={sketch.parts} flow={sketch.flow} id={`nb-${project.slug}`} label={`How ${project.title} is built`} />
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="label">
          {isNext ? "Next →" : "← Previous"}
        </span>
        <span className="mt-1 block font-display text-[22px] leading-tight font-extrabold tracking-[-0.03em]">
          {project.title}
        </span>
      </span>
    </Link>
  );
}
