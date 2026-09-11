import { readArticleFiles } from "@/lib/admin-store";
import { assertLocalOnly } from "@/lib/admin-guard";
import { WritingEditor } from "@/components/admin/writing-editor";

export const dynamic = "force-dynamic";

export default function AdminWritingPage() {
  assertLocalOnly();
  return <WritingEditor articles={readArticleFiles()} />;
}
