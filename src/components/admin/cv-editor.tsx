"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DERIVED_SECTIONS,
  SECTION_LABELS,
  type CV,
  type CVSection,
  type DerivedSectionKind,
} from "@/content/cv-types";
import {
  Button,
  Field,
  MonoArea,
  SaveState,
  TextArea,
  TextInput,
} from "./form";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

function blank(): CV {
  return {
    handle: "",
    label: "",
    title: "",
    summary: "",
    sections: DERIVED_SECTIONS.map((source) => ({
      kind: "derived" as const,
      source,
      visible: true,
    })),
  };
}

export function CVEditor({ cvs }: { cvs: CV[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CV>(cvs[0] ?? blank());
  const [originalHandle, setOriginalHandle] = useState<string | null>(
    cvs[0]?.handle ?? null,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const select = (cv: CV | null) => {
    setDraft(cv ?? blank());
    setOriginalHandle(cv?.handle ?? null);
    setStatus({ kind: "idle" });
  };

  const update = <K extends keyof CV>(key: K, value: CV[K]) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };

      // The handle is derived from the title until the CV has been saved, so a
      // new one does not need it typed by hand.
      if (key === "title" && !originalHandle) {
        next.handle = String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      return next;
    });
    setStatus({ kind: "idle" });
  };

  const setSections = (sections: CVSection[]) => {
    setDraft((current) => ({ ...current, sections }));
    setStatus({ kind: "idle" });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.sections.length) return;

    const next = [...draft.sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const patchSection = (index: number, patch: Partial<CVSection>) => {
    setSections(
      draft.sections.map((s, i) =>
        i === index ? ({ ...s, ...patch } as CVSection) : s,
      ),
    );
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/cvs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cv: draft,
        originalHandle: originalHandle ?? undefined,
      }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Save failed." });
      return;
    }

    setStatus({ kind: "saved" });
    setOriginalHandle(draft.handle);
    router.refresh();
  };

  const remove = async () => {
    if (!originalHandle) return;
    if (!confirm(`Delete the "${draft.title}" CV? This cannot be undone.`)) {
      return;
    }

    const response = await fetch("/api/admin/cvs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: originalHandle }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Delete failed." });
      return;
    }

    select(null);
    router.refresh();
  };

  // Only offer to add a derived section this CV does not already carry.
  const missing = DERIVED_SECTIONS.filter(
    (source) =>
      !draft.sections.some((s) => s.kind === "derived" && s.source === source),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            CVs
          </span>
          <Button onClick={() => select(null)}>New</Button>
        </div>

        <ul>
          {cvs.map((cv) => (
            <li key={cv.handle}>
              <button
                type="button"
                onClick={() => select(cv)}
                className={`w-full border-b border-rule py-2 text-left text-[14px] transition-colors ${
                  originalHandle === cv.handle
                    ? "text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {cv.label || cv.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="max-w-3xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" hint="The role printed on this CV.">
            <TextInput
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field label="Handle" hint="URL and PDF filename.">
            <TextInput
              value={draft.handle}
              onChange={(e) => update("handle", e.target.value)}
            />
          </Field>
          <Field label="Label" hint="Shown on the version switch.">
            <TextInput
              value={draft.label}
              onChange={(e) => update("label", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Summary" hint="Two or three sentences, in your own words.">
          <TextArea
            rows={3}
            value={draft.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </Field>

        {draft.handle ? (
          <p className="font-mono text-[10px] tracking-[0.08em] text-ink-faint">
            /cv/{draft.handle} · /cv/{draft.handle}.pdf
          </p>
        ) : null}

        <div>
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-muted uppercase">
            Sections
          </span>
          <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
            Order top to bottom. Hidden sections stay configured but do not
            render.
          </p>

          <div className="mt-3 space-y-2">
            {draft.sections.map((section, index) => (
              <div
                key={section.kind === "custom" ? section.id : section.source}
                className={`border p-3 transition-colors ${
                  section.visible ? "border-rule" : "border-dashed border-rule"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={section.visible}
                      onChange={(e) =>
                        patchSection(index, { visible: e.target.checked })
                      }
                      className="accent-accent"
                    />
                    <span
                      className={`text-[14px] ${
                        section.visible ? "text-ink" : "text-ink-faint"
                      }`}
                    >
                      {section.kind === "custom"
                        ? section.heading || "Untitled"
                        : SECTION_LABELS[section.source]}
                      {section.kind === "custom" ? (
                        <span className="ml-1.5 font-mono text-[9px] text-ink-faint">
                          CUSTOM
                        </span>
                      ) : null}
                    </span>
                  </label>

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
                      onClick={() =>
                        setSections(draft.sections.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {section.kind === "custom" ? (
                  <div className="mt-3 space-y-3">
                    <Field label="Heading">
                      <TextInput
                        value={section.heading}
                        onChange={(e) =>
                          patchSection(index, { heading: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="Body"
                      hint='Blank line separates paragraphs. A line starting "- " is a bullet.'
                    >
                      <MonoArea
                        rows={6}
                        value={section.body}
                        onChange={(e) =>
                          patchSection(index, { body: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                ) : (
                  <Field label="Heading override" hint="Blank uses the default.">
                    <TextInput
                      placeholder={SECTION_LABELS[section.source]}
                      value={section.heading ?? ""}
                      onChange={(e) =>
                        patchSection(index, {
                          heading: e.target.value || undefined,
                        })
                      }
                    />
                  </Field>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {missing.map((source) => (
              <Button
                key={source}
                onClick={() =>
                  setSections([
                    ...draft.sections,
                    { kind: "derived", source, visible: true },
                  ])
                }
              >
                + {SECTION_LABELS[source as DerivedSectionKind]}
              </Button>
            ))}
            <Button
              onClick={() =>
                setSections([
                  ...draft.sections,
                  {
                    kind: "custom",
                    id: `custom-${draft.sections.length + 1}`,
                    heading: "",
                    body: "",
                    visible: true,
                  },
                ])
              }
            >
              + Custom section
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <Button
            variant="primary"
            onClick={save}
            disabled={status.kind === "saving"}
          >
            {originalHandle ? "Save" : "Create"}
          </Button>
          {originalHandle ? (
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          ) : null}
          {originalHandle ? (
            <a
              href={`/cv/${originalHandle}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-rule px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-accent"
            >
              Preview PDF ↗
            </a>
          ) : null}
          <SaveState state={status} />
        </div>
      </div>
    </div>
  );
}
