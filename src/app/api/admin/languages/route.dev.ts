import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import { readLanguages, writeLanguages } from "@/lib/admin-store";
import type { Language } from "@/content/languages";

function parseLanguages(input: unknown): Language[] {
  if (!Array.isArray(input)) throw new Error("Expected an array.");

  return input
    .map((value) => {
      if (typeof value !== "object" || value === null) return null;
      const l = value as Record<string, unknown>;

      const name = typeof l.name === "string" ? l.name.trim() : "";
      // A level with no language has nothing to attach to, so the name is what
      // decides whether the row survives.
      if (!name) return null;

      return {
        name,
        level: typeof l.level === "string" ? l.level.trim() : "",
      };
    })
    .filter((l): l is Language => l !== null);
}

export async function GET() {
  assertLocalOnly();
  return NextResponse.json(readLanguages());
}

export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const languages = parseLanguages(await request.json());
    writeLanguages(languages);
    return NextResponse.json({ ok: true, languages });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
