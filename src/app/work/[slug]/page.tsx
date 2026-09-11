import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { CAPABILITY_LABELS, DOMAIN_LABELS } from "@/content/taxonomy";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { mdxComponents } from "@/components/mdx-components";
import { FieldRow, SpecHeader, StatBlock } from "@/components/ui";
import { ProjectMediaGallery } from "@/components/project-media";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
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

  return (
    <article>
      <header className="border-b border-rule pt-10 pb-8">
        <Link
          href="/work"
          className="font-mono text-[11px] tracking-[0.12em] text-ink-muted lowercase transition-colors hover:text-accent"
        >
          ← projects
        </Link>
        {/* Not lowercased — project titles carry acronyms. */}
        <h1 className="mt-4 font-serif text-[52px] leading-[1.05] font-semibold">
          {project.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
          {project.summary}
        </p>
      </header>

      <dl className="max-w-3xl pt-8">
        <FieldRow label="Role">{project.role}</FieldRow>
        <FieldRow label="Timeline">{project.timeline}</FieldRow>
        <FieldRow label="Domains">
          {project.domains.map((d) => DOMAIN_LABELS[d]).join(" · ")}
        </FieldRow>
        <FieldRow label="Capabilities">
          {project.capabilities.map((c) => CAPABILITY_LABELS[c]).join(" · ")}
        </FieldRow>
        <FieldRow label="Stack">{project.stack.join(" · ")}</FieldRow>
        {project.links.length > 0 ? (
          <FieldRow label="Links">
            <span className="flex flex-wrap gap-x-4">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
            </span>
          </FieldRow>
        ) : null}
      </dl>

      {project.metrics.length > 0 ? (
        <section>
          <SpecHeader title="Measured" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {project.metrics.map((metric) => (
              <StatBlock
                key={metric.label}
                value={metric.value}
                label={metric.label}
              />
            ))}
          </div>
        </section>
      ) : null}

      {project.media?.length ? (
        <section>
          <SpecHeader title="Media" />
          <ProjectMediaGallery media={project.media} />
        </section>
      ) : null}

      {/*
        Sections are authored, not fixed, so the numbering is handed out here in
        render order rather than written into the content.
      */}
      <section className="max-w-2xl">
        {project.sections.map((entry, i) => (
          <div key={entry.title}>
            <SpecHeader
              index={String(i + 1).padStart(2, "0")}
              title={entry.title}
            />
            {/*
              Bodies go through the article MDX pipeline, so a section can hold
              a list, a table, or highlighted code rather than one paragraph.
            */}
            <div className="prose">
              <MDXRemote
                source={entry.body}
                options={mdxOptions}
                components={mdxComponents}
              />
            </div>
          </div>
        ))}
      </section>

      <nav className="mt-20 flex justify-between gap-6 border-t border-rule-strong pt-6">
        {previous ? (
          <Link href={`/work/${previous.slug}`} className="group max-w-[45%]">
            <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
              Previous
            </span>
            <span className="mt-1 block text-[15px] font-medium transition-colors group-hover:text-accent">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/work/${next.slug}`}
            className="group max-w-[45%] text-right"
          >
            <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
              Next
            </span>
            <span className="mt-1 block text-[15px] font-medium transition-colors group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
