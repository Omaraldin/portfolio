/**
 * A CV is an ordered list of sections over data that already exists elsewhere
 * on the site, plus any custom sections written for that CV alone.
 *
 * The previous model had five fixed profiles whose content was derived from a
 * domain priority list. That made every CV a variation on one shape; this one
 * lets each CV be its own document while still drawing from a single source of
 * truth for the underlying records.
 */

/** Sections whose content comes from existing site data. */
export const DERIVED_SECTIONS = [
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
  "languages",
  "community",
  "awards",
] as const;

export type DerivedSectionKind = (typeof DERIVED_SECTIONS)[number];

export const SECTION_LABELS: Record<DerivedSectionKind, string> = {
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  community: "Community",
  awards: "Awards",
};

/**
 * Headings recruiters and parsers expect. The screen version may show a more
 * characterful label, but the printed and PDF versions use these — an ATS
 * matching on "Work Experience" will not recognise "What I have shipped".
 */
export const ATS_HEADINGS: Record<DerivedSectionKind, string> = {
  experience: "WORK EXPERIENCE",
  projects: "PROJECTS",
  skills: "SKILLS",
  education: "EDUCATION",
  certifications: "CERTIFICATIONS",
  languages: "LANGUAGES",
  community: "LEADERSHIP AND VOLUNTEERING",
  awards: "AWARDS AND HONORS",
};

export type CVSection =
  | {
      kind: "derived";
      /** Which body of existing data this section renders. */
      source: DerivedSectionKind;
      /** Overrides the default heading when set. */
      heading?: string;
      visible: boolean;
    }
  | {
      kind: "custom";
      /** Stable id so reordering does not lose the block. */
      id: string;
      heading: string;
      /** Free text. Blank lines separate paragraphs; "- " starts a bullet. */
      body: string;
      visible: boolean;
    };

export type CV = {
  /** URL segment. Also the PDF filename. */
  handle: string;
  /** Shown on the profile switch. */
  label: string;
  /** The role title printed at the top of this CV. */
  title: string;
  /** Two or three sentences, written for this CV. */
  summary: string;
  sections: CVSection[];
};

/** Splits a custom section body into paragraphs and bullet groups. */
export function parseCustomBody(
  body: string,
): Array<{ type: "paragraph"; text: string } | { type: "list"; items: string[] }> {
  const blocks: Array<
    { type: "paragraph"; text: string } | { type: "list"; items: string[] }
  > = [];

  for (const chunk of body.split(/\n\s*\n/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim());

    // A chunk is a list when every line in it is a bullet, which keeps a
    // paragraph that merely contains a dash from being misread.
    if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ type: "list", items: lines.map((l) => l.slice(2).trim()) });
    } else {
      blocks.push({ type: "paragraph", text: lines.join(" ") });
    }
  }

  return blocks;
}
