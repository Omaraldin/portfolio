import { readProjects } from "@/lib/admin-store";
import { assertLocalOnly } from "@/lib/admin-guard";
import { WorkEditor } from "@/components/admin/work-editor";

// Read from disk on every request so the list reflects saves immediately.
export const dynamic = "force-dynamic";

export default function AdminWorkPage() {
  assertLocalOnly();
  return <WorkEditor projects={readProjects()} />;
}
