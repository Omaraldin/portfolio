"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Certification } from "@/content/certifications";
import { Button, Field, SaveState, TextInput } from "./form";

type Status =
  | { kind: "idle" | "saving" | "saved" }
  | { kind: "error"; message: string };

const BLANK: Certification = {
  slug: "",
  name: "",
  issuer: "",
  issued: "",
  expires: "",
  credentialId: "",
  url: "",
  document: "",
  featured: false,
};

export function CertificationsEditor({
  certifications,
}: {
  certifications: Certification[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Certification>(
    certifications[0] ?? BLANK,
  );
  const [originalSlug, setOriginalSlug] = useState<string | null>(
    certifications[0]?.slug ?? null,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const select = (certification: Certification | null) => {
    setDraft(certification ?? BLANK);
    setOriginalSlug(certification?.slug ?? null);
    setStatus({ kind: "idle" });
  };

  const update = <K extends keyof Certification>(
    key: K,
    value: Certification[K],
  ) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };

      // Slugs are derived from the name until the entry has been saved, so a
      // new certification does not need one typed by hand.
      if (key === "name" && !originalSlug) {
        next.slug = String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      return next;
    });
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });

    const response = await fetch("/api/admin/certifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        certification: draft,
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
    if (!confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;

    const response = await fetch("/api/admin/certifications", {
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
            Certifications
          </span>
          <Button onClick={() => select(null)}>New</Button>
        </div>

        <ul>
          {certifications.map((certification) => (
            <li key={certification.slug}>
              <button
                type="button"
                onClick={() => select(certification)}
                className={`w-full border-b border-rule py-2 text-left text-[14px] transition-colors ${
                  originalSlug === certification.slug
                    ? "text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {certification.name}
                {certification.featured ? (
                  <span className="ml-1.5 font-mono text-[9px] text-ink-faint">
                    ★
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="max-w-2xl space-y-5">
        <Field label="Name">
          <TextInput
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Issuer">
            <TextInput
              value={draft.issuer}
              onChange={(e) => update("issuer", e.target.value)}
            />
          </Field>
          <Field label="Slug" hint="Lowercase, hyphens.">
            <TextInput
              value={draft.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </Field>
          <Field label="Issued" hint="YYYY-MM. Optional.">
            <TextInput
              placeholder="2024-08"
              value={draft.issued}
              onChange={(e) => update("issued", e.target.value)}
            />
          </Field>
          <Field label="Expires" hint="YYYY-MM. Leave blank if it never lapses.">
            <TextInput
              placeholder=""
              value={draft.expires}
              onChange={(e) => update("expires", e.target.value)}
            />
          </Field>
          <Field label="Credential ID" hint="Optional.">
            <TextInput
              value={draft.credentialId}
              onChange={(e) => update("credentialId", e.target.value)}
            />
          </Field>
          <Field
            label="Certificate"
            hint="Path under /public. PDF or image."
          >
            <TextInput
              placeholder="/certificates/aws.pdf"
              value={draft.document}
              onChange={(e) => update("document", e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Verification link"
          hint="Optional, but it is what makes the credential checkable."
        >
          <TextInput
            placeholder="https://…"
            value={draft.url}
            onChange={(e) => update("url", e.target.value)}
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
