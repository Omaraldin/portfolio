import raw from "@/data/about.json";

export type AboutSection = {
  title: string;
  paragraphs: string[];
};

export type About = {
  /** Shown under the page title. */
  intro: string;
  sections: AboutSection[];
};

/**
 * Prose for the About page, kept as data rather than JSX so the admin panel can
 * edit it. Validated at the boundary for the same reason as projects.
 */
export const about: About = {
  intro: typeof raw.intro === "string" ? raw.intro : "",
  sections: Array.isArray(raw.sections)
    ? raw.sections.filter(
        (s): s is AboutSection =>
          typeof s?.title === "string" &&
          Array.isArray(s?.paragraphs) &&
          s.paragraphs.every((p) => typeof p === "string"),
      )
    : [],
};
