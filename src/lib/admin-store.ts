import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { About } from "@/content/about";
import type { Certification } from "@/content/certifications";
import type { CV } from "@/content/cv-types";
import type { Language } from "@/content/languages";
import type { Project } from "@/content/types";

const ROOT = process.cwd();
const PROJECTS_FILE = path.join(ROOT, "src", "data", "projects.json");
const ABOUT_FILE = path.join(ROOT, "src", "data", "about.json");
const CERTIFICATIONS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "certifications.json",
);
const CVS_FILE = path.join(ROOT, "src", "data", "cvs.json");
const LANGUAGES_FILE = path.join(ROOT, "src", "data", "languages.json");
const ARTICLES_DIR = path.join(ROOT, "src", "articles");

/**
 * Writes JSON atomically: content is written to a sibling temp file and then
 * renamed over the target. A crash mid-write therefore leaves the original
 * intact rather than a truncated file the site cannot parse.
 */
function writeJsonAtomic(file: string, value: unknown): void {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}

function writeTextAtomic(file: string, value: string): void {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, value, "utf8");
  fs.renameSync(temp, file);
}

/**
 * Slugs become file paths, so anything that could escape the content
 * directories has to be rejected rather than sanitised — silently rewriting a
 * slug would let a request write somewhere the caller did not expect.
 */
export function assertSafeSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "Slug must be lowercase letters, digits, and single hyphens.",
    );
  }
}

export function readProjects(): Project[] {
  const projects = JSON.parse(
    fs.readFileSync(PROJECTS_FILE, "utf8"),
  ) as Project[];

  /*
    `media` and `sections` were both added after the first entries were written,
    so records on disk may not carry them. Normalised on read rather than left
    to each caller: the panel edits these objects directly, and an undefined
    array there is a crash rather than an empty list.
  */
  return projects.map((project) => ({
    ...project,
    media: project.media ?? [],
    sections: project.sections ?? [],
  }));
}

export function writeProjects(projects: Project[]): void {
  writeJsonAtomic(PROJECTS_FILE, projects);
}

export function readLanguages(): Language[] {
  return JSON.parse(fs.readFileSync(LANGUAGES_FILE, "utf8")) as Language[];
}

export function writeLanguages(languages: Language[]): void {
  writeJsonAtomic(LANGUAGES_FILE, languages);
}

export function readCVs(): CV[] {
  return JSON.parse(fs.readFileSync(CVS_FILE, "utf8")) as CV[];
}

export function writeCVs(cvs: CV[]): void {
  writeJsonAtomic(CVS_FILE, cvs);
}

export function readCertifications(): Certification[] {
  return JSON.parse(
    fs.readFileSync(CERTIFICATIONS_FILE, "utf8"),
  ) as Certification[];
}

export function writeCertifications(certifications: Certification[]): void {
  writeJsonAtomic(CERTIFICATIONS_FILE, certifications);
}

export function readAbout(): About {
  return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf8")) as About;
}

export function writeAbout(about: About): void {
  writeJsonAtomic(ABOUT_FILE, about);
}

export type ArticleFile = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  related: string[];
  draft: boolean;
  body: string;
  /** Path under /public. Thumbnail, hero, and social preview image. */
  cover: string;
  coverAlt: string;
  /** ISO date of the last meaningful edit. Blank means never revised. */
  updated: string;
};

function articlePath(slug: string): string {
  assertSafeSlug(slug);
  return path.join(ARTICLES_DIR, `${slug}.mdx`);
}

export function readArticleFile(slug: string): ArticleFile | null {
  const file = articlePath(slug);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    related: Array.isArray(data.related) ? data.related.map(String) : [],
    draft: Boolean(data.draft),
    cover: String(data.cover ?? ""),
    coverAlt: String(data.coverAlt ?? ""),
    updated: String(data.updated ?? ""),
    body: content.trim(),
  };
}

/**
 * Every article on disk, drafts included, newest first. The public reader hides
 * drafts in production; the panel must always show them.
 */
export function readArticleFiles(): ArticleFile[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => readArticleFile(f.replace(/\.mdx?$/, "")))
    .filter((a): a is ArticleFile => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function writeArticleFile(article: ArticleFile): void {
  const file = articlePath(article.slug);

  // Built by hand rather than with a YAML serialiser: the frontmatter shape is
  // fixed and small, and quoting every string keeps colons in titles safe.
  const quote = (value: string) => JSON.stringify(value);
  const list = (values: string[]) =>
    `[${values.map((v) => JSON.stringify(v)).join(", ")}]`;

  const frontmatter = [
    "---",
    `title: ${quote(article.title)}`,
    `description: ${quote(article.description)}`,
    `date: ${quote(article.date)}`,
    `tags: ${list(article.tags)}`,
    ...(article.related.length ? [`related: ${list(article.related)}`] : []),
    // Optional fields are omitted entirely rather than written empty, which
    // keeps the frontmatter of a simple post short.
    ...(article.cover ? [`cover: ${quote(article.cover)}`] : []),
    ...(article.coverAlt ? [`coverAlt: ${quote(article.coverAlt)}`] : []),
    ...(article.updated ? [`updated: ${quote(article.updated)}`] : []),
    `draft: ${article.draft}`,
    "---",
    "",
  ].join("\n");

  writeTextAtomic(file, `${frontmatter}${article.body.trim()}\n`);
}

export function deleteArticleFile(slug: string): void {
  const file = articlePath(slug);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

/** Renaming is a write-then-delete so a failed write cannot lose the original. */
export function renameArticleFile(from: string, to: string): void {
  if (from === to) return;

  const existing = readArticleFile(from);
  if (!existing) throw new Error(`No article named "${from}".`);
  if (readArticleFile(to)) throw new Error(`An article named "${to}" exists.`);

  writeArticleFile({ ...existing, slug: to });
  deleteArticleFile(from);
}
