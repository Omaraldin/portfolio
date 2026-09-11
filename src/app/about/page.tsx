import type { Metadata } from "next";
import { about } from "@/content/about";
import { certifications } from "@/content/certifications";
import { languages } from "@/content/languages";
import { awards, community, education } from "@/content/cv";
import { CertificationRow } from "@/components/certification-row";
import { SpecHeader, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "How the breadth happened, and why it is deliberate rather than accidental.",
};

export default function AboutPage() {
  // The record sections continue the numbering after however many prose
  // sections the content currently has, so editing prose cannot leave a gap.
  const sectionIndex = (offset: number) =>
    String(about.sections.length + offset).padStart(2, "0");

  // Certifications and languages both sit between education and community, and
  // are skipped entirely when empty — so the sections after them shift up.
  const certOffset = certifications.length > 0 ? 2 : 1;
  const languageOffset = languages.length > 0 ? 1 : 0;

  return (
    <>
      <PageTitle
        index="RECORD / ABOUT"
        title="About"
        intro={about.intro}
      />

      <section>
        {about.sections.map((section, i) => (
          <div key={section.title}>
            <SpecHeader
              index={String(i + 1).padStart(2, "0")}
              title={section.title}
            />
            {/*
              The measure is constrained on the prose itself rather than on the
              section, so the header rule spans the full column like every other
              section on the page.
            */}
            <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <SpecHeader index={sectionIndex(1)} title="Education" />
        {education.map((entry) => (
          <Record
            key={entry.title}
            title={entry.title}
            org={entry.org}
            timeline={entry.timeline}
          />
        ))}
      </section>

      {certifications.length > 0 ? (
        <section>
          <SpecHeader
            index={sectionIndex(2)}
            title="Certifications"
            href="/certifications"
            hrefLabel="View certificates"
          />
          {certifications.map((certification) => (
            <CertificationRow
              key={certification.slug}
              certification={certification}
            />
          ))}
        </section>
      ) : null}

      {languages.length > 0 ? (
        <section>
          <SpecHeader index={sectionIndex(certOffset + 1)} title="Languages" />
          <dl>
            {languages.map((language) => (
              <div
                key={language.name}
                className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-rule py-3"
              >
                <dt className="text-[16px] font-semibold">{language.name}</dt>
                <dd className="font-mono text-[11px] tracking-[0.08em] text-ink-muted">
                  {language.level}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section>
        <SpecHeader
          index={sectionIndex(certOffset + languageOffset + 1)}
          title="Community"
        />
        {community.map((entry) => (
          <Record
            key={entry.title}
            title={entry.title}
            org={entry.org}
            timeline={entry.timeline}
            bullets={entry.bullets}
          />
        ))}
      </section>

      <section>
        <SpecHeader
          index={sectionIndex(certOffset + languageOffset + 2)}
          title="Awards"
        />
        {awards.map((entry) => (
          <Record
            key={entry.title}
            title={entry.title}
            org={entry.org}
            timeline={entry.timeline}
          />
        ))}
      </section>
    </>
  );
}

function Record({
  title,
  org,
  timeline,
  bullets = [],
}: {
  title: string;
  org: string;
  timeline: string;
  bullets?: string[];
}) {
  return (
    <div className="border-b border-rule py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-[16px] font-semibold">{title}</h3>
        <span className="tabular font-mono text-[11px] text-ink-muted">
          {timeline}
        </span>
      </div>
      {org ? <p className="mt-0.5 text-[14px] text-ink-muted">{org}</p> : null}
      {bullets.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="relative pl-4 text-[15px] leading-relaxed text-ink-muted before:absolute before:top-[0.65em] before:left-0 before:h-px before:w-2 before:bg-ink-faint"
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
