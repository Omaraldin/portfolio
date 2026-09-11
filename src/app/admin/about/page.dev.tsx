import { readAbout, readLanguages } from "@/lib/admin-store";
import { assertLocalOnly } from "@/lib/admin-guard";
import { AboutEditor } from "@/components/admin/about-editor";
import { LanguagesEditor } from "@/components/admin/languages-editor";

export const dynamic = "force-dynamic";

export default function AdminAboutPage() {
  assertLocalOnly();

  return (
    <div className="space-y-10">
      <AboutEditor about={readAbout()} />

      <section className="border-t border-rule pt-6">
        <h2 className="mb-3 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-muted uppercase">
          Languages
        </h2>
        <LanguagesEditor languages={readLanguages()} />
      </section>
    </div>
  );
}
