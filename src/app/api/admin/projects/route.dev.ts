import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import { assertSafeSlug, readProjects, writeProjects } from "@/lib/admin-store";
import { CAPABILITIES, DOMAINS } from "@/content/taxonomy";
import type { Project } from "@/content/types";
import { normaliseBoard } from "@/content/projects";

/**
 * Validates a project submitted from the panel. The panel is the only caller,
 * but it posts JSON, so the payload is still checked before it reaches disk —
 * a malformed write would break the site's build.
 */
function parseProject(input: unknown): Project {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected an object.");
  }
  const p = input as Record<string, unknown>;

  const str = (key: string, required = true): string => {
    const value = p[key];
    if (typeof value !== "string" || (required && !value.trim())) {
      throw new Error(`Field "${key}" is required.`);
    }
    return value.trim();
  };

  const strList = (key: string): string[] =>
    Array.isArray(p[key])
      ? (p[key] as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
      : [];

  const slug = str("slug");
  assertSafeSlug(slug);

  const domains = strList("domains").filter((d) =>
    DOMAINS.includes(d as never),
  ) as Project["domains"];
  const capabilities = strList("capabilities").filter((c) =>
    CAPABILITIES.includes(c as never),
  ) as Project["capabilities"];

  if (!domains.length) throw new Error("At least one domain is required.");
  if (!capabilities.length) {
    throw new Error("At least one capability is required.");
  }

  const metrics = Array.isArray(p.metrics)
    ? (p.metrics as unknown[])
        .map((m) => m as Record<string, unknown>)
        .filter((m) => typeof m?.value === "string" && typeof m?.label === "string")
        .map((m) => ({
          value: String(m.value).trim(),
          label: String(m.label).trim(),
        }))
        .filter((m) => m.value && m.label)
    : [];

  /*
    A section with a title but no body is kept: it is a heading the author has
    added and not yet filled in, and silently dropping it on save would lose
    work in progress. A section with neither is dropped.
  */
  const sections = Array.isArray(p.sections)
    ? (p.sections as unknown[])
        .map((s) => s as Record<string, unknown>)
        .filter((s) => typeof s?.title === "string")
        .map((s) => ({
          title: String(s.title).trim(),
          body: typeof s.body === "string" ? s.body.trim() : "",
        }))
        .filter((s) => s.title)
    : [];

  const links = Array.isArray(p.links)
    ? (p.links as unknown[])
        .map((l) => l as Record<string, unknown>)
        .filter((l) => typeof l?.label === "string" && typeof l?.href === "string")
        .map((l) => ({
          label: String(l.label).trim(),
          href: String(l.href).trim(),
        }))
        .filter((l) => l.label && l.href)
    : [];

  /*
    Width and height are carried through rather than recomputed: the upload
    endpoint reads them from the file itself, so by the time a record reaches
    here the numbers are already trustworthy. An entry missing either is
    dropped, since a media item without dimensions would reflow the page.
  */
  const media = Array.isArray(p.media)
    ? (p.media as unknown[])
        .map((m) => m as Record<string, unknown>)
        .filter(
          (m) =>
            typeof m?.src === "string" &&
            typeof m?.alt === "string" &&
            Number.isFinite(Number(m?.width)) &&
            Number.isFinite(Number(m?.height)),
        )
        .map((m) => {
          const caption =
            typeof m.caption === "string" ? m.caption.trim() : "";
          return {
            src: String(m.src).trim(),
            alt: String(m.alt).trim(),
            width: Number(m.width),
            height: Number(m.height),
            // Omitted entirely when blank, rather than stored as "".
            ...(caption ? { caption } : {}),
          };
        })
        .filter((m) => m.src && m.width > 0 && m.height > 0)
    : [];

  /*
    Same rules as a media entry: the upload endpoint supplied the dimensions,
    and a record missing any of them is treated as no thumbnail at all.
  */
  const t = p.thumbnail as Record<string, unknown> | null | undefined;
  const thumbnail =
    t &&
    typeof t.src === "string" &&
    t.src.trim() &&
    Number(t.width) > 0 &&
    Number(t.height) > 0
      ? {
          src: t.src.trim(),
          alt: typeof t.alt === "string" ? t.alt.trim() : "",
          width: Number(t.width),
          height: Number(t.height),
        }
      : undefined;

  return {
    slug,
    title: str("title"),
    summary: str("summary"),
    sections,
    role: str("role"),
    timeline: str("timeline"),
    metrics,
    domains,
    capabilities,
    stack: strList("stack"),
    links,
    media,
    // Omitted when absent, so the JSON stays free of empty placeholders.
    ...(thumbnail ? { thumbnail } : {}),
    // Board data is carried through, or every save from the panel would wipe it.
    ...(normaliseBoard(p.board) ? { board: normaliseBoard(p.board) } : {}),
    featured: Boolean(p.featured),
  };
}

export async function GET() {
  assertLocalOnly();
  return NextResponse.json(readProjects());
}

/** Creates a project, or replaces the one matching `originalSlug`. */
export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const body = (await request.json()) as {
      project: unknown;
      originalSlug?: string;
    };

    const project = parseProject(body.project);
    const projects = readProjects();
    const original = body.originalSlug ?? project.slug;
    const index = projects.findIndex((p) => p.slug === original);

    // A rename must not silently overwrite a different existing project.
    const collision = projects.findIndex((p) => p.slug === project.slug);
    if (collision >= 0 && collision !== index) {
      throw new Error(`A project with the slug "${project.slug}" exists.`);
    }

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    writeProjects(projects);
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  assertLocalOnly();

  try {
    const { slug } = (await request.json()) as { slug: string };
    assertSafeSlug(slug);

    const projects = readProjects();
    const remaining = projects.filter((p) => p.slug !== slug);
    if (remaining.length === projects.length) {
      throw new Error(`No project named "${slug}".`);
    }

    writeProjects(remaining);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
