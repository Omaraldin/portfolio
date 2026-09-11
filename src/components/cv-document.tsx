import type { CV } from "@/content/cv-types";
import { visibleSections } from "@/content/cvs";
import { site } from "@/content/site";
import { resolveSection, type ResolvedSection } from "@/lib/cv-content";
import { SpecHeader } from "./ui";

/**
 * The on-screen CV.
 *
 * Everything here also has to survive being printed, so the markup is
 * deliberately plain: real `ul`/`li` for bullets rather than CSS pseudo-
 * elements, and a single column flow. The decorative parts — the numbered rule
 * headers, the two-column title/date rows — are suppressed by the print
 * stylesheet, where they would confuse a parser.
 */
export function CVDocument({ cv }: { cv: CV }) {
  const sections = visibleSections(cv)
    .map((section) => resolveSection(section))
    .filter((s): s is ResolvedSection => s !== null);

  return (
    <div>
      <header className="border-b border-rule-strong pb-6">
        <h1 className="text-[36px] leading-[1.1] font-bold tracking-[-0.02em]">
          {site.name}
        </h1>
        <p className="mt-2 font-mono text-[12px] tracking-[0.12em] text-ink-muted uppercase print:font-sans print:tracking-normal print:normal-case">
          {cv.title}
        </p>

        {cv.summary ? (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">
            {cv.summary}
          </p>
        ) : null}

        {/*
          Contact details are a single plain line so an extractor reads them in
          order rather than pulling them out of a grid.
        */}
        <p className="mt-4 font-mono text-[11px] tracking-[0.08em] text-ink-muted print:font-sans print:tracking-normal">
          {[site.phone, site.email, site.location]
            .filter(Boolean)
            .join(" · ")}
          {site.socials.map((s) => ` · ${s.href}`).join("")}
        </p>
      </header>

      {sections.map((section, index) => (
        <section key={`${section.heading}-${index}`} className="print-avoid-break">
          <SpecHeader
            index={String(index + 1).padStart(2, "0")}
            title={section.heading}
          />
          <SectionBody section={section} />
        </section>
      ))}
    </div>
  );
}

function SectionBody({ section }: { section: ResolvedSection }) {
  if (section.kind === "definitions") {
    return (
      <dl className="space-y-2">
        {section.items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 sm:flex-row sm:gap-6"
          >
            <dt className="font-mono text-[11px] tracking-[0.1em] text-ink-muted uppercase sm:w-36 sm:shrink-0 print:font-sans print:tracking-normal print:normal-case">
              {item.label}
            </dt>
            <dd className="text-[14px]">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (section.kind === "prose") {
    return (
      <div className="max-w-2xl space-y-3">
        {section.blocks.map((block, i) =>
          block.type === "paragraph" ? (
            <p key={i} className="text-[14px] leading-relaxed">
              {block.text}
            </p>
          ) : (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {block.items.map((item) => (
                <li key={item} className="text-[14px] leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {section.entries.map((entry, i) => (
        <div key={`${entry.title}-${i}`} className="print-avoid-break">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-[15px] font-semibold">
              {entry.title}
              {entry.org ? (
                <span className="font-normal text-ink-muted">
                  {" "}
                  — {entry.org}
                </span>
              ) : null}
            </h3>
            {entry.timeline ? (
              <span className="tabular font-mono text-[11px] text-ink-muted print:font-sans">
                {entry.timeline}
              </span>
            ) : null}
          </div>

          {entry.detail ? (
            <p className="mt-0.5 text-[14px] leading-relaxed text-ink-muted">
              {entry.detail}
            </p>
          ) : null}

          {entry.bullets.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {entry.bullets.map((bullet) => (
                <li key={bullet} className="text-[14px] leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
