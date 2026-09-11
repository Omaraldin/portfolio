"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Language } from "@/content/languages";
import { Button, Field, SaveState, TextInput } from "./form";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

export function LanguagesEditor({ languages }: { languages: Language[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Language[]>(languages);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const patch = (index: number, next: Partial<Language>) => {
    setDraft((current) =>
      current.map((l, i) => (i === index ? { ...l, ...next } : l)),
    );
    setStatus({ kind: "idle" });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;

    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/languages", {
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
    <div className="max-w-2xl">
      <p className="mb-3 font-mono text-[10px] text-ink-faint">
        Shown on /about and available as a CV section. Common wordings: Native,
        Fluent, Professional working proficiency, Conversational.
      </p>

      <div className="space-y-2">
        {draft.map((language, index) => (
          <div
            key={index}
            className="flex flex-wrap items-end gap-3 border border-rule p-3"
          >
            <div className="min-w-[9rem] flex-1">
              <Field label="Language">
                <TextInput
                  value={language.name}
                  onChange={(e) => patch(index, { name: e.target.value })}
                />
              </Field>
            </div>
            <div className="min-w-[12rem] flex-1">
              <Field label="Level">
                <TextInput
                  value={language.level}
                  onChange={(e) => patch(index, { level: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex gap-1.5 pb-0.5">
              <Button onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button
                onClick={() => move(index, 1)}
                disabled={index === draft.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDraft(draft.filter((_, i) => i !== index));
                  setStatus({ kind: "idle" });
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setDraft([...draft, { name: "", level: "" }]);
            setStatus({ kind: "idle" });
          }}
        >
          Add language
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
