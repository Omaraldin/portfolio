import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cvs, getCV } from "@/content/cvs";
import { CVDocument } from "@/components/cv-document";
import { CVActions, ProfileSwitch } from "@/components/profile-switch";

export function generateStaticParams() {
  return cvs.map((cv) => ({ profile: cv.handle }));
}

export async function generateMetadata(
  props: PageProps<"/cv/[profile]">,
): Promise<Metadata> {
  const { profile } = await props.params;
  const cv = getCV(profile);
  if (!cv) return {};

  return {
    title: `CV — ${cv.title}`,
    description: cv.summary,
  };
}

export default async function CVProfilePage(
  props: PageProps<"/cv/[profile]">,
) {
  const { profile } = await props.params;
  const cv = getCV(profile);
  if (!cv) notFound();

  return (
    <div className="pt-16">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-muted">
          The same record, arranged for the role. Each version has its own
          sections and ordering, and downloads as a PDF built for applicant
          tracking systems.
        </p>
        <CVActions handle={cv.handle} />
      </div>

      <ProfileSwitch active={cv.handle} />

      <div className="pt-8">
        <CVDocument cv={cv} />
      </div>
    </div>
  );
}
