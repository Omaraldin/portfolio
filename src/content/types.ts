import type { Capability, Domain } from "./taxonomy";

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectMedia = {
  /** Path under /public, or an absolute URL. */
  src: string;
  /**
   * Describes the image for screen readers. Required rather than optional —
   * a screenshot with no description is invisible to part of the audience.
   */
  alt: string;
  /** Shown beneath the image. Optional; omit when the alt text says enough. */
  caption?: string;
  /**
   * Intrinsic dimensions. Used to reserve space before the file loads, which
   * is what stops the page reflowing as images arrive.
   */
  width: number;
  height: number;
};

export type ProjectSection = {
  /** Rendered as the section heading, e.g. "Problem". */
  title: string;
  /**
   * Markdown/MDX. Goes through the same pipeline as articles, so lists, tables,
   * links and highlighted code all work.
   */
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  /** One line. Shown on index rows. */
  summary: string;
  /**
   * The write-up, in whatever shape the project needs. Problem/Approach/Outcome
   * is a good default rather than a requirement — a library wants an API tour, a
   * migration wants a before-and-after, and forcing either into three fixed
   * headings made them read like a form return.
   */
  sections: ProjectSection[];
  /** Hard numbers where they exist. An empty array is fine and common. */
  metrics: ProjectMetric[];
  domains: Domain[];
  capabilities: Capability[];
  stack: string[];
  role: string;
  /** e.g. "2025" or "2024 — 2025". */
  timeline: string;
  links: ProjectLink[];
  /**
   * Screenshots, diagrams, photographs. An empty array is fine and common —
   * plenty of work has nothing worth showing.
   */
  media: ProjectMedia[];
  /**
   * The cover image for cards and the top of the project page. Optional —
   * without one, cards fall back to the first screenshot, then to the domain
   * stickers. 16:10 crops best (e.g. 1600×1000).
   */
  thumbnail?: ProjectMedia;
  /** How the project is drawn on the home-page board. Optional. */
  board?: ProjectBoard;
  /** Surfaces on the home page. Choose for spread across domains, not recency. */
  featured: boolean;
};

export type ProjectMetric = {
  /** The number itself, e.g. "40%" or "12k". Rendered large, tabular. */
  value: string;
  /** What it measures. Rendered small, mono, beneath. */
  label: string;
};

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date: YYYY-MM-DD. */
  date: string;
  tags: string[];
  /** Minutes, computed at build time from the body. */
  readingTime: number;
  /** Slugs of projects this article refers to. Rendered as cross-references. */
  related?: string[];
  draft?: boolean;
  /**
   * Path under /public. Used as the thumbnail on the index, the hero on the
   * article, and the image a shared link previews with. Without one the article
   * falls back to a generated card.
   */
  cover?: string;
  /** Describes the cover for screen readers. Falls back to the title. */
  coverAlt?: string;
  /**
   * ISO date the article was last meaningfully changed. Search engines use it
   * to decide whether to recrawl, so it is separate from the publish date.
   */
  updated?: string;
};

export type Article = ArticleMeta & {
  /** Raw MDX body, without frontmatter. */
  body: string;
};

/**
 * A link between two projects on the board. Declared by hand, never inferred:
 * the board draws only what is actually true.
 */
export type BoardLink = {
  /** Slug of the other project. */
  project: string;
  /** Handwritten on the line, e.g. "signs people in". Keep it short. */
  label: string;
};

export type ProjectBoard = {
  /**
   * The board area this project sits in. Defaults to a zone derived from the
   * project's first domain, so unrelated work groups itself without setup.
   */
  zone?: string;
  /**
   * Which diagram symbol to draw: a library is a tabbed package, a service a
   * rounded box. Defaults to "service".
   */
  shape?: "service" | "library";
  /** The inside of the sketch, left to right, e.g. ["Go API", "queue", "Postgres"]. Up to four. */
  parts?: string[];
  /**
   * Projects this one depends on. Drawn as a solid arrow from the dependency to
   * this project, labelled with what the dependency does for it.
   */
  uses?: BoardLink[];
  /**
   * Projects that faced the same underlying problem in a different setting.
   * Drawn as a dashed line. Only for a genuine shared problem.
   */
  sameProblem?: BoardLink[];
  /** One muted line at the bottom of the sketch, e.g. "design → issue → email → verify". Defaults to the stack. */
  caption?: string;
  /** A short red annotation under the box, e.g. "live in prod!". */
  note?: string;
  /** Who uses it, drawn as stick figures below the box, e.g. "20+ chapters, Egypt". */
  audience?: string;
  /** Written on the arrow to the audience, e.g. "1,000+ certificates". */
  audienceLabel?: string;
};
