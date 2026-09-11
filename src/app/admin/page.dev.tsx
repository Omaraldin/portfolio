import Link from "next/link";
import { projects } from "@/content/projects";
import { getArticles } from "@/lib/articles";
import { about } from "@/content/about";
import { certifications } from "@/content/certifications";
import { DOMAINS, CAPABILITIES } from "@/content/taxonomy";

export const dynamic = "force-dynamic";

export default function AdminOverview() {
  const articles = getArticles();
  const drafts = articles.filter((a) => a.draft);

  // The matrix only renders axes that real work covers, so an uncovered axis is
  // worth surfacing here: it is the gap between what is claimed and what is
  // shown.
  const coveredDomains = new Set(projects.flatMap((p) => p.domains));
  const coveredCapabilities = new Set(
    projects.flatMap((p) => p.capabilities),
  );
  const uncoveredDomains = DOMAINS.filter((d) => !coveredDomains.has(d));
  const uncoveredCapabilities = CAPABILITIES.filter(
    (c) => !coveredCapabilities.has(c),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          value={String(projects.length)}
          label="Projects"
          detail={`${projects.filter((p) => p.featured).length} featured`}
          href="/admin/work"
        />
        <Stat
          value={String(articles.length)}
          label="Articles"
          detail={`${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
          href="/admin/writing"
        />
        <Stat
          value={String(certifications.length)}
          label="Certifications"
          detail={`${certifications.filter((c) => c.featured).length} featured`}
          href="/admin/certifications"
        />
        <Stat
          value={String(about.sections.length)}
          label="About sections"
          detail="Prose blocks"
          href="/admin/about"
        />
      </div>

      <section className="border border-rule bg-paper-raised p-5">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-muted uppercase">
          Matrix coverage
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          The home page matrix only shows axes that have work behind them.
          Anything listed here is declared in the taxonomy but currently
          invisible on the site.
        </p>

        <dl className="mt-4 space-y-2 text-[13px]">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase sm:w-40 sm:shrink-0">
              Unused domains
            </dt>
            <dd>
              {uncoveredDomains.length ? uncoveredDomains.join(", ") : "None"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase sm:w-40 sm:shrink-0">
              Unused capabilities
            </dt>
            <dd>
              {uncoveredCapabilities.length
                ? uncoveredCapabilities.join(", ")
                : "None"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="border border-rule p-5">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-muted uppercase">
          How saving works
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Edits write straight to files in this repository — projects and About
          to <code className="font-mono text-[12px]">src/data/</code>, articles
          to <code className="font-mono text-[12px]">src/articles/</code>. The
          dev server picks changes up immediately. To publish, commit the files
          and deploy as usual.
        </p>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  detail,
  href,
}: {
  value: string;
  label: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block border-t border-rule-strong pt-3 transition-colors hover:border-accent"
    >
      <div className="tabular text-3xl font-bold tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-ink-faint">
        {detail}
      </div>
    </Link>
  );
}
