import Link from "next/link";
import type { Project } from "@/content/types";
import { DOMAIN_LABELS } from "@/content/taxonomy";

/**
 * A numbered project row. The underline wipes in from the left on hover, which
 * is the only decorative motion in the row — everything else is a colour shift.
 */
export function WorkRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block border-b border-rule py-5 transition-colors"
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        <span className="tabular font-mono text-[11px] text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            {/*
              Not lowercased. Project titles carry real acronyms — IoT, GDGoC —
              and a CSS transform would render them as iot and gdgoc.
            */}
            <h3 className="relative font-serif text-[26px] leading-tight font-semibold">
              {project.title}
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100"
              />
            </h3>
            <span className="tabular font-mono text-[11px] text-ink-muted">
              {project.timeline}
            </span>
          </div>

          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            {project.summary}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {project.domains.map((domain) => (
              <span
                key={domain}
                className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase"
              >
                {DOMAIN_LABELS[domain]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
