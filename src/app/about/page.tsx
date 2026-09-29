import type { Metadata } from "next";
import Image from "next/image";
import { about } from "@/content/about";
import { certifications } from "@/content/certifications";
import { languages } from "@/content/languages";
import { awards, community, education, type CVEntry } from "@/content/cv";
import { site } from "@/content/site";
import { CertificationChip } from "@/components/certification-row";
import { MarkerUnderline, PillLink, SpecHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who I am, how I got here, and how I approach problems.",
};

export default function AboutPage() {
  const school = education[0];

  return (
    <>
      {/* ───────────── Header ───────────── */}
      <header className="grid items-center gap-12 pt-10 pb-6 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <p className="inline-block text-[22px] text-ink-muted" style={{ fontFamily: "var(--font-hand)" }}>
            about me
            <MarkerUnderline className="w-full" />
          </p>
          <h1 className="mt-5 font-display text-[52px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[84px]">
            Hey, I&apos;m {site.name.split(" ")[0]}.
          </h1>
          {about.intro ? (
            <p className="mt-6 max-w-xl text-[20px] leading-relaxed text-ink-muted">
              {about.intro}
            </p>
          ) : null}

          {/* The quick facts a visitor looks for first, as chips. */}
          <ul className="mt-7 flex flex-wrap gap-2">
            <FactChip>{site.location}</FactChip>
            {school ? (
              <FactChip>
                {school.title} · {school.timeline.replace(/^Graduated\s*/i, "")}
              </FactChip>
            ) : null}
            {languages.length > 0 ? (
              <FactChip>
                {languages.map((l) => l.name).join(" · ")}
              </FactChip>
            ) : null}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={`mailto:${site.email}`}>
              Say hello
            </PillLink>
            <PillLink href="/writing" variant="outline">
              Read the blog
            </PillLink>
          </div>
        </div>

        {/*
          A polaroid rather than the home page's big card: same person, more
          personal register, and it keeps the two pages from looking alike.
        */}
        <figure className="relative mx-auto w-full max-w-[380px] rotate-2 rounded-[4px] border border-rule bg-white p-3 pb-4 text-[#1f2326] shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)]">
          {/* A strip of tape holding the photo to the wall. */}
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-3 bg-[color:var(--wb-note)] opacity-80"
          />
          <div className="relative aspect-square overflow-hidden rounded-[2px] bg-forest">
            <Image
              src="/portrait.png"
              alt={`Illustrated portrait of ${site.name}`}
              width={880}
              height={880}
              sizes="380px"
              priority
              className="relative h-full w-full object-cover object-[50%_100%]"
            />
          </div>
          <figcaption className="mt-3 text-center text-[20px]" style={{ fontFamily: "var(--font-hand)" }}>
            me, mid-whiteboard
          </figcaption>
        </figure>
      </header>

      {/* ───────────── Story + glance ───────────── */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0">
          {about.sections.map((section) => (
            <section key={section.title} className="mb-14 last:mb-0">
              <h2 className="inline-block font-display text-[30px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[36px]">
                {section.title}
                <MarkerUnderline className="mt-1 w-[60%]" />
              </h2>
              <div className="mt-5 max-w-[68ch] space-y-5 text-[19px] leading-[1.75]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface p-6">
            <p className="text-[21px] text-ink-muted" style={{ fontFamily: "var(--font-hand)" }}>
              at a glance
            </p>
            <dl className="mt-4 space-y-5">
              {education.map((entry) => (
                <Glance key={entry.title} label="Education">
                  <span className="block font-semibold">{entry.title}</span>
                  <span className="block text-ink-muted">{entry.org}</span>
                  <span className="tabular mt-0.5 block text-[14px] text-ink-muted">
                    {entry.timeline}
                  </span>
                </Glance>
              ))}
              {languages.length > 0 ? (
                <Glance label="Languages">
                  <span className="flex flex-col gap-1.5">
                    {languages.map((language) => (
                      <span
                        key={language.name}
                        className="flex flex-wrap items-baseline justify-between gap-x-3"
                      >
                        <span className="font-semibold">{language.name}</span>
                        <span className="text-[13px] text-ink-muted">
                          {language.level}
                        </span>
                      </span>
                    ))}
                  </span>
                </Glance>
              ) : null}
              <Glance label="Elsewhere">
                <span className="flex flex-wrap gap-2">
                  {site.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                    >
                      {social.label}
                    </a>
                  ))}
                </span>
              </Glance>
            </dl>
          </div>
        </aside>
      </div>

      {/* ───────────── Along the way ───────────── */}
      {community.length + awards.length > 0 ? (
        <section>
          <SpecHeader title="Community & awards" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((entry) => (
              <RecordCard key={entry.title} entry={entry} kind="community" />
            ))}
            {awards.map((entry) => (
              <RecordCard key={entry.title} entry={entry} kind="award" />
            ))}
          </div>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section>
          <SpecHeader
            title="Certifications"
            href="/certifications"
            hrefLabel="View certificates"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((certification, i) => (
              <CertificationChip
                key={certification.slug}
                certification={certification}
                index={i}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function FactChip({ children }: { children: React.ReactNode }) {
  return <li className="chip text-ink">{children}</li>;
}

function Glance({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[14px] font-semibold text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] leading-snug">{children}</dd>
    </div>
  );
}

/** A community role or award. Placeholder timelines ("—") are not shown. */
function RecordCard({ entry, kind }: { entry: CVEntry; kind: string }) {
  const timeline = entry.timeline.replace(/^[—-]$/, "").trim();

  return (
    <article className="surface flex h-full flex-col p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[20px] text-[color:var(--wb-red)]" style={{ fontFamily: "var(--font-hand)" }}>
          {kind}
        </span>
        {timeline ? (
          <span className="tabular chip chip-static text-ink-muted">
            {timeline}
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 font-display text-[20px] leading-tight font-bold tracking-[-0.02em]">
        {entry.title}
      </h3>
      {entry.org ? (
        <p className="mt-1 text-[15px] text-ink-muted">{entry.org}</p>
      ) : null}
      {entry.bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {entry.bullets.map((bullet) => (
            <li
              key={bullet}
              className="text-[15px] leading-relaxed text-ink-muted"
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
