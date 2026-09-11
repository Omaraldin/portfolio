import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import { readAbout, writeAbout } from "@/lib/admin-store";
import type { About } from "@/content/about";

function parseAbout(input: unknown): About {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected an object.");
  }
  const a = input as Record<string, unknown>;

  const sections = Array.isArray(a.sections) ? a.sections : [];

  return {
    intro: String(a.intro ?? "").trim(),
    sections: sections
      .map((s) => s as Record<string, unknown>)
      .map((s) => ({
        title: String(s?.title ?? "").trim(),
        paragraphs: Array.isArray(s?.paragraphs)
          ? (s.paragraphs as unknown[])
              .map(String)
              .map((p) => p.trim())
              .filter(Boolean)
          : [],
      }))
      // An untitled or empty section would render as a bare rule on the page.
      .filter((s) => s.title && s.paragraphs.length),
  };
}

export async function GET() {
  assertLocalOnly();
  return NextResponse.json(readAbout());
}

export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const about = parseAbout(await request.json());
    writeAbout(about);
    return NextResponse.json({ ok: true, about });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
