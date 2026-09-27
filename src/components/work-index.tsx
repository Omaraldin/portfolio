"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/types";
import {
  CAPABILITY_LABELS,
  DOMAIN_EMOJI,
  DOMAIN_LABELS,
  type Capability,
  type Domain,
} from "@/content/taxonomy";
import { ProjectCard } from "./project-card";
import { Emoji } from "./emoji";

/**
 * The full work index. Domains are the primary filter, as a row of pills;
 * capabilities are the finer cut, in a dropdown so ten of them do not bury the
 * page. Both can apply at once. Filtering is client-side over an
 * already-rendered list, so it is instant and needs no navigation.
 *
 * Unfiltered, the lead project gets the wide spotlight card; once a filter is
 * on, every result is an equal card so nothing looks ranked.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [capability, setCapability] = useState<Capability | null>(null);

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

  /*
    Featured work leads, so the spotlight is a deliberate pick rather than
    whatever happens to be first in the file.
  */
  const ordered = useMemo(
    () => [
      ...projects.filter((p) => p.featured),
      ...projects.filter((p) => !p.featured),
    ],
    [projects],
  );

  const visible = ordered.filter(
    (p) =>
      (!domain || p.domains.includes(domain)) &&
      (!capability || p.capabilities.includes(capability)),
  );

  const filtered = domain !== null || capability !== null;
  const [spotlight, ...rest] = filtered ? [undefined, ...visible] : visible;

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-rule py-5 lg:flex-row lg:items-center lg:justify-between">
        {/*
          The row scrolls sideways on narrow screens, and any overflow box
          clips vertically too — so it is padded out (and pulled back with
          negative margin) to leave room for the pills' hover lift.
        */}
        <div className="no-scrollbar -mx-2 -my-2 flex gap-2 overflow-x-auto px-2 py-2 lg:flex-wrap">
          <Pill active={domain === null} onClick={() => setDomain(null)}>
            All work
          </Pill>
          {domains.map((d) => (
            <Pill
              key={d}
              active={domain === d}
              onClick={() => setDomain(domain === d ? null : d)}
            >
              <Emoji char={DOMAIN_EMOJI[d]} /> {DOMAIN_LABELS[d]}
            </Pill>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <label className="relative">
            <span className="sr-only">Filter by capability</span>
            <select
              value={capability ?? ""}
              onChange={(e) =>
                setCapability((e.target.value || null) as Capability | null)
              }
              className="cursor-pointer appearance-none rounded-full border-2 border-rule bg-paper py-2 pr-10 pl-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
            >
              <option value="">Any capability</option>
              {capabilities.map((c) => (
                <option key={c} value={c}>
                  {CAPABILITY_LABELS[c]}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-ink-muted"
            >
              ▾
            </span>
          </label>
          <span className="tabular font-mono text-[13px] whitespace-nowrap text-ink-muted">
            {visible.length} {visible.length === 1 ? "project" : "projects"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
        {spotlight ? (
          <div className="md:col-span-full">
            <ProjectCard project={spotlight} index={0} size="wide" />
          </div>
        ) : null}
        {rest.map((project, i) =>
          project ? (
            <ProjectCard key={project.slug} project={project} index={i + 1} />
          ) : null,
        )}
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display text-[22px] font-bold">
            Nothing matches both filters <Emoji char="🤷" />
          </p>
          <button
            type="button"
            onClick={() => {
              setDomain(null);
              setCapability(null);
            }}
            className="mt-3 text-[15px] font-semibold text-accent underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Pill({
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
      className={`pill shrink-0 rounded-full border-2 px-4 py-2 text-[14px] font-semibold whitespace-nowrap ${
        active
          ? "border-on-pop bg-brand text-on-brand"
          : "border-rule bg-paper text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
