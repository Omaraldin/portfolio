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
          <h3 className="text-[16px] font-semibold">
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

/** Compact form for the home page strip. */
export function CertificationChip({
  certification,
}: {
  certification: Certification;
}) {
  const content = (
    <>
      <span className="text-[14px] font-medium">{certification.name}</span>
      <span className="mt-0.5 block font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
        {certification.issuer}
        {certification.issued ? ` · ${formatMonth(certification.issued)}` : ""}
      </span>
    </>
  );

  return (
    <div className="border-t border-rule-strong pt-3">
      {certification.url ? (
        <a
          href={certification.url}
          target="_blank"
          rel="noreferrer"
          className="block transition-colors hover:text-accent"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
