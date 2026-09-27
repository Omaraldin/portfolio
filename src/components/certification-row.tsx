import { hasExpired, type Certification } from "@/content/certifications";
import { formatMonth } from "@/lib/format";

/**
 * One certification, as a record row. Every field except the name and issuer is
 * optional, so each is rendered only when present rather than showing an empty
 * label.
 */
export function CertificationRow({
  certification,
}: {
  certification: Certification;
}) {
  const expired = hasExpired(certification);

  const meta = [
    certification.issued ? formatMonth(certification.issued) : null,
    certification.expires
      ? `${expired ? "Expired" : "Expires"} ${formatMonth(certification.expires)}`
      : null,
    certification.credentialId ? `ID ${certification.credentialId}` : null,
  ].filter(Boolean);

  return (
    <div className="print-avoid-break border-b border-rule py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-[20px] font-bold tracking-[-0.02em]">
            {certification.url ? (
              <a
                href={certification.url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {certification.name}
                <span className="ml-1 font-mono text-[10px] text-ink-faint">
                  ↗
                </span>
              </a>
            ) : (
              certification.name
            )}
          </h3>

          {expired ? (
            <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
              Lapsed
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 text-[14px] text-ink-muted">
          {certification.issuer}
        </p>

        {meta.length > 0 ? (
          <p className="tabular mt-1 font-mono text-[11px] text-ink-faint">
            {meta.join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Home-page card: an issuer monogram badge, the credential, and a verify link
 * when there is one — the link is what turns a claim into something checkable.
 */
export function CertificationChip({
  certification,
  index = 0,
}: {
  certification: Certification;
  index?: number;
}) {
  const monogram = certification.issuer
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={`grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-[18px] border-2 border-on-pop font-display text-[20px] font-extrabold text-on-pop transition-transform duration-300 group-hover:rotate-6 bg-pop-yellow`}
        >
          {monogram}
        </span>
        <span className="rounded-full bg-paper-raised px-2.5 py-1 font-mono text-[11px] font-medium text-ink-muted">
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
    "pop-card group flex h-full flex-col rounded-[28px] bg-paper p-6";

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
