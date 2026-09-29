import type { ArticleMeta, Project } from "@/content/types";
import type { Domain } from "@/content/taxonomy";

/*
  Lays out the home-page board: projects in, positions and lines out.

  Two rules keep it honest:

  - Grouping is automatic. A project with no board data still lands in a zone
    derived from its first domain, so unrelated work simply sits in its own
    area as its own sketch.
  - Lines are never inferred. The only lines drawn are the ones a project
    declares — `uses` for a real dependency, `sameProblem` for a genuinely
    shared problem. Ten unrelated projects means ten sketches and no lines.

  Everything here is plain geometry on a fixed 1600-wide canvas; the SVG scales
  it to the viewport.
*/

export const BOARD_WIDTH = 1600;

const PAD_X = 48;
const COLS = 3;
const BOX_W = 452;
const BOX_H = 250;
const GAP_X = (BOARD_WIDTH - PAD_X * 2 - BOX_W * COLS) / (COLS - 1);
const ZONE_HEAD = 64;
const ARC_ROOM = 96; // space above a row for a dependency arc and its label
const AUDIENCE_ROOM = 170; // arrow + stick figures + caption under a box
const NOTE_ROOM = 56; // a red annotation under a box
const SAME_ROOM = 120; // a dashed "same problem" dip under a row
const ROW_GAP = 40;

/** Where a project goes when it doesn't name a zone. */
const ZONE_BY_DOMAIN: Record<Domain, string> = {
  web: "Platforms & web",
  backend: "Platforms & web",
  security: "Platforms & web",
  ecommerce: "Platforms & web",
  embedded: "Devices & data",
  automation: "Devices & data",
  mobile: "Apps",
  desktop: "Apps",
  games: "Games",
};

export type PartKind = "box" | "db" | "queue";

export type BoardPart = { label: string; kind: PartKind; x: number; w: number; fontSize: number };

export type BoardNode = {
  slug: string;
  title: string;
  href: string;
  zone: string;
  shape: "service" | "library";
  x: number;
  y: number;
  w: number;
  h: number;
  parts: BoardPart[];
  /** Service parts are a flow and get arrows between them; library parts are modules. */
  flow: boolean;
  caption: string;
  note?: string;
  audience?: { label: string; arrowLabel?: string; x: number; y: number };
  posts: { count: number; href: string } | null;
};

export type BoardEdge = {
  id: string;
  kind: "uses" | "same";
  from: string;
  to: string;
  d: string;
  label: string;
  labelX: number;
  labelY: number;
  anchor?: "middle" | "start";
};

export type BoardZone = { name: string; y: number };

export type Board = {
  width: number;
  height: number;
  zones: BoardZone[];
  nodes: BoardNode[];
  edges: BoardEdge[];
};

function partKind(label: string): PartKind {
  if (/postgres|mysql|sqlite|redis|mongo|database|\bdb\b|store/i.test(label)) return "db";
  if (/queue|kafka|rabbit|stream|buffer/i.test(label)) return "queue";
  return "box";
}

/** Approximate width of a handwritten label, so part boxes fit their text. */
const textWidth = (s: string, size: number) => s.length * size * 0.52;

export function layoutParts(labels: string[], flow: boolean): BoardPart[] {
  const arrow = flow ? (labels.length > 3 ? 30 : 40) : 16;
  let widths = labels.map((l) => {
    const kind = partKind(l);
    return kind === "box" ? Math.max(72, textWidth(l, 20) + 30) : 64;
  });
  const avail = BOX_W - 56;
  const total = () => widths.reduce((a, b) => a + b, 0) + arrow * (labels.length - 1);
  // Squeeze boxes (never cylinders or queues) until the row fits.
  while (total() > avail && widths.some((w) => w > 72)) {
    widths = widths.map((w) => (w > 72 ? w - 4 : w));
  }
  let x = 28;
  return labels.map((label, i) => {
    const kind = partKind(label);
    // A box's label shrinks to fit inside it; symbol labels sit underneath.
    const fontSize =
      kind === "box" ? Math.min(19, Math.max(13, (widths[i] - 14) / (label.length * 0.52))) : 18;
    const part = { label, kind, x, w: widths[i], fontSize };
    x += widths[i] + arrow;
    return part;
  });
}

/** Dependencies before dependents, so arrows inside a zone read left to right. */
function orderZone(items: Project[]): Project[] {
  const inZone = new Set(items.map((p) => p.slug));
  const placed: Project[] = [];
  const seen = new Set<string>();
  const visit = (p: Project, stack: Set<string>) => {
    if (seen.has(p.slug) || stack.has(p.slug)) return;
    stack.add(p.slug);
    for (const dep of p.board?.uses ?? []) {
      const d = items.find((q) => q.slug === dep.project);
      if (d && inZone.has(d.slug)) visit(d, stack);
    }
    seen.add(p.slug);
    placed.push(p);
  };
  items.forEach((p) => visit(p, new Set()));
  return placed;
}

/** Midpoint of a cubic Bézier — where a line's label goes. */
function mid(p0: number[], p1: number[], p2: number[], p3: number[]) {
  return [
    (p0[0] + 3 * p1[0] + 3 * p2[0] + p3[0]) / 8,
    (p0[1] + 3 * p1[1] + 3 * p2[1] + p3[1]) / 8,
  ];
}

export function layoutBoard(projects: Project[], articles: ArticleMeta[]): Board {
  // ── Group into zones, in the order projects first appear ──
  const zoneOrder: string[] = [];
  const byZone = new Map<string, Project[]>();
  for (const p of projects) {
    const zone = p.board?.zone ?? ZONE_BY_DOMAIN[p.domains[0]] ?? "Other work";
    if (!byZone.has(zone)) {
      byZone.set(zone, []);
      zoneOrder.push(zone);
    }
    byZone.get(zone)!.push(p);
  }

  const slugs = new Set(projects.map((p) => p.slug));
  const validLinks = (links: { project: string; label: string }[] | undefined) =>
    (links ?? []).filter((l) => slugs.has(l.project));

  // Who is depended on by someone in the same row matters for the arc room.
  const usesTargets = new Set<string>();
  for (const p of projects) {
    for (const l of validLinks(p.board?.uses)) usesTargets.add(p.slug), usesTargets.add(l.project);
  }
  const samePairs = projects.flatMap((p) =>
    validLinks(p.board?.sameProblem).map((l) => [p.slug, l.project] as const),
  );

  const nodes: BoardNode[] = [];
  const zones: BoardZone[] = [];
  let y = 24;

  for (const zone of zoneOrder) {
    zones.push({ name: zone, y: y + 36 });
    y += ZONE_HEAD;

    const items = orderZone(byZone.get(zone)!);
    for (let r = 0; r < items.length; r += COLS) {
      const row = items.slice(r, r + COLS);
      const hasArc = row.some((p) => usesTargets.has(p.slug));
      if (hasArc) y += ARC_ROOM;

      row.forEach((p, c) => {
        const b = p.board;
        const flow = (b?.shape ?? "service") === "service";
        const posts = articles.filter((a) => a.related?.includes(p.slug));
        const x = PAD_X + c * (BOX_W + GAP_X);
        nodes.push({
          slug: p.slug,
          title: p.title,
          href: `/work/${p.slug}`,
          zone,
          shape: b?.shape ?? "service",
          x,
          y,
          w: BOX_W,
          h: BOX_H,
          parts: layoutParts(b?.parts ?? p.stack.slice(0, 3), flow),
          flow,
          caption: b?.caption ?? p.stack.slice(0, 4).join(" · "),
          note: b?.note,
          audience: b?.audience
            ? { label: b.audience, arrowLabel: b.audienceLabel, x: x + BOX_W * 0.74, y: y + BOX_H }
            : undefined,
          posts: posts.length
            ? { count: posts.length, href: `/writing/${posts[0].slug}` }
            : null,
        });
      });

      // Room under the row for whatever hangs below its boxes.
      const below = Math.max(
        0,
        ...row.map((p) =>
          p.board?.audience ? AUDIENCE_ROOM : p.board?.note ? NOTE_ROOM : 0,
        ),
      );
      const inRow = new Set(row.map((p) => p.slug));
      // A same-row pair needs a dip under the row; a pair across rows needs a
      // clear run from this row's bottom to the next one's top.
      const same = samePairs.some(([a, b]) => inRow.has(a) && inRow.has(b))
        ? SAME_ROOM
        : samePairs.some(([a, b]) => inRow.has(a) !== inRow.has(b) && (inRow.has(a) || inRow.has(b)))
          ? SAME_ROOM - 40
          : 0;
      y += BOX_H + Math.max(below, same) + ROW_GAP;
    }
  }

  // ── Lines: only what projects declare ──
  const at = new Map(nodes.map((n) => [n.slug, n]));
  const edges: BoardEdge[] = [];

  for (const p of projects) {
    const target = at.get(p.slug)!;

    for (const link of validLinks(p.board?.uses)) {
      const source = at.get(link.project)!;
      let p0: number[], p1: number[], p2: number[], p3: number[];
      if (Math.abs(source.y - target.y) < 1) {
        // Same row: an arc over the gap, from the dependency to its user.
        const leftToRight = source.x < target.x;
        const sx = leftToRight ? source.x + source.w * 0.78 : source.x + source.w * 0.22;
        const tx = leftToRight ? target.x + target.w * 0.22 : target.x + target.w * 0.78;
        p0 = [sx, source.y - 4];
        p1 = [sx, source.y - ARC_ROOM];
        p2 = [tx, target.y - ARC_ROOM];
        p3 = [tx, target.y - 10];
      } else {
        // Different rows or zones: down from one, into the top of the other.
        const down = source.y < target.y;
        p0 = [source.x + source.w / 2, down ? source.y + source.h + 4 : source.y - 4];
        p3 = [target.x + target.w / 2, down ? target.y - 10 : target.y + target.h + 10];
        const bend = (p3[1] - p0[1]) * 0.45;
        p1 = [p0[0], p0[1] + bend];
        p2 = [p3[0], p3[1] - bend];
      }
      const [lx, ly] = mid(p0, p1, p2, p3);
      edges.push({
        id: `uses-${source.slug}-${target.slug}`,
        kind: "uses",
        from: source.slug,
        to: target.slug,
        d: `M${p0} C${p1} ${p2} ${p3}`,
        label: link.label,
        labelX: lx,
        labelY: ly - 14,
      });
    }

    for (const link of validLinks(p.board?.sameProblem)) {
      const other = at.get(link.project)!;
      // Drawn once per pair, whichever side declared it.
      const id = `same-${[p.slug, other.slug].sort().join("-")}`;
      if (edges.some((e) => e.id === id)) continue;
      let p0: number[], p1: number[], p2: number[], p3: number[];
      let labelX: number, labelY: number, anchor: "middle" | "start";
      if (Math.abs(target.y - other.y) < 1) {
        // Same row: a dip under both boxes, labelled underneath.
        const [a, b] = target.x <= other.x ? [target, other] : [other, target];
        const depth = a.y + a.h + SAME_ROOM - 30;
        p0 = [a.x + a.w * 0.62, a.y + a.h + 4];
        p3 = [b.x + b.w * 0.38, b.y + b.h + 4];
        p1 = [p0[0], depth];
        p2 = [p3[0], depth];
        const m = mid(p0, p1, p2, p3);
        [labelX, labelY, anchor] = [m[0], m[1] + 30, "middle"];
      } else {
        // Different rows: out of the upper box's bottom, into the lower box's top.
        const [a, b] = target.y < other.y ? [target, other] : [other, target];
        p0 = [a.x + a.w * 0.5, a.y + a.h + 6];
        p3 = [b.x + b.w * 0.5, b.y - 12];
        const bend = (p3[1] - p0[1]) * 0.5;
        p1 = [p0[0] + 60, p0[1] + bend];
        p2 = [p3[0] + 60, p3[1] - bend];
        // Label just under the upper box, clear of the zone divider below it.
        [labelX, labelY, anchor] = [p0[0] + 64, p0[1] + 36, "start"];
      }
      edges.push({
        id,
        kind: "same",
        from: target.slug,
        to: other.slug,
        d: `M${p0} C${p1} ${p2} ${p3}`,
        label: `same problem: ${link.label}`,
        labelX,
        labelY,
        anchor,
      });
    }
  }

  return { width: BOARD_WIDTH, height: y + 10, zones, nodes, edges };
}

/** A project's parts laid out on their own, for a card cover. */
export function sketchOf(project: Project): { parts: BoardPart[]; flow: boolean } {
  const flow = (project.board?.shape ?? "service") === "service";
  return { parts: layoutParts(project.board?.parts ?? project.stack.slice(0, 3), flow), flow };
}
