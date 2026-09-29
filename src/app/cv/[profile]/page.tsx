import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cvs, getCV } from "@/content/cvs";
import { CVDocument } from "@/components/cv-document";
import { CVActions, ProfileSwitch } from "@/components/profile-switch";
import { PageTitle } from "@/components/ui";

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
    <div>
      <div className="no-print">
        <PageTitle
          index="curriculum vitae"
          title="One record, many roles"
          intro="The same record, arranged for the role. Each version has its own sections and ordering, and downloads as a PDF built for applicant tracking systems."
        />
        <CVActions handle={cv.handle} />
      </div>

      <ProfileSwitch active={cv.handle} />

      <div className="mt-8 rounded-[32px] border-2 border-rule bg-paper p-6 sm:p-12 print:m-0 print:rounded-none print:border-0 print:p-0">
        <CVDocument cv={cv} />
      </div>
    </div>
  );
}
