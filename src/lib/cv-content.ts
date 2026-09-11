import { awards, community, education, experience, skills } from "@/content/cv";
import { certifications, hasExpired } from "@/content/certifications";
import { languages } from "@/content/languages";
import { projects } from "@/content/projects";
import { formatMonth } from "@/lib/format";
import {
  ATS_HEADINGS,
  parseCustomBody,
  type CVSection,
  type DerivedSectionKind,
} from "@/content/cv-types";

/**
 * A section flattened into plain records, so the screen, print, and PDF
 * renderers all work from the same resolved content rather than each reaching
 * into the source data and drifting apart.
 */
export type ResolvedEntry = {
  /** Job title, degree, project name, award. */
  title: string;
  /** Employer, institution, issuer. Empty when there is none. */
  org: string;
  /** Dates or timeline. Empty when unknown. */
  timeline: string;
  /** Supporting line — a project summary, a location. */
  detail: string;
  /** Real bullets, rendered as list items so extraction keeps them separate. */
  bullets: string[];
};

export type ResolvedSection =
  | { kind: "entries"; heading: string; entries: ResolvedEntry[] }
  | {
      kind: "definitions";
      heading: string;
      /** Label/value pairs, used for skills. */
      items: Array<{ label: string; value: string }>;
    }
  | {
      kind: "prose";
      heading: string;
      blocks: ReturnType<typeof parseCustomBody>;
    };

/**
 * How many projects a CV carries. Four is roughly what fits on a single page
 * alongside experience and skills, which is the length a recent graduate should
 * be sending.
 */
const MAX_CV_PROJECTS = 4;

/** Headings used on screen, where a little more character is fine. */
const SCREEN_HEADINGS: Record<DerivedSectionKind, string> = {
  experience: "Experience",
  projects: "Selected projects",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  community: "Community",
  awards: "Awards",
};

/**
 * Resolves one configured section into renderable content.
 *
 * `ats` swaps the headings for the conventional ones a parser matches on and
 * joins skills with commas rather than middle dots, which tokenizers routinely
 * fail to split.
 */
export function resolveSection(
  section: CVSection,
  { ats = false }: { ats?: boolean } = {},
): ResolvedSection | null {
  if (section.kind === "custom") {
    const blocks = parseCustomBody(section.body);
    if (!blocks.length) return null;

    return {
      kind: "prose",
      heading: ats ? section.heading.toUpperCase() : section.heading,
      blocks,
    };
  }

  const heading =
    section.heading ??
    (ats ? ATS_HEADINGS[section.source] : SCREEN_HEADINGS[section.source]);

  switch (section.source) {
    case "experience": {
      const entries = experience.map((e) => ({
        title: e.title,
        org: e.org,
        timeline: e.timeline,
        detail: e.location ?? "",
        bullets: e.bullets,
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }

    case "projects": {
      // A CV is a summary, not the full index — /work carries everything. The
      // cap is what keeps the document to one page as projects accumulate.
      const entries = projects.slice(0, MAX_CV_PROJECTS).map((p) => ({
        title: p.title,
        org: p.role,
        timeline: p.timeline,
        detail: p.summary,
        // The stack reads as a keyword line, which is exactly what an ATS
        // scores against, so it is a bullet rather than decorative metadata.
        bullets: [`Technologies: ${p.stack.join(", ")}`],
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }

    case "skills": {
      const items = Object.entries(skills)
        .filter(([, values]) => values.length)
        .map(([label, values]) => ({
          label,
          // Commas parse reliably; middle dots frequently do not.
          value: ats ? values.join(", ") : values.join(" · "),
        }));
      return items.length ? { kind: "definitions", heading, items } : null;
    }

    case "education": {
      const entries = education.map((e) => ({
        title: e.title,
        org: e.org,
        timeline: e.timeline,
        detail: e.location ?? "",
        bullets: e.bullets,
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }

    case "certifications": {
      const entries = certifications.map((c) => ({
        title: c.name,
        org: c.issuer,
        timeline: c.issued ? formatMonth(c.issued) : "",
        detail: [
          c.credentialId ? `Credential ID ${c.credentialId}` : "",
          hasExpired(c) ? "Expired" : "",
        ]
          .filter(Boolean)
          .join(" · "),
        bullets: [],
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }

    case "languages": {
      // Same label/value shape as skills: the language is the label, the
      // proficiency the value, which keeps the pair adjacent when extracted.
      const items = languages.map((l) => ({
        label: l.name,
        value: l.level,
      }));
      return items.length ? { kind: "definitions", heading, items } : null;
    }

    case "community": {
      const entries = community.map((e) => ({
        title: e.title,
        org: e.org,
        timeline: e.timeline,
        detail: e.location ?? "",
        bullets: e.bullets,
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }

    case "awards": {
      const entries = awards.map((e) => ({
        title: e.title,
        org: e.org,
        timeline: e.timeline === "—" ? "" : e.timeline,
        detail: "",
        bullets: e.bullets,
      }));
      return entries.length ? { kind: "entries", heading, entries } : null;
    }
  }
}
