import { readCVs } from "@/lib/admin-store";
import { assertLocalOnly } from "@/lib/admin-guard";
import { CVEditor } from "@/components/admin/cv-editor";

export const dynamic = "force-dynamic";

export default function AdminCVPage() {
  assertLocalOnly();
  return <CVEditor cvs={readCVs()} />;
}
