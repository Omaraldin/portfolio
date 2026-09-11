import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import { assertSafeSlug } from "@/lib/admin-store";
import { readImageSize } from "@/lib/image-size";

/*
  Uploads land under /public/media/<project-slug>/, which keeps a project's
  screenshots together and makes them trivial to remove with the project.
*/
const MEDIA_ROOT = path.join(process.cwd(), "public", "media");

/** Extensions the site can actually render, mapped from the declared MIME type. */
const ACCEPTED: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Turns an uploaded filename into something safe to place on disk. The result
 * is only ever a basename — any directory portion is discarded rather than
 * sanitised, so a crafted name cannot climb out of the media directory.
 */
function safeName(original: string, extension: string): string {
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base || "image"}${extension}`;
}

/** Adds -2, -3, … rather than overwriting a file that is already referenced. */
function uniquePath(directory: string, filename: string): string {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);

  let candidate = path.join(directory, filename);
  let counter = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${stem}-${counter}${extension}`);
    counter += 1;
  }
  return candidate;
}

export async function POST(request: Request) {
  assertLocalOnly();

  try {
    const form = await request.formData();
    const file = form.get("file");
    const slug = String(form.get("slug") ?? "").trim();

    if (!(file instanceof File)) throw new Error("No file was submitted.");
    assertSafeSlug(slug);

    const extension = ACCEPTED[file.type];
    if (!extension) {
      throw new Error(
        `Unsupported type "${file.type || "unknown"}". Use PNG, JPEG, WebP, GIF, or SVG.`,
      );
    }
    if (file.size > MAX_BYTES) {
      throw new Error(
        `File is ${(file.size / 1024 / 1024).toFixed(1)}MB; the limit is ${MAX_BYTES / 1024 / 1024}MB.`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    /*
      Dimensions come from the bytes rather than from the client. This doubles
      as a format check: a file whose header cannot be read is not the image it
      claims to be, whatever its MIME type says.
    */
    const size = readImageSize(buffer);
    if (!size || size.width <= 0 || size.height <= 0) {
      throw new Error("Could not read the image's dimensions.");
    }

    const directory = path.join(MEDIA_ROOT, slug);
    fs.mkdirSync(directory, { recursive: true });

    const target = uniquePath(directory, safeName(file.name, extension));
    fs.writeFileSync(target, buffer);

    // Public URLs are always forward-slashed, which path.join is not on Windows.
    const src = `/media/${slug}/${path.basename(target)}`;

    return NextResponse.json({
      ok: true,
      media: { src, alt: "", width: size.width, height: size.height },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}

/** Removes a file the panel uploaded. Restricted to the media directory. */
export async function DELETE(request: Request) {
  assertLocalOnly();

  try {
    const { src } = (await request.json()) as { src: string };

    if (typeof src !== "string" || !src.startsWith("/media/")) {
      throw new Error("Only uploaded media can be deleted.");
    }

    const target = path.join(process.cwd(), "public", src);

    // Resolve before comparing: this is what makes ../ escapes fail closed.
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(MEDIA_ROOT))) {
      throw new Error("Refusing to delete outside the media directory.");
    }

    if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
