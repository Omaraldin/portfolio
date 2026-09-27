import type { Metadata } from "next";
import { certifications } from "@/content/certifications";
import { CertificationGrid } from "@/components/certification-grid";
import { EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Credentials, with the certificate itself attached to each one.",
};

export default function CertificationsPage() {
  return (
    <>
      <PageTitle
        index="receipts"
        emoji="🏅"
        title="Certifications"
        intro="Each entry carries the certificate itself. Open one to read it in full."
      />

      <div className="pt-6">
        {certifications.length > 0 ? (
          <CertificationGrid certifications={certifications} />
        ) : (
          <EmptyState>Nothing recorded yet</EmptyState>
        )}
      </div>
    </>
  );
}
