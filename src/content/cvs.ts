import raw from "@/data/cvs.json";
import {
  DERIVED_SECTIONS,
  type CV,
  type CVSection,
  type DerivedSectionKind,
} from "./cv-types";

/**
 * CVs are stored as JSON so the admin panel can rewrite them, which means the
 * compiler cannot vouch for the file's shape. Entries are normalised here
 * instead: a malformed section is dropped rather than crashing the build, since
 * one bad block should not take the site down.
 */
function normaliseSection(value: unknown): CVSection | null {
  if (typeof value !== "object" || value === null) return null;
  const s = value as Record<string, unknown>;

  const visible = s.visible !== false;

  if (s.kind === "custom") {
    const heading = typeof s.heading === "string" ? s.heading.trim() : "";
    const body = typeof s.body === "string" ? s.body : "";
    if (!heading) return null;

    return {
      kind: "custom",
      id: typeof s.id === "string" && s.id ? s.id : heading.toLowerCase(),
      heading,
      body,
      visible,
    };
  }

  const source = s.source;
  if (!DERIVED_SECTIONS.includes(source as DerivedSectionKind)) return null;

  return {
    kind: "derived",
    source: source as DerivedSectionKind,
    heading:
      typeof s.heading === "string" && s.heading.trim()
        ? s.heading.trim()
        : undefined,
    visible,
  };
}

function normalise(value: unknown): CV | null {
  if (typeof value !== "object" || value === null) return null;
  const c = value as Record<string, unknown>;

  const str = (key: string) =>
    typeof c[key] === "string" ? (c[key] as string).trim() : "";

  const handle = str("handle");
  const title = str("title");
  if (!handle || !title) return null;

  return {
    handle,
    label: str("label") || title,
    title,
    summary: str("summary"),
    sections: Array.isArray(c.sections)
      ? c.sections
          .map(normaliseSection)
          .filter((s): s is CVSection => s !== null)
      : [],
  };
}

export const cvs: CV[] = (raw as unknown[])
  .map(normalise)
  .filter((c): c is CV => c !== null);

export function getCV(handle: string): CV | undefined {
  return cvs.find((c) => c.handle === handle);
}

/** Sections that should actually render, in their configured order. */
export function visibleSections(cv: CV): CVSection[] {
  return cv.sections.filter((s) => s.visible);
}
