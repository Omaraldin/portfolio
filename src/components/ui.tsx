import Link from "next/link";

/**
 * A section header: a solid accent square, then the title in lowercase serif.
 *
 *   ■  about                                        all projects →
 *
 * The index is kept in the signature and rendered for print only. On screen it
 * would compete with the marker, but an applicant tracking system reading the
 * CV still benefits from the numbering.
 */
export function SpecHeader({
  index,
  title,
  href,
  hrefLabel,
}: {
  /** Omit for sections that are not part of a numbered sequence. */
  index?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  /*
    The class hooks let the print stylesheet strip the ornament — marker and
    link — and leave a plain heading, which is what an applicant tracking
    system can actually recognise.
  */
  return (
    <div className="spec-header flex items-center gap-4 pt-16 pb-6">
      {index ? (
        <span className="spec-header-index tabular hidden font-mono text-[11px] font-medium tracking-[0.12em] text-ink-muted">
          {index}
        </span>
      ) : null}
      <span
        aria-hidden
        className="spec-header-rule h-[14px] w-[14px] shrink-0 bg-accent"
      />
      <h2 className="spec-header-title font-serif text-[30px] leading-none font-semibold lowercase">
        {title}
      </h2>
      <span aria-hidden className="flex-1" />
      {href ? (
        <Link
          href={href}
          className="spec-header-link font-mono text-[11px] font-medium tracking-[0.12em] text-accent lowercase transition-opacity hover:opacity-70"
        >
          {hrefLabel ?? "view all"} →
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Label on the left, value on the right, hairline beneath. The atom of the
 * whole design — the identity block, project datasheets, and CV are all stacks
 * of these.
 */
export function FieldRow({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-rule py-2.5 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-ink-muted uppercase sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd
        className={`text-[15px] leading-relaxed ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

/** Mono, uppercase, hairline border. Domain and capability tags. */
export function TagChip({
  children,
  active = false,
  as = "span",
}: {
  children: React.ReactNode;
  active?: boolean;
  as?: "span" | "div";
}) {
  const Tag = as;
  return (
    <Tag
      className={`inline-block rounded-[3px] border px-2 py-1 font-mono text-[10px] font-medium tracking-[0.1em] uppercase transition-colors ${
        active
          ? "border-accent bg-accent-quiet text-accent"
          : "border-rule text-ink-muted"
      }`}
    >
      {children}
    </Tag>
  );
}

/** Large tabular numeral over a mono caption. Used for project metrics. */
export function StatBlock({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="border-t border-rule-strong pt-3">
      <div className="tabular text-3xl font-bold tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] tracking-[0.1em] text-ink-muted uppercase">
        {label}
      </div>
    </div>
  );
}

/** Page title block, used at the top of every section page. */
export function PageTitle({
  index,
  title,
  intro,
}: {
  index: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="border-b border-rule pt-10 pb-8">
      <div className="flex items-center gap-4">
        <span aria-hidden className="h-[14px] w-[14px] shrink-0 bg-accent" />
        <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-ink-muted">
          {index}
        </div>
      </div>
      <h1 className="mt-3 font-serif text-[52px] leading-[1.05] font-semibold lowercase">
        {title}
      </h1>
      {intro ? (
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
