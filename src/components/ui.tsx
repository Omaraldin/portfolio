import Link from "next/link";
import { Chibi } from "./chibi";
import { Emoji, EmojiText } from "./emoji";

/**
 * The pop fills, in the order cards cycle through them. Listed as full class
 * names rather than built from a string so Tailwind can see them.
 */
export const POP_FILLS = ["bg-tint-1", "bg-tint-2"] as const;

export function popFill(index: number) {
  return POP_FILLS[index % POP_FILLS.length];
}

/**
 * A section header: a tilted pop square, then the title in the display face,
 * with an optional "see all" pill on the right.
 *
 * The index is kept in the signature and rendered for print only. An applicant
 * tracking system reading the CV still benefits from the numbering.
 */
export function SpecHeader({
  index,
  title,
  href,
  hrefLabel,
  eyebrow,
}: {
  /** Omit for sections that are not part of a numbered sequence. */
  index?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  /** Small mono line above the title, e.g. "// what I shipped". */
  eyebrow?: string;
}) {
  /*
    The class hooks let the print stylesheet strip the ornament — marker and
    link — and leave a plain heading.
  */
  return (
    <div className="spec-header flex flex-wrap items-end gap-x-4 gap-y-3 pt-16 pb-7">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="spec-header-link mb-2 font-mono text-[12px] font-medium text-accent">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          {index ? (
            <span className="spec-header-index tabular hidden font-mono text-[11px] font-medium text-ink-muted">
              {index}
            </span>
          ) : null}
          <span
            aria-hidden
            className="spec-header-rule h-4 w-4 shrink-0 rotate-12 rounded-[5px] border-2 border-on-pop bg-pop-yellow"
          />
          <h2 className="spec-header-title font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            {title}
          </h2>
        </div>
      </div>
      {href ? (
        <Link
          href={href}
          className="spec-header-link pill inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-2 text-[14px] font-semibold hover:bg-ink hover:text-paper"
        >
          {hrefLabel ?? "View all"} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Label on the left, value on the right, hairline beneath. Project datasheets
 * and the CV are stacks of these.
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
    <div className="flex flex-col gap-1 border-b border-rule py-3 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="font-mono text-[11px] font-medium tracking-[0.08em] text-ink-muted uppercase sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd
        className={`text-[16px] leading-relaxed ${
          accent ? "font-semibold text-accent" : "text-ink"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

/** Rounded mono pill. Domain, capability, and stack tags. */
export function TagChip({
  children,
  active = false,
  as = "span",
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  as?: "span" | "div";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
        active
          ? "border-accent bg-accent-quiet text-accent"
          : "border-rule bg-paper text-ink-muted"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Large numeral in a pop-coloured tile. Used for project metrics. */
export function StatBlock({
  value,
  label,
  index = 0,
}: {
  value: string;
  label: string;
  index?: number;
}) {
  return (
    <div
      className={`rounded-[24px] border-2 border-rule p-5 text-ink ${popFill(index)}`}
    >
      <div className="tabular font-display text-[40px] leading-none font-extrabold tracking-[-0.03em]">
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] font-medium tracking-[0.06em] uppercase">
        {label}
      </div>
    </div>
  );
}

/**
 * Page title block, used at the top of every section page: a tilted sticker,
 * a big display title, and a line of intro.
 */
export function PageTitle({
  index,
  title,
  intro,
  emoji,
  fill = "bg-pop-yellow",
}: {
  index: string;
  title: string;
  intro?: string;
  emoji?: string;
  fill?: string;
}) {
  return (
    <header className="pt-10 pb-6 sm:pt-16">
      <span
        className={`inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-on-pop px-3.5 py-1.5 font-mono text-[12px] font-semibold text-on-pop ${fill}`}
      >
        {emoji ? <Emoji char={emoji} /> : null}
        {index}
      </span>
      <h1 className="mt-5 font-display text-[52px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[88px]">
        {title}
      </h1>
      {intro ? (
        <p className="mt-5 max-w-2xl text-[19px] leading-relaxed text-ink-muted">
          {intro}
        </p>
      ) : null}
    </header>
  );
}

/** The primary and secondary pill buttons. */
export function PillLink({
  href,
  children,
  variant = "solid",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "accent";
  external?: boolean;
}) {
  const styles = {
    solid: "bg-ink text-paper border-ink",
    outline: "border-ink text-ink hover:bg-ink hover:text-paper",
    accent: "bg-brand text-on-brand border-on-pop",
  }[variant];

  const className = `pill inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-[16px] font-semibold ${styles}`;

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Centered empty-state line for an index with nothing in it yet. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border-2 border-dashed border-rule px-6 py-12 text-center">
      <Chibi className="h-32" sizes="100px" />
      <p className="mt-5 font-display text-[22px] font-bold">{typeof children === "string" ? <EmojiText>{children}</EmojiText> : children}</p>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        {"// check back soon"}
      </p>
    </div>
  );
}
