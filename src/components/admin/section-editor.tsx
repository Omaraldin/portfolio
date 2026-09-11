"use client";

import { useState } from "react";
import type { ProjectSection } from "@/content/types";
import { Button, TextInput } from "./form";
import { MarkdownEditor } from "./markdown-editor";

/**
 * The headings most project write-ups end up using. Offered as one-click adds
 * rather than baked into the schema — the common shape should be fast, but
 * nothing should be mandatory.
 */
const SUGGESTED = ["Problem", "Approach", "Outcome", "Architecture", "Result"];

/**
 * Builds a project's write-up as an ordered list of titled sections, each body
 * edited with the same markdown editor the articles use.
 *
 * Only one body is expanded at a time. Every section mounting its own editor
 * would mean a preview pane per section, each polling the render endpoint on
 * every keystroke.
 */
export function SectionEditor({
  sections,
  onChange,
}: {
  /** Tolerates undefined: records written before sections existed lack the key. */
  sections: ProjectSection[] | undefined;
  onChange: (sections: ProjectSection[]) => void;
}) {
  const items = sections ?? [];
  const [open, setOpen] = useState<number | null>(items.length ? 0 : null);

  const add = (title: string) => {
    onChange([...items, { title, body: "" }]);
    // Expand what was just added — adding a section means writing in it.
    setOpen(items.length);
  };

  const patch = (index: number, changes: Partial<ProjectSection>) => {
    onChange(items.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setOpen((current) => {
      if (current === null) return null;
      if (current === index) return null;
      // Indices after the removed one shift down by one.
      return current > index ? current - 1 : current;
    });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpen((current) => (current === index ? target : current));
  };

  return (
    <div>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((section, index) => {
            const expanded = open === index;
            return (
              <li
                key={index}
                className="min-w-0 rounded-[3px] border border-rule bg-paper-raised"
              >
                <div className="flex min-w-0 items-center gap-2 p-2">
                  <span className="tabular w-6 shrink-0 text-center font-mono text-[10px] text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <TextInput
                      value={section.title}
                      placeholder="Section heading"
                      onChange={(e) => patch(index, { title: e.target.value })}
                    />
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      onClick={() => setOpen(expanded ? null : index)}
                      aria-expanded={expanded}
                    >
                      {expanded ? "Close" : "Edit"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                    >
                      ↓
                    </Button>
                    <Button type="button" onClick={() => remove(index)}>
                      ✕
                    </Button>
                  </div>
                </div>

                {expanded ? (
                  <div className="border-t border-rule p-3">
                    <MarkdownEditor
                      value={section.body}
                      onChange={(body) => patch(index, { body })}
                    />
                  </div>
                ) : (
                  <p className="truncate px-3 pb-2 pl-10 font-mono text-[11px] text-ink-faint">
                    {section.body.trim()
                      ? section.body.trim().split("\n")[0]
                      : "Empty"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" onClick={() => add("")}>
          + Section
        </Button>

        {SUGGESTED.filter((title) => !items.some((s) => s.title === title)).map(
          (title) => (
            <Button key={title} type="button" onClick={() => add(title)}>
              + {title}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
