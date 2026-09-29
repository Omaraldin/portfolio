import type { BoardPart } from "@/lib/board-layout";

/*
  How a project's parts are drawn — shared by the home-page board and the work
  cards, so a system looks the same wherever it appears. Databases are
  cylinders, queues are stacked lines, everything else is a box; a service's
  parts are joined by arrows because they form a flow.
*/

const hand = { fontFamily: "var(--font-hand)" };
const ink = "var(--wb-ink)";

export function Part({ p, top }: { p: BoardPart; top: number }) {
  const cx = p.x + p.w / 2;
  if (p.kind === "db") {
    const l = p.x + 6, r = p.x + p.w - 6;
    return (
      <>
        <path
          className="wb-line"
          d={`M${l} ${top + 8} C${l} ${top - 4} ${r} ${top - 4} ${r} ${top + 8} C${r} ${top + 20} ${l} ${top + 20} ${l} ${top + 8} L${l} ${top + 54} C${l} ${top + 66} ${r} ${top + 66} ${r} ${top + 54} L${r} ${top + 8}`}
        />
        <text x={cx} y={top + 92} fontSize={18} textAnchor="middle" fill={ink} style={hand}>
          {p.label}
        </text>
      </>
    );
  }
  if (p.kind === "queue") {
    const l = p.x + 6, r = p.x + p.w - 6;
    return (
      <>
        <path
          className="wb-line"
          d={[0, 14, 28, 42, 56].map((o) => `M${l} ${top + o} L${r} ${top + o}`).join(" ") + ` M${l - 2} ${top - 6} L${l - 2} ${top + 62} M${r + 2} ${top - 6} L${r + 2} ${top + 62}`}
        />
        <text x={cx} y={top + 92} fontSize={18} textAnchor="middle" fill={ink} style={hand}>
          {p.label}
        </text>
      </>
    );
  }
  return (
    <>
      <path className="wb-line" d={`M${p.x} ${top + 2} L${p.x + p.w} ${top} L${p.x + p.w + 1} ${top + 58} L${p.x + 1} ${top + 60} Z`} />
      <text x={cx} y={top + 36} fontSize={p.fontSize} textAnchor="middle" fill={ink} style={hand}>
        {p.label}
      </text>
    </>
  );
}

/** The row of parts on its own, for a card cover. */
export function PartsSketch({
  parts,
  flow,
  label,
  id,
}: {
  parts: BoardPart[];
  flow: boolean;
  label: string;
  /** Unique per sketch on the page: it names the arrowhead marker. */
  id: string;
}) {
  const marker = `sketch-arrow-${id}`;
  const top = 22;
  /*
    A fixed canvas the width of a board box, with the parts centred in it, so
    every sketch draws at the same scale — two parts are not blown up to fill
    the space that four take.
  */
  const canvas = 452;
  const right = parts.length ? parts[parts.length - 1].x + parts[parts.length - 1].w : 0;
  const offset = (canvas - (right + 28)) / 2;
  return (
    <svg
      viewBox={`0 0 ${canvas} 132`}
      className="h-auto w-[82%] max-w-[440px] overflow-visible"
      role="img"
      aria-label={label}
    >
      <defs>
        <marker id={marker} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
          <path d="M1 1 L10 6 L1 11" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g transform={`translate(${offset} 0)`}>
      {parts.map((p, i) => (
        <g key={p.label}>
          <Part p={p} top={top} />
          {flow && i < parts.length - 1 ? (
            <path
              className="wb-line"
              markerEnd={`url(#${marker})`}
              d={`M${p.x + p.w + 6} ${top + 30} L${parts[i + 1].x - 8} ${top + 30}`}
            />
          ) : null}
        </g>
      ))}
      </g>
    </svg>
  );
}
