/**
 * A certificate as a marker-drawn stamp: two rings and the issuer's name. The
 * same mark the whiteboard uses for a credential, so certificates look like
 * the rest of the site rather than like a badge from somewhere else.
 */
export function Stamp({
  text,
  size = 72,
  className = "",
}: {
  /** Short issuer name, e.g. "Google". */
  text: string;
  size?: number;
  className?: string;
}) {
  // Long names shrink so they still sit inside the inner ring.
  const fontSize = Math.min(19, 150 / Math.max(text.length, 4));
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 -rotate-6 ${className}`}
    >
      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--wb-ink)" strokeWidth="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="var(--wb-ink)" strokeWidth="1.6" />
      <text
        x="50"
        y="50"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={fontSize}
        fill="var(--wb-ink)"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        {text}
      </text>
    </svg>
  );
}
