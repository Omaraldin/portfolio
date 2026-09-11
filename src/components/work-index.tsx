"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/types";
import {
  CAPABILITY_LABELS,
  DOMAIN_LABELS,
  type Capability,
  type Domain,
} from "@/content/taxonomy";
import { WorkRow } from "./work-row";

type Filter =
  | { kind: "all" }
  | { kind: "domain"; value: Domain }
  | { kind: "capability"; value: Capability };

/**
 * The full work index, filterable by either axis. Filtering is client-side over
 * an already-rendered list, so it stays instant and needs no navigation.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });

  // Only offer facets the work actually covers.
  const { domains, capabilities } = useMemo(
    () => ({
      domains: Array.from(new Set(projects.flatMap((p) => p.domains))),
      capabilities: Array.from(
        new Set(projects.flatMap((p) => p.capabilities)),
      ),
    }),
    [projects],
  );

  const visible = useMemo(() => {
    if (filter.kind === "all") return projects;
    if (filter.kind === "domain") {
      return projects.filter((p) => p.domains.includes(filter.value));
    }
    return projects.filter((p) => p.capabilities.includes(filter.value));
  }, [projects, filter]);

  const isActive = (candidate: Filter) =>
    candidate.kind === filter.kind &&
    (candidate.kind === "all" ||
      // Both are narrowed to the same non-"all" shape here.
      (filter.kind !== "all" && candidate.value === filter.value));

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-rule py-5">
        <FilterGroup label="Domain">
          <FilterChip
            active={isActive({ kind: "all" })}
            onClick={() => setFilter({ kind: "all" })}
          >
            All
          </FilterChip>
          {domains.map((domain) => (
            <FilterChip
              key={domain}
              active={isActive({ kind: "domain", value: domain })}
              onClick={() => setFilter({ kind: "domain", value: domain })}
            >
              {DOMAIN_LABELS[domain]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Capability">
          {capabilities.map((capability) => (
            <FilterChip
              key={capability}
              active={isActive({ kind: "capability", value: capability })}
              onClick={() =>
                setFilter({ kind: "capability", value: capability })
              }
            >
              {CAPABILITY_LABELS[capability]}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      <div className="flex items-baseline justify-between py-3">
        <span className="tabular font-mono text-[11px] tracking-[0.1em] text-ink-muted uppercase">
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div>
        {visible.map((project, i) => (
          <WorkRow key={project.slug} project={project} index={i} />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
          No projects match that filter
        </p>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase sm:w-20 sm:shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[3px] border px-2 py-1 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors ${
        active
          ? "border-accent bg-accent-quiet text-accent"
          : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
