import raw from "@/data/certifications.json";

export type Certification = {
  slug: string;
  name: string;
  issuer: string;
  /** Month granularity: YYYY-MM. Empty when not recorded. */
  issued: string;
  /** Empty when the credential does not lapse. */
  expires: string;
  credentialId: string;
  /** Verification page, which is what turns a claim into something checkable. */
  url: string;
  /**
   * The certificate itself, as a path under /public. A PDF has its first page
   * rendered as the thumbnail; an image is used directly. Empty falls back to a
   * text-only card.
   */
  document: string;
  /** Surfaces in the compact strip on the home page. */
  featured: boolean;
};

/** Whether a document path points at a PDF rather than an image. */
export function isPdf(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf");
}

/**
 * Every field except the name and issuer is optional, so entries are normalised
 * rather than rejected — a certification with only a name and issuer is still
 * worth showing, and the UI hides whatever is missing.
 */
function normalise(value: unknown): Certification | null {
  if (typeof value !== "object" || value === null) return null;
  const c = value as Record<string, unknown>;

  const str = (key: string) =>
    typeof c[key] === "string" ? (c[key] as string).trim() : "";

  const name = str("name");
  const issuer = str("issuer");
  if (!name || !issuer) return null;

  return {
    slug: str("slug") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    issuer,
    issued: str("issued"),
    expires: str("expires"),
    credentialId: str("credentialId"),
    url: str("url"),
    document: str("document"),
    featured: Boolean(c.featured),
  };
}

/** Newest first; entries without a date sort last. */
export const certifications: Certification[] = (raw as unknown[])
  .map(normalise)
  .filter((c): c is Certification => c !== null)
  .sort((a, b) => (b.issued || "").localeCompare(a.issued || ""));

export const featuredCertifications = certifications.filter((c) => c.featured);

/**
 * True when an expiry date has passed. Compared at month granularity, matching
 * how the dates are stored.
 */
export function hasExpired(certification: Certification): boolean {
  if (!certification.expires) return false;
  return certification.expires < new Date().toISOString().slice(0, 7);
}
