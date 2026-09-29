import type { Certification } from "@/content/certifications";
import { formatMonth } from "@/lib/format";
import { Stamp } from "./stamp";

/**
 * Home-page card: the issuer as a marker stamp, the credential, and a verify link
 * when there is one — the link is what turns a claim into something checkable.
 */
export function CertificationChip({
  certification,
  index = 0,
}: {
  certification: Certification;
  index?: number;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <Stamp text={certification.issuer} size={64} />
        <span className="chip chip-static text-ink-muted">
          {certification.issued ? formatMonth(certification.issued) : "Certified"}
        </span>
      </div>
      <h3 className="mt-5 font-display text-[20px] leading-tight font-bold tracking-[-0.02em]">
        {certification.name}
      </h3>
      <p className="mt-1 text-[15px] text-ink-muted">{certification.issuer}</p>
      {certification.url ? (
        <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-accent">
          Verify <span aria-hidden>↗</span>
        </span>
      ) : null}
    </>
  );

  const className =
    "card group flex h-full flex-col p-6";

  return certification.url ? (
    <a
      href={certification.url}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
