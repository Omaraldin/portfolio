"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/content/types";
import {
  CAPABILITIES,
  CAPABILITY_LABELS,
  DOMAINS,
  DOMAIN_LABELS,
} from "@/content/taxonomy";
import {
  Button,
  ChipSelect,
  Field,
  LineList,
  MonoArea,
  SaveState,
  TextArea,
  TextInput,
} from "./form";
import { MediaManager } from "./media-manager";
import { ThumbnailPicker } from "./thumbnail-picker";
import { SectionEditor } from "./section-editor";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

const BLANK: Project = {
  slug: "",
  title: "",
  summary: "",
  sections: [],
  metrics: [],
  domains: [],
  capabilities: [],
  stack: [],
  role: "",
  timeline: "",
  links: [],
  media: [],
  featured: false,
};

export function WorkEditor({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(
    projects[0]?.slug ?? null,
  );
  const [draft, setDraft] = useState<Project>(projects[0] ?? BLANK);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // The slug the server should replace, which differs from the draft's slug
  // whenever the slug field itself has been edited.
  const [originalSlug, setOriginalSlug] = useState<string | null>(
    projects[0]?.slug ?? null,
  );

  const select = (project: Project | null) => {
    setDraft(project ?? BLANK);
    setSelected(project?.slug ?? null);
    setOriginalSlug(project?.slug ?? null);
    setStatus({ kind: "idle" });
  };

  const update = <K extends keyof Project>(key: K, value: Project[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: draft,
        originalSlug: originalSlug ?? undefined,
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Save failed." });
      return;
    }

    setStatus({ kind: "saved" });
    setSelected(draft.slug);
    setOriginalSlug(draft.slug);
    // Re-runs the server component so the list reflects what is on disk.
    router.refresh();
  };

  const remove = async () => {
    if (!originalSlug) return;
    if (!confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;

    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: originalSlug }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Delete failed." });
      return;
    }

    select(null);
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            Projects
          </span>
          <Button onClick={() => select(null)}>New</Button>
        </div>

        <ul>
          {projects.map((project) => (
            <li key={project.slug}>
              <button
                type="button"
                onClick={() => select(project)}
                className={`w-full border-b border-rule py-2 text-left text-[14px] transition-colors ${
                  selected === project.slug
                    ? "text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {project.title}
                {project.featured ? (
                  <span className="ml-1.5 font-mono text-[9px] text-ink-faint">
                    ★
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/*
        min-w-0 because a grid track's default min-width is auto: without it the
        markdown editor's intrinsic width pushes the 1fr column past the
        viewport and the whole page scrolls sideways.
      */}
      <div className="min-w-0 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <TextInput
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field label="Slug" hint="Lowercase, hyphens. Becomes the URL.">
            <TextInput
              value={draft.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </Field>
          <Field label="Role">
            <TextInput
              value={draft.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </Field>
          <Field label="Timeline" hint="e.g. 2025, or 2024 — 2025">
            <TextInput
              value={draft.timeline}
              onChange={(e) => update("timeline", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Summary" hint="One line. Shown on index rows.">
          <TextArea
            rows={2}
            value={draft.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </Field>

        <Field
          label="Thumbnail"
          hint="The cover on cards and at the top of the project page."
        >
          <ThumbnailPicker
            slug={draft.slug}
            thumbnail={draft.thumbnail}
            onChange={(thumbnail) => update("thumbnail", thumbnail)}
          />
        </Field>

        <Field label="Domains" hint="Where the work happened.">
          <ChipSelect
            options={DOMAINS}
            labels={DOMAIN_LABELS}
            selected={draft.domains}
            onChange={(next) => update("domains", next)}
          />
        </Field>

        <Field label="Capabilities" hint="What the work required.">
          <ChipSelect
            options={CAPABILITIES}
            labels={CAPABILITY_LABELS}
            selected={draft.capabilities}
            onChange={(next) => update("capabilities", next)}
          />
        </Field>

        <Field label="Stack" hint="One per line.">
          <LineList
            key={`stack-${selected ?? "new"}`}
            value={draft.stack}
            onChange={(next) => update("stack", next)}
          />
        </Field>

        <Field
          label="Write-up"
          hint="Headings are yours to choose. Bodies take markdown, tables, and code."
        >
          <SectionEditor
            sections={draft.sections}
            onChange={(sections) => update("sections", sections)}
          />
        </Field>

        <Field label="Metrics" hint="One per line, as: value | label">
          <MonoArea
            key={`metrics-${selected ?? "new"}`}
            rows={3}
            defaultValue={draft.metrics
              .map((m) => `${m.value} | ${m.label}`)
              .join("\n")}
            onChange={(e) =>
              update(
                "metrics",
                e.target.value
                  .split("\n")
                  .map((line) => line.split("|"))
                  .filter((parts) => parts.length >= 2)
                  .map(([value, ...rest]) => ({
                    value: value.trim(),
                    label: rest.join("|").trim(),
                  }))
                  .filter((m) => m.value && m.label),
              )
            }
          />
        </Field>

        <Field label="Links" hint="One per line, as: label | https://…">
          <MonoArea
            key={`links-${selected ?? "new"}`}
            rows={3}
            defaultValue={draft.links
              .map((l) => `${l.label} | ${l.href}`)
              .join("\n")}
            onChange={(e) =>
              update(
                "links",
                e.target.value
                  .split("\n")
                  .map((line) => line.split("|"))
                  .filter((parts) => parts.length >= 2)
                  .map(([label, ...rest]) => ({
                    label: label.trim(),
                    href: rest.join("|").trim(),
                  }))
                  .filter((l) => l.label && l.href),
              )
            }
          />
        </Field>

        <Field
          label="Media"
          hint="Screenshots and diagrams. Dimensions are read from each file."
        >
          <MediaManager
            slug={draft.slug}
            media={draft.media}
            onChange={(media) => update("media", media)}
          />
        </Field>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="accent-accent"
          />
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
            Featured on the home page
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <Button variant="primary" onClick={save} disabled={status.kind === "saving"}>
            {originalSlug ? "Save" : "Create"}
          </Button>
          {originalSlug ? (
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          ) : null}
          <SaveState state={status} />
        </div>
      </div>
    </div>
  );
}
