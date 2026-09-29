import Link from "next/link";
import { Chibi } from "./chibi";
import { EmojiText } from "./emoji";

/**
 * A red marker stroke under a heading — the same hand that writes on the
 * home-page board. Decorative, and dropped in print.
 */
export function MarkerUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={`spec-header-rule block h-[10px] ${className}`}
    >
      <path
        d="M2 8 C 40 3, 90 10, 140 5 S 190 6, 198 4"
        fill="none"
        stroke="var(--wb-red)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A section header: the title in the display face with a marker stroke under
 * it, and an optional plain link on the right.
 *
 * The index is kept in the signature and rendered for print only. An applicant
 * tracking system reading the CV still benefits from the numbering.
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
    link — and leave a plain heading.
  */
  return (
    <div className="spec-header flex flex-wrap items-end gap-x-4 gap-y-3 pt-16 pb-7">
      <div className="min-w-0 flex-1">
        {index ? (
          <span className="spec-header-index tabular hidden font-mono text-[11px] font-medium text-ink-muted">
            {index}
          </span>
        ) : null}
        <h2 className="spec-header-title inline-block font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[40px]">
          {title}
          <MarkerUnderline className="mt-1 w-[70%]" />
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="spec-header-link text-[16px] font-semibold text-ink underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-[color:var(--wb-red)]"
        >
          {hrefLabel ?? "View all"}
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
      <dt className="label sm:w-40 sm:shrink-0">
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

/** A small static tag: stack, domain, capability. */
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
    <Tag className={`chip chip-static ${active ? "chip-active" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

/** A large numeral over its label. Used for project metrics. */
export function StatBlock({
  value,
  label,
}: {
  value: string;
  label: string;
  /** Unused; kept so existing callers need no change. */
  index?: number;
}) {
  return (
    <div className="surface p-5 text-ink">
      <div className="tabular font-display text-[40px] leading-none font-extrabold tracking-[-0.03em]">
        {value}
      </div>
      <div className="mt-2 text-[14px] text-ink-muted">{label}</div>
    </div>
  );
}

/**
 * Page title block, used at the top of every section page: a small
 * handwritten label, a big display title, and a line of intro.
 */
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
    <header className="pt-10 pb-6 sm:pt-16">
      <p className="inline-block text-[22px] text-ink-muted" style={{ fontFamily: "var(--font-hand)" }}>
        {index}
        <MarkerUnderline className="w-full" />
      </p>
      <h1 className="mt-4 font-display text-[52px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[88px]">
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

/** The main action (solid) and a secondary one (outline). */
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
  const className = variant === "outline" ? "btn" : "btn btn-primary";

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
    <div className="surface flex flex-col items-center border-dashed px-6 py-12 text-center">
      <Chibi className="h-32" sizes="100px" />
      <p className="mt-5 font-display text-[22px] font-bold">{typeof children === "string" ? <EmojiText>{children}</EmojiText> : children}</p>
    </div>
  );
}
