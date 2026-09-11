import { NextResponse } from "next/server";
import { assertLocalOnly } from "@/lib/admin-guard";
import {
  assertSafeSlug,
  readCertifications,
  writeCertifications,
} from "@/lib/admin-store";
import type { Certification } from "@/content/certifications";

/**
 * Only the name and issuer are required — the rest of a credential's details
 * are frequently unavailable, and an entry without them is still worth showing.
 */
function parseCertification(input: unknown): Certification {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected an object.");
  }
  const c = input as Record<string, unknown>;

  const str = (key: string) =>
    typeof c[key] === "string" ? (c[key] as string).trim() : "";

  const name = str("name");
  const issuer = str("issuer");
  if (!name) throw new Error("A name is required.");
  if (!issuer) throw new Error("An issuer is required.");

  const slug = str("slug");
  assertSafeSlug(slug);

  // Dates are month-granular; anything else would break sorting and formatting.
  const month = (key: string) => {
    const value = str(key);
    if (value && !/^\d{4}-\d{2}$/.test(value)) {
      throw new Error(`"${key}" must be in YYYY-MM form.`);
    }
    return value;
  };

  const url = str("url");
  if (url && !/^https?:\/\//i.test(url)) {
    throw new Error("The verification link must start with http:// or https://");
  }

  // The document is rendered in an iframe and linked directly, so it has to be
  // a path inside /public rather than an arbitrary URL.
  const document_ = str("document");
  if (document_ && !/^\/[\w\-./]+\.(pdf|png|jpe?g|webp|avif)$/i.test(document_)) {
    throw new Error(
      "The document must be a path under /public, e.g. /certificates/aws.pdf",
    );
  }
  if (document_.includes("..")) {
    throw new Error("The document path may not traverse directories.");
  }

  return {
    slug,
    name,
    issuer,
    issued: month("issued"),
    expires: month("expires"),
    credentialId: str("credentialId"),
    url,
    document: document_,
    featured: Boolean(c.featured),
  };
}

export async function GET() {
  assertLocalOnly();
  return NextResponse.json(readCertifications());
}

export async function PUT(request: Request) {
  assertLocalOnly();

  try {
    const body = (await request.json()) as {
      certification: unknown;
      originalSlug?: string;
    };

    const certification = parseCertification(body.certification);
    const all = readCertifications();
    const original = body.originalSlug ?? certification.slug;
    const index = all.findIndex((c) => c.slug === original);

    // A rename must not silently overwrite a different existing entry.
    const collision = all.findIndex((c) => c.slug === certification.slug);
    if (collision >= 0 && collision !== index) {
      throw new Error(`A certification with the slug "${certification.slug}" exists.`);
    }

    if (index >= 0) {
      all[index] = certification;
    } else {
      all.push(certification);
    }

    writeCertifications(all);
    return NextResponse.json({ ok: true, certification });
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

    const all = readCertifications();
    const remaining = all.filter((c) => c.slug !== slug);
    if (remaining.length === all.length) {
      throw new Error(`No certification named "${slug}".`);
    }

    writeCertifications(remaining);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
