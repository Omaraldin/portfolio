import type { Metadata } from "next";
import { certifications } from "@/content/certifications";
import { CertificationGrid } from "@/components/certification-grid";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Credentials, with the certificate itself attached to each one.",
};

export default function CertificationsPage() {
  return (
    <>
      <PageTitle
        index="RECORD / CERTIFICATIONS"
        title="Certifications"
        intro="Each entry carries the certificate itself. Open one to read it in full."
      />

      <div className="pt-10">
        {certifications.length > 0 ? (
          <CertificationGrid certifications={certifications} />
        ) : (
          <p className="py-16 text-center font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
            Nothing recorded yet
          </p>
        )}
      </div>
    </>
  );
}
