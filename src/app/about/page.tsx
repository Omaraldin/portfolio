import type { Metadata } from "next";
import Image from "next/image";
import { about } from "@/content/about";
import { certifications } from "@/content/certifications";
import { languages } from "@/content/languages";
import { awards, community, education, type CVEntry } from "@/content/cv";
import { site } from "@/content/site";
import { CertificationChip } from "@/components/certification-row";
import { PillLink, SpecHeader } from "@/components/ui";
import { Emoji } from "@/components/emoji";

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
          <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-on-pop bg-pop-yellow px-3.5 py-1.5 font-mono text-[12px] font-semibold text-on-pop">
            <Emoji char="👋" />
            about me
          </span>
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
            <FactChip emoji="📍">{site.location}</FactChip>
            {school ? (
              <FactChip emoji="🎓">
                {school.title} · {school.timeline.replace(/^Graduated\s*/i, "")}
              </FactChip>
            ) : null}
            {languages.length > 0 ? (
              <FactChip emoji="💬">
                {languages.map((l) => l.name).join(" · ")}
              </FactChip>
            ) : null}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={`mailto:${site.email}`}>
              Say hello <Emoji char="✉️" />
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
        <figure className="mx-auto w-full max-w-[380px] rotate-2 rounded-[20px] border-2 border-on-pop bg-cream p-3 pb-4 text-on-pop shadow-[8px_8px_0_0_var(--shadow)] dark:border-rule">
          <div className="relative aspect-square overflow-hidden rounded-[12px] bg-forest">
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pop-yellow"
            />
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
          <figcaption className="mt-3 text-center font-mono text-[13px]">
            me, mid-whiteboard <Emoji char="🧠" />
          </figcaption>
        </figure>
      </header>

      {/* ───────────── Story + glance ───────────── */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0">
          {about.sections.map((section) => (
            <section key={section.title} className="mb-14 last:mb-0">
              <h2 className="flex items-center gap-3 font-display text-[30px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[36px]">
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 rotate-12 rounded-[4px] border-2 border-on-pop bg-pop-yellow"
                />
                {section.title}
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
          <div className="rounded-[28px] border-2 border-rule bg-paper-raised p-6">
            <p className="font-mono text-[12px] font-semibold text-accent">
              {"// at a glance"}
            </p>
            <dl className="mt-4 space-y-5">
              {education.map((entry) => (
                <Glance key={entry.title} label="Education">
                  <span className="block font-semibold">{entry.title}</span>
                  <span className="block text-ink-muted">{entry.org}</span>
                  <span className="tabular mt-0.5 block font-mono text-[12px] text-ink-muted">
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
                      className="pill inline-flex rounded-full border-2 border-ink px-3.5 py-1 text-[14px] font-semibold hover:bg-ink hover:text-paper"
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
          <SpecHeader eyebrow="// along the way" title="Community & awards" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((entry) => (
              <RecordCard key={entry.title} entry={entry} emoji="🤝" />
            ))}
            {awards.map((entry) => (
              <RecordCard key={entry.title} entry={entry} emoji="🏆" />
            ))}
          </div>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section>
          <SpecHeader
            eyebrow="// always learning"
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

function FactChip({
  emoji,
  children,
}: {
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border-2 border-rule bg-paper-raised px-3.5 py-1.5 text-[14px] font-semibold">
      <Emoji char={emoji} />
      {children}
    </li>
  );
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
      <dt className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] leading-snug">{children}</dd>
    </div>
  );
}

/** A community role or award. Placeholder timelines ("—") are not shown. */
function RecordCard({ entry, emoji }: { entry: CVEntry; emoji: string }) {
  const timeline = entry.timeline.replace(/^[—-]$/, "").trim();

  return (
    <article className="flex h-full flex-col rounded-[28px] border-2 border-rule bg-paper p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid h-12 w-12 -rotate-6 place-items-center rounded-[16px] border-2 border-on-pop bg-pop-yellow text-[24px]"
        >
          <Emoji char={emoji} />
        </span>
        {timeline ? (
          <span className="tabular rounded-full bg-paper-raised px-2.5 py-1 font-mono text-[11px] font-medium text-ink-muted">
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
