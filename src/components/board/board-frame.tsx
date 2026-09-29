/**
 * A physical frame for a board: brushed aluminium with a marker tray for a
 * whiteboard, stained wood with a chalk ledge for a chalkboard.
 *
 * "auto" follows the theme — whiteboard in light mode, chalkboard in dark —
 * so the home board changes material with the site. "chalk" is always a
 * chalkboard, for the footer.
 */
export function BoardFrame({
  variant = "auto",
  className = "",
  children,
}: {
  variant?: "auto" | "chalk";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`board-frame board-frame-${variant} ${className}`}>
      <div className="board-surface">{children}</div>
      {/* The tray along the bottom edge, and what's been left on it. */}
      <div aria-hidden className="board-tray">
        <span className="tray-item tray-marker" style={{ ["--cap" as string]: "#2f6b45", left: "12%" }} />
        <span className="tray-item tray-marker" style={{ ["--cap" as string]: "#c23a2e", left: "19%" }} />
        <span className="tray-item tray-marker" style={{ ["--cap" as string]: "#2957a4", left: "25%" }} />
        <span className="tray-item tray-chalk" style={{ left: "14%" }} />
        <span className="tray-item tray-chalk tray-chalk-short" style={{ left: "21%" }} />
        <span className="tray-item tray-eraser" style={{ right: "10%" }} />
      </div>
    </div>
  );
}
