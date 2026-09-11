"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleFile } from "@/lib/admin-store";
import {
  Button,
  Field,
  LineList,
  SaveState,
  TextArea,
  TextInput,
} from "./form";
import { MarkdownEditor } from "./markdown-editor";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

function blank(): ArticleFile {
  return {
    slug: "",
    title: "",
    description: "",
    // Defaults to today so a new post is not accidentally back-dated.
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    related: [],
    draft: true,
    cover: "",
    coverAlt: "",
    updated: "",
    body: "",
  };
}

export function WritingEditor({ articles }: { articles: ArticleFile[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ArticleFile>(articles[0] ?? blank());
  const [originalSlug, setOriginalSlug] = useState<string | null>(
    articles[0]?.slug ?? null,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const select = (article: ArticleFile | null) => {
    setDraft(article ?? blank());
    setOriginalSlug(article?.slug ?? null);
    setStatus({ kind: "idle" });
  };

  const update = <K extends keyof ArticleFile>(
    key: K,
    value: ArticleFile[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/articles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article: draft,
        originalSlug: originalSlug ?? undefined,
      }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Save failed." });
      return;
    }

    setStatus({ kind: "saved" });
    setOriginalSlug(draft.slug);
    router.refresh();
  };

  const remove = async () => {
    if (!originalSlug) return;
    if (!confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;

    const response = await fetch("/api/admin/articles", {
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
            Articles
          </span>
          <Button onClick={() => select(null)}>New</Button>
        </div>

        <ul>
          {articles.map((article) => (
            <li key={article.slug}>
              <button
                type="button"
                onClick={() => select(article)}
                className={`w-full border-b border-rule py-2 text-left text-[14px] transition-colors ${
                  originalSlug === article.slug
                    ? "text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {article.title || article.slug}
                {article.draft ? (
                  <span className="ml-1.5 font-mono text-[9px] text-ink-faint">
                    DRAFT
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="space-y-5">
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
          <Field label="Date" hint="YYYY-MM-DD">
            <TextInput
              type="date"
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </Field>
          <Field label="Tags" hint="One per line.">
            <LineList
              key={`tags-${originalSlug ?? "new"}`}
              rows={3}
              value={draft.tags}
              onChange={(next) => update("tags", next)}
            />
          </Field>
        </div>

        <Field label="Description" hint="Shown on the index and in previews.">
          <TextArea
            rows={2}
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cover image"
            hint="Path under /public. Thumbnail, hero, and social preview."
          >
            <TextInput
              placeholder="/articles/post.jpg"
              value={draft.cover}
              onChange={(e) => update("cover", e.target.value)}
            />
          </Field>
          <Field label="Cover alt text" hint="Describes the image. Optional.">
            <TextInput
              value={draft.coverAlt}
              onChange={(e) => update("coverAlt", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Updated"
          hint="Only when revising a published post. Leave blank otherwise."
        >
          <TextInput
            type="date"
            value={draft.updated}
            onChange={(e) => update("updated", e.target.value)}
          />
        </Field>

        <Field
          label="Related projects"
          hint="Project slugs, one per line. Rendered as cross-references."
        >
          <LineList
            key={`related-${originalSlug ?? "new"}`}
            rows={3}
            value={draft.related}
            onChange={(next) => update("related", next)}
          />
        </Field>

        <Field
          label="Body"
          hint="MDX. The preview renders through the same pipeline as the published page."
        >
          <MarkdownEditor
            value={draft.body}
            onChange={(next) => update("body", next)}
          />
        </Field>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.draft}
            onChange={(e) => update("draft", e.target.checked)}
            className="accent-accent"
          />
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
            Draft — hidden from the production build
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <Button
            variant="primary"
            onClick={save}
            disabled={status.kind === "saving"}
          >
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
