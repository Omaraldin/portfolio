/**
 * The admin panel writes directly to files on disk with no authentication,
 * which is only safe because it never exists outside local development.
 *
 * Every admin page and route handler calls this first. It is deliberately a
 * hard throw rather than a redirect: if this ever runs on a deployed server,
 * failing loudly is the correct outcome.
 */
export function assertLocalOnly(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "The admin panel is development-only and must never run in production.",
    );
  }
}

/** True when the admin panel should be reachable at all. */
export const adminEnabled = process.env.NODE_ENV !== "production";
