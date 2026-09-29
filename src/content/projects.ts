import raw from "@/data/projects.json";
import type { BoardLink, Project, ProjectBoard, ProjectMedia, ProjectSection } from "./types";
import { CAPABILITIES, DOMAINS } from "./taxonomy";

/**
 * Projects are stored as JSON rather than as a TypeScript literal so the admin
 * panel can rewrite them safely — a panel cannot edit TS source without code
 * generation.
 *
 * The trade-off is that the compiler can no longer vouch for the file's shape,
 * so it is validated here instead. Anything malformed is dropped with a warning
 * rather than crashing the build: one bad entry should not take the site down.
 */
function isMedia(m: unknown): m is ProjectMedia {
  return (
    typeof m === "object" &&
    m !== null &&
    typeof (m as ProjectMedia).src === "string" &&
    typeof (m as ProjectMedia).alt === "string" &&
    typeof (m as ProjectMedia).width === "number" &&
    typeof (m as ProjectMedia).height === "number"
  );
}

/**
 * Board data is optional and purely presentational, so anything malformed is
 * dropped field by field rather than rejecting the whole project.
 */
export function normaliseBoard(value: unknown): ProjectBoard | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const b = value as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const links = (v: unknown): BoardLink[] | undefined => {
    if (!Array.isArray(v)) return undefined;
    const out = v
      .map((l) => l as Record<string, unknown>)
      .filter((l) => str(l?.project) && str(l?.label))
      .map((l) => ({ project: str(l.project)!, label: str(l.label)! }));
    return out.length ? out : undefined;
  };
  const parts = Array.isArray(b.parts)
    ? b.parts.map(str).filter((p): p is string => Boolean(p)).slice(0, 4)
    : undefined;

  return {
    zone: str(b.zone),
    shape: b.shape === "library" ? "library" : "service",
    parts: parts?.length ? parts : undefined,
    uses: links(b.uses),
    sameProblem: links(b.sameProblem),
    caption: str(b.caption),
    note: str(b.note),
    audience: str(b.audience),
    audienceLabel: str(b.audienceLabel),
  };
}

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;

  const strings = ["slug", "title", "summary", "role", "timeline"];
  if (!strings.every((k) => typeof p[k] === "string" && p[k] !== "")) return false;

  /*
    Sections carry the whole write-up, so a malformed one is worth rejecting
    rather than rendering as a blank heading. An empty array is allowed — a
    project may legitimately be a summary and a link.
  */
  if (!Array.isArray(p.sections)) return false;
  if (
    !p.sections.every(
      (s) =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as ProjectSection).title === "string" &&
        (s as ProjectSection).title.trim() !== "" &&
        typeof (s as ProjectSection).body === "string",
    )
  ) {
    return false;
  }

  if (!Array.isArray(p.domains) || !Array.isArray(p.capabilities)) return false;
  if (!Array.isArray(p.stack) || !Array.isArray(p.metrics)) return false;
  if (!Array.isArray(p.links)) return false;
  if (typeof p.featured !== "boolean") return false;

  /*
    Media was added after the first entries were written, so an absent array is
    treated as empty rather than as malformed — otherwise adding the field would
    have silently dropped every project that predates it. Present-but-wrong is
    still a failure.
  */
  if (p.media !== undefined && !Array.isArray(p.media)) return false;
  if (
    Array.isArray(p.media) &&
    !p.media.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as ProjectMedia).src === "string" &&
        typeof (m as ProjectMedia).alt === "string" &&
        typeof (m as ProjectMedia).width === "number" &&
        typeof (m as ProjectMedia).height === "number",
    )
  ) {
    return false;
  }

  // Optional, but a thumbnail that is present must be a complete image record.
  if (p.thumbnail !== undefined && !isMedia(p.thumbnail)) return false;

  // Unknown taxonomy values would silently create empty matrix axes.
  const domainsOk = p.domains.every((d) => DOMAINS.includes(d as never));
  const capsOk = p.capabilities.every((c) => CAPABILITIES.includes(c as never));

  return domainsOk && capsOk;
}

export const projects: Project[] = (raw as unknown[])
  .filter((entry, i) => {
    if (isProject(entry)) return true;
    console.warn(`[projects] Skipping malformed entry at index ${i}.`);
    return false;
  })
  /*
    Media is normalised to an array here so every consumer can map over it
    without a guard, rather than each render site repeating the same check.
  */
  .map((entry) => {
    const project = entry as Project;
    return {
      ...project,
      media: project.media ?? [],
      sections: project.sections ?? [],
      board: normaliseBoard(project.board),
    };
  });

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
