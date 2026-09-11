import { cvs, getCV } from "@/content/cvs";
import { renderCVPdf } from "@/lib/cv-pdf";
import { site } from "@/content/site";

/**
 * Serves a CV as a real PDF.
 *
 * The public URL is `/cv/<handle>.pdf`, rewritten here by `next.config.ts` —
 * a literal `[handle].pdf` segment would sit alongside `[profile]` at the same
 * level, and two dynamic segments there cannot both match.
 */
export function generateStaticParams() {
  return cvs.map((cv) => ({ profile: cv.handle }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profile: string }> },
) {
  const { profile } = await params;
  const cv = getCV(profile);

  if (!cv) return new Response("Not found", { status: 404 });

  const pdf = await renderCVPdf(cv);

  // A readable filename matters: this is what lands in a recruiter's downloads
  // folder, where "cv.pdf" is indistinguishable from every other applicant's.
  const filename = `${site.name.replace(/\s+/g, "-")}-${cv.handle}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` so the link previews in the browser rather than forcing a
      // download; the filename still applies when it is saved.
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
