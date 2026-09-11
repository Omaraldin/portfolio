"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { About } from "@/content/about";
import { Button, Field, MonoArea, SaveState, TextArea, TextInput } from "./form";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

export function AboutEditor({ about }: { about: About }) {
  const router = useRouter();
  const [draft, setDraft] = useState<About>(about);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const setSection = (index: number, next: About["sections"][number]) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((s, i) => (i === index ? next : s)),
    }));
    setStatus({ kind: "idle" });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.sections.length) return;

    const sections = [...draft.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setDraft((current) => ({ ...current, sections }));
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Save failed." });
      return;
    }

    setStatus({ kind: "saved" });
    router.refresh();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Field label="Intro" hint="Shown under the page title.">
        <TextArea
          rows={2}
          value={draft.intro}
          onChange={(e) => {
            setDraft((c) => ({ ...c, intro: e.target.value }));
            setStatus({ kind: "idle" });
          }}
        />
      </Field>

      {draft.sections.map((section, index) => (
        <div key={index} className="border border-rule p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="tabular font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
              Section {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              <Button onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button
                onClick={() => move(index, 1)}
                disabled={index === draft.sections.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDraft((c) => ({
                    ...c,
                    sections: c.sections.filter((_, i) => i !== index),
                  }));
                  setStatus({ kind: "idle" });
                }}
              >
                Remove
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Heading">
              <TextInput
                value={section.title}
                onChange={(e) =>
                  setSection(index, { ...section, title: e.target.value })
                }
              />
            </Field>

            <Field
              label="Paragraphs"
              hint="Separate paragraphs with a blank line."
            >
              <MonoArea
                rows={8}
                value={section.paragraphs.join("\n\n")}
                onChange={(e) =>
                  setSection(index, {
                    ...section,
                    paragraphs: e.target.value
                      .split(/\n\s*\n/)
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <Button
          onClick={() => {
            setDraft((c) => ({
              ...c,
              sections: [...c.sections, { title: "", paragraphs: [] }],
            }));
            setStatus({ kind: "idle" });
          }}
        >
          Add section
        </Button>
        <Button
          variant="primary"
          onClick={save}
          disabled={status.kind === "saving"}
        >
          Save
        </Button>
        <SaveState state={status} />
      </div>
    </div>
  );
}
