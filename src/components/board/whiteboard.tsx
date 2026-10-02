import Link from "next/link";
import type { Board, BoardNode } from "@/lib/board-layout";
import { BoardTracer } from "./board-tracer";
import { Part } from "./parts-sketch";

/*
  The home-page board, drawn as SVG on the server from the layout in
  lib/board-layout. Only the hover tracing runs on the client.

  Everything on the board is marker handwriting; the only motion is the lines
  drawing themselves once, and a dot of data travelling each dependency.
*/

const hand = { fontFamily: "var(--font-hand)" };
const ink = "var(--wb-ink)";

/** A deterministic wobble per project, so boxes look hand-drawn but never change between renders. */
function jitter(seed: string, i: number, amount = 4) {
  let h = 0;
  for (const c of seed + i) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 1000) / 1000 - 0.5) * amount;
}

function Frame({ n }: { n: BoardNode }) {
  const j = (i: number) => jitter(n.slug, i);
  const { x, y, w, h } = n;
  if (n.shape === "library") {
    // A package: body plus a labelled tab — the diagram symbol for a library.
    return (
      <>
        <path
          className="wb-frame"
          d={`M${x} ${y} L${x + w + j(1)} ${y + j(2)} L${x + w + j(3)} ${y + h + j(4)} L${x + j(5)} ${y + h + j(6)} Z`}
        />
        <path className="wb-frame" d={`M${x} ${y} L${x + 1} ${y - 30} L${x + 128} ${y - 32} L${x + 130} ${y}`} />
        <text x={x + 16} y={y - 9} fontSize={17} fill="var(--wb-muted)" style={hand}>
          pkg
        </text>
      </>
    );
  }
  // A service: a rounded box.
  const r = 16;
  return (
    <path
      className="wb-frame"
      d={`M${x + r} ${y + j(1)} L${x + w - r} ${y + j(2)} Q${x + w} ${y} ${x + w} ${y + r} L${x + w + j(3)} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} L${x + r} ${y + h + j(4)} Q${x} ${y + h} ${x} ${y + h - r} L${x + j(5)} ${y + r} Q${x} ${y} ${x + r} ${y + j(1)} Z`}
    />
  );
}

function Node({ n }: { n: BoardNode }) {
  const partsTop = n.y + 74;
  return (
    <g className="wb-item" data-item={n.slug}>
      <Link href={n.href} className="wb-node" data-node={n.slug} aria-label={`${n.title}: case study`}>
        {/* Transparent fill so the whole box, not just its outline, is the link. */}
        <rect x={n.x} y={n.y} width={n.w} height={n.h} fill="transparent" />
        {/* Keyboard focus ring, drawn clear of the box. */}
        <rect className="wb-focus" x={n.x - 10} y={n.y - 10} width={n.w + 20} height={n.h + 20} rx={22} />
        <Frame n={n} />
        {/* The zone's marker: a short tick round the bottom-right corner. */}
        <path
          className="wb-line"
          // Inline: .wb-line's stroke rules would beat presentation attributes.
          style={{ stroke: n.color, strokeWidth: 4 }}
          d={`M${n.x + n.w - 44} ${n.y + n.h + 9} L${n.x + n.w + 8} ${n.y + n.h + 8} L${n.x + n.w + 9} ${n.y + n.h - 44}`}
        />
        <text x={n.x + 26} y={n.y + 50} fontSize={38} fontWeight={700} fill={ink} style={hand}>
          {n.title}
        </text>
        <g transform={`translate(${n.x} 0)`}>
          {n.parts.map((p, i) => (
            <g key={p.label}>
              <Part p={p} top={partsTop} />
              {n.flow && i < n.parts.length - 1 ? (
                <path
                  className="wb-line"
                  markerEnd="url(#wb-arrow-ink)"
                  d={`M${p.x + p.w + 6} ${partsTop + 30} L${n.parts[i + 1].x - 8} ${partsTop + 30}`}
                />
              ) : null}
            </g>
          ))}
        </g>
        <text className="wb-caption" x={n.x + 26} y={n.y + n.h - 16} fontSize={19} fill="var(--wb-muted)" style={hand}>
          {n.caption}
        </text>
        {/* Takes the caption's place on hover and focus, so the box reads as a link. */}
        <text className="wb-cta" aria-hidden="true" x={n.x + n.w - 26} y={n.y + n.h - 16} fontSize={23} fontWeight={700} textAnchor="end" fill={ink} style={hand}>
          case study →
        </text>
      </Link>

      {n.posts ? (
        <Link href={n.posts.href} aria-label={`${n.posts.count} ${n.posts.count === 1 ? "post" : "posts"} about ${n.title}`}>
          <g transform={`rotate(4 ${n.x + n.w - 70} ${n.y})`}>
            <rect x={n.x + n.w - 138} y={n.y - 20} width={132} height={40} fill="var(--wb-note)" />
            <text x={n.x + n.w - 124} y={n.y + 7} fontSize={19} fill="var(--wb-on-note)" style={hand}>
              ✎ {n.posts.count} {n.posts.count === 1 ? "post" : "posts"}
            </text>
          </g>
        </Link>
      ) : null}

      {n.note ? (() => {
        const nx = n.noteAnchor === "end" ? n.x + n.w - 22 : n.x + 22;
        const ny = n.y + n.h + 34;
        return (
          <text x={nx} y={ny} fontSize={22} textAnchor={n.noteAnchor} fill="var(--wb-red)" transform={`rotate(-2 ${nx} ${ny})`} style={hand}>
            {n.note}
          </text>
        );
      })() : null}

      {n.audience ? <Audience n={n} /> : null}
    </g>
  );
}

/** Who uses it: an arrow out of the box and a small crowd. */
function Audience({ n }: { n: BoardNode }) {
  const a = n.audience!;
  const fx = a.x - 40;
  const fy = a.y + 62;
  return (
    <g>
      <path className="wb-line wb-green" markerEnd="url(#wb-arrow-green)" d={`M${a.x} ${a.y + 6} C${a.x + 4} ${a.y + 20} ${a.x + 6} ${a.y + 30} ${a.x + 8} ${a.y + 40}`} />
      {a.arrowLabel ? (
        <text x={a.x + 26} y={a.y + 32} fontSize={21} fill="var(--wb-green)" style={hand}>
          {a.arrowLabel}
        </text>
      ) : null}
      <g className="wb-line">
        {[0, 1, 2, 3].map((i) => {
          const cx = fx + i * 32;
          const cy = fy + (i % 2 ? -4 : 2);
          return (
            <path
              key={i}
              d={`M${cx} ${cy - 8} a8 8 0 1 0 0.01 0 M${cx} ${cy + 8} L${cx} ${cy + 30} M${cx - 11} ${cy + 16} L${cx + 11} ${cy + 16} M${cx} ${cy + 30} L${cx - 8} ${cy + 46} M${cx} ${cy + 30} L${cx + 8} ${cy + 46}`}
            />
          );
        })}
      </g>
      <text x={fx - 18} y={fy + 30} fontSize={22} fontWeight={700} textAnchor="end" fill={ink} style={hand}>
        {a.label}
      </text>
    </g>
  );
}

/** An empty slot drawn in dashed marker, pointing to the full work page. */
function More({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Link href="/work" className="wb-node wb-more">
      <rect x={x} y={y} width={w} height={h} fill="transparent" />
      <path
        className="wb-frame"
        strokeDasharray="12 12"
        strokeWidth={2.4}
        d={`M${x + 16} ${y + 2} L${x + w - 16} ${y} Q${x + w} ${y} ${x + w} ${y + 16} L${x + w + 2} ${y + h - 16} Q${x + w} ${y + h} ${x + w - 16} ${y + h} L${x + 16} ${y + h + 1} Q${x} ${y + h} ${x} ${y + h - 16} L${x + 1} ${y + 16} Q${x} ${y} ${x + 16} ${y + 2} Z`}
      />
      <text x={x + w / 2} y={y + h / 2 - 8} fontSize={32} fontWeight={700} textAnchor="middle" fill={ink} style={hand}>
        every project, written up →
      </text>
      <text x={x + w / 2} y={y + h / 2 + 28} fontSize={21} textAnchor="middle" fill="var(--wb-muted)" style={hand}>
        the full case studies, in one list
      </text>
    </Link>
  );
}

export function Whiteboard({ board }: { board: Board }) {
  const hasUses = board.edges.some((e) => e.kind === "uses");
  const hasSame = board.edges.some((e) => e.kind === "same");

  return (
    <BoardTracer demo={board.edges.find((e) => e.kind === "uses")?.id}>
      <svg
        viewBox={`0 0 ${board.width} ${board.height}`}
        className="block h-auto w-full overflow-visible"
        role="group"
        aria-label="A whiteboard of Omar's projects, grouped by area, with lines only where one project really uses another or shares a problem with it."
      >
        <defs>
          {(["ink", "green"] as const).map((c) => (
            <marker key={c} id={`wb-arrow-${c}`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
              <path d="M1 1 L10 6 L1 11" fill="none" stroke={c === "ink" ? ink : `var(--wb-${c})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          ))}
        </defs>

        {/* Zones: dashed dividers between areas, and a handwritten heading for each. */}
        <g aria-hidden="true">
          {board.dividers.map((d) => (
            <path key={d} className="wb-line" stroke="var(--wb-muted)" strokeDasharray="10 12" strokeWidth={2} d={d} />
          ))}
          {board.labels.map((l) => (
            <text key={`${l.name}-${l.y}`} x={l.x} y={l.y} fontSize={26} fill={l.color} style={hand}>
              {l.name}
            </text>
          ))}
        </g>

        {/* Lines first, so boxes sit on top of them. */}
        {board.edges.map((e) => (
          <g key={e.id} data-edge={e.id} data-links={`${e.from} ${e.to}`}>
            {e.kind === "uses" ? (
              <>
                <path id={e.id} className="wb-line wb-green wb-draw" strokeWidth={3} pathLength={1} markerEnd="url(#wb-arrow-green)" d={e.d} />
                {/* A dot of data travelling the dependency. */}
                {/* Hidden until it starts moving: before that it sits at the board's corner. */}
                <circle r={6} fill="var(--wb-green)" className="wb-packet" visibility="hidden">
                  <set attributeName="visibility" to="visible" begin="1.6s" />
                  <animateMotion dur="2.8s" begin="1.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                    <mpath href={`#${e.id}`} />
                  </animateMotion>
                </circle>
                <text x={e.labelX} y={e.labelY} fontSize={23} textAnchor={e.anchor ?? "middle"} fill="var(--wb-green)" style={hand}>
                  {e.label}
                </text>
              </>
            ) : (
              <>
                <path className="wb-line" strokeWidth={2.6} strokeDasharray="7 9" d={e.d} />
                <text x={e.labelX} y={e.labelY} fontSize={22} textAnchor={e.anchor ?? "middle"} fill={ink} style={hand}>
                  {e.label}
                </text>
              </>
            )}
          </g>
        ))}

        {board.nodes.map((n) => (
          <Node key={n.slug} n={n} />
        ))}

        {board.more ? <More {...board.more} /> : null}

        {/*
          How to use the board, as a handwritten note at the top left, where it
          is read before the boxes rather than after them.
        */}
        {hasUses || hasSame ? (
          <g transform="rotate(-1.5 48 46)">
            <text x={48} y={46} fontSize={23} fill={ink} style={hand}>
              hover, tab or tap a project to trace what it connects to
            </text>
          </g>
        ) : null}

        {/* Legend, only for the line types actually on the board. */}
        {hasUses || hasSame ? (
          <g aria-hidden="true" transform={`translate(${board.width - 48} 40)`}>
            <text x={0} y={7} fontSize={19} textAnchor="end" fill="var(--wb-muted)" style={hand}>no line = stands on its own</text>
            {hasSame ? (
              <>
                <path className="wb-line" strokeWidth={2.6} strokeDasharray="7 9" d="M-690 0 L-634 -2" />
                <text x={-620} y={7} fontSize={19} fill={ink} style={hand}>same problem, different project</text>
              </>
            ) : null}
            {hasUses ? (
              <>
                <path className="wb-line wb-green" strokeWidth={3} d="M-820 0 L-764 -2" />
                <text x={-750} y={7} fontSize={19} fill={ink} style={hand}>uses</text>
              </>
            ) : null}
          </g>
        ) : null}
      </svg>
    </BoardTracer>
  );
}
