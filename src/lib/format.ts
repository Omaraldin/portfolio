/**
 * Renders an ISO date as e.g. "13 Aug 2026". Fixed to en-GB and UTC so the
 * server and client always produce the same string.
 */
/**
 * Renders a YYYY-MM string as e.g. "Aug 2024". Certifications are recorded at
 * month granularity, since that is what issuers publish.
 */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  return new Date(`${year}-${month}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
