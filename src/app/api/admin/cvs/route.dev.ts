import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import { assertSafeSlug, readCVs, writeCVs } from "@/lib/admin-store";
import { DERIVED_SECTIONS, type CV, type CVSection } from "@/content/cv-types";

function parseSection(input: unknown): CVSection | null {
  if (typeof input !== "object" || input === null) return null;
  const s = input as Record<string, unknown>;

  const str = (key: string) =>
    typeof s[key] === "string" ? (s[key] as string).trim() : "";
  const visible = s.visible !== false;

  if (s.kind === "custom") {
    const heading = str("heading");
    // A custom section with no heading has nothing to render under, so it is
    // dropped rather than saved as an untitled block.
    if (!heading) return null;

    return {
      kind: "custom",
      id: str("id") || heading.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      heading,
      body: typeof s.body === "string" ? s.body : "",
      visible,
    };
  }

  const source = s.source;
  if (!DERIVED_SECTIONS.includes(source as never)) return null;

  const heading = str("heading");
  return {
    kind: "derived",
    source: source as CVSection extends { source: infer T } ? T : never,
    ...(heading ? { heading } : {}),
    visible,
  } as CVSection;
}

function parseCV(input: unknown): CV {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected an object.");
  }
  const c = input as Record<string, unknown>;

  const str = (key: string) =>
    typeof c[key] === "string" ? (c[key] as string).trim() : "";

  const handle = str("handle");
  assertSafeSlug(handle);

  const title = str("title");
  if (!title) throw new Error("A title is required.");

  const sections = Array.isArray(c.sections)
    ? c.sections.map(parseSection).filter((s): s is CVSection => s !== null)
    : [];

  if (!sections.length) throw new Error("At least one section is required.");

  return {
    handle,
    label: str("label") || title,
    title,
    summary: str("summary"),
    sections,
  };
}

export async function GET() {
  assertLocalOnly();
  return NextResponse.json(readCVs());
}

export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const body = (await request.json()) as {
      cv: unknown;
      originalHandle?: string;
    };

    const cv = parseCV(body.cv);
    const all = readCVs();
    const original = body.originalHandle ?? cv.handle;
    const index = all.findIndex((c) => c.handle === original);

    // A rename must not silently overwrite a different existing CV.
    const collision = all.findIndex((c) => c.handle === cv.handle);
    if (collision >= 0 && collision !== index) {
      throw new Error(`A CV with the handle "${cv.handle}" exists.`);
    }

    if (index >= 0) all[index] = cv;
    else all.push(cv);

    writeCVs(all);
    return NextResponse.json({ ok: true, cv });
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
    const { handle } = (await request.json()) as { handle: string };
    assertSafeSlug(handle);

    const all = readCVs();
    const remaining = all.filter((c) => c.handle !== handle);

    if (remaining.length === all.length) {
      throw new Error(`No CV named "${handle}".`);
    }
    // The CV route falls back to the first entry, so an empty file would leave
    // /cv with nothing to show.
    if (!remaining.length) {
      throw new Error("At least one CV must remain.");
    }

    writeCVs(remaining);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
