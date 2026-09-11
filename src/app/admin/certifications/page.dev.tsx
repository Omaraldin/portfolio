import { readCertifications } from "@/lib/admin-store";
import { assertLocalOnly } from "@/lib/admin-guard";
import { CertificationsEditor } from "@/components/admin/certifications-editor";

export const dynamic = "force-dynamic";

export default function AdminCertificationsPage() {
  assertLocalOnly();
  return <CertificationsEditor certifications={readCertifications()} />;
}
