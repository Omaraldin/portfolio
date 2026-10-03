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
const BOX_H = 210;
const GAP_X = (BOARD_WIDTH - PAD_X * 2 - BOX_W * COLS) / (COLS - 1);
const HEADER = 84; // the legend strip across the top
const ZONE_HEAD = 40; // a band's zone labels
const ARC_ROOM = 70; // space above a band for a dependency arc and its label
const TAB_ROOM = 34; // a library's "pkg" tab sticks up above its box
const AUDIENCE_ROOM = 112; // arrow + stick figures + caption under a box
const NOTE_ROOM = 50; // a red annotation under a box
const SAME_ROOM = 100; // a dashed "same problem" dip under a band
const ROW_GAP = 28;

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

/*
  Each zone writes in one of the markers on the tray. Only its heading and a
  small corner tick on each box take the colour; outlines stay ink.
*/
const ZONE_MARKER: Record<string, string> = {
  "Platforms & web": "var(--wb-green)",
  "Creative tools": "var(--wb-red)",
  "Devices & data": "var(--wb-blue)",
  Apps: "var(--wb-purple)",
};
const SPARE_MARKERS = ["var(--wb-blue)", "var(--wb-purple)", "var(--wb-green)", "var(--wb-red)"];

/** The marker colour a zone is written in. Zones without one get a spare, by name. */
export function markerOf(zone: string): string {
  if (ZONE_MARKER[zone]) return ZONE_MARKER[zone];
  let h = 0;
  for (const c of zone) h = (h * 31 + c.charCodeAt(0)) | 0;
  return SPARE_MARKERS[Math.abs(h) % SPARE_MARKERS.length];
}

/** The board area a project sits in: its own `zone`, else one from its first domain. */
export function zoneOf(project: Project): string {
  return project.board?.zone ?? ZONE_BY_DOMAIN[project.domains[0]] ?? "Other work";
}

export type PartKind = "box" | "db" | "queue";

export type BoardPart = { label: string; kind: PartKind; x: number; w: number; fontSize: number };

export type BoardNode = {
  slug: string;
  title: string;
  href: string;
  zone: string;
  /** The zone's marker colour, for the box's corner tick. */
  color: string;
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
  /** Which end of the box a note hangs from: away from any line under it. */
  noteAnchor: "start" | "end";
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
  anchor?: "middle" | "start" | "end";
};

export type BoardZone = { name: string; color: string };

/** A zone's handwritten heading, at the top of each band it appears in. */
export type BoardLabel = { name: string; color: string; x: number; y: number };

export type Board = {
  width: number;
  height: number;
  zones: BoardZone[];
  labels: BoardLabel[];
  /** Dashed lines between bands, and between zones sharing a band. */
  dividers: string[];
  nodes: BoardNode[];
  edges: BoardEdge[];
  /** The slot that points to /work when the last band is short. */
  more: { x: number; y: number; w: number; h: number } | null;
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

/** Every ordering of a short list. Bands hold at most COLS items, so this stays tiny. */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

type Segment = { zone: string; items: Project[] };

/*
  Packs zones into bands of COLS boxes, in order, so no row is left mostly
  empty: a zone that doesn't fit in what's left of a band carries on in the
  next one. When a zone is split, the projects linked to something already in
  the band go first, so a line stays inside one band where it can.
*/
function packBands(
  zoneOrder: string[],
  byZone: Map<string, Project[]>,
  linked: (a: string, b: string) => boolean,
): Segment[][] {
  const bands: Segment[][] = [];
  let band: Segment[] = [];
  let fill = 0;
  for (const zone of zoneOrder) {
    let items = orderZone(byZone.get(zone)!);
    while (items.length) {
      if (fill === COLS) {
        bands.push(band);
        band = [];
        fill = 0;
      }
      const free = COLS - fill;
      if (items.length > free) {
        const inBand = band.flatMap((s) => s.items);
        const pull = (p: Project) => (inBand.some((q) => linked(p.slug, q.slug)) ? 0 : 1);
        items = [...items].sort((a, b) => pull(a) - pull(b));
      }
      const take = items.slice(0, free);
      items = items.slice(free);
      band.push({ zone, items: take });
      fill += take.length;
    }
  }
  if (band.length) bands.push(band);
  return bands;
}

/*
  Orders one band so connected projects sit side by side: tries every order
  that keeps each zone together and picks the one with the shortest lines,
  preferring dependencies left of their users. Ties keep the original order.
*/
function arrangeBand(
  band: Segment[],
  linked: (a: string, b: string) => boolean,
  uses: (user: string, dep: string) => boolean,
): Segment[] {
  const original = band.flatMap((s) => s.items.map((p) => p.slug));
  let best = band;
  let bestCost = Infinity;
  for (const order of permutations(band)) {
    const options = order.reduce<Segment[][]>(
      (acc, seg) =>
        acc.flatMap((prefix) =>
          permutations(seg.items).map((items) => [...prefix, { zone: seg.zone, items }]),
        ),
      [[]],
    );
    for (const option of options) {
      const slugs = option.flatMap((s) => s.items.map((p) => p.slug));
      let cost = 0;
      slugs.forEach((a, i) =>
        slugs.forEach((b, j) => {
          if (i < j && linked(a, b)) cost += j - i;
          // A dependency to the right of its user reads backwards.
          if (i < j && uses(a, b)) cost += 0.5;
        }),
      );
      slugs.forEach((s, i) => (cost += Math.abs(i - original.indexOf(s)) * 0.01));
      if (cost < bestCost) [best, bestCost] = [option, cost];
    }
  }
  return best;
}

export function layoutBoard(projects: Project[], articles: ArticleMeta[]): Board {
  // ── Group into zones, in the order projects first appear ──
  const zoneOrder: string[] = [];
  const byZone = new Map<string, Project[]>();
  for (const p of projects) {
    const zone = zoneOf(p);
    if (!byZone.has(zone)) {
      byZone.set(zone, []);
      zoneOrder.push(zone);
    }
    byZone.get(zone)!.push(p);
  }

  const slugs = new Set(projects.map((p) => p.slug));
  const validLinks = (links: { project: string; label: string }[] | undefined) =>
    (links ?? []).filter((l) => slugs.has(l.project));
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const uses = (user: string, dep: string) =>
    validLinks(bySlug.get(user)?.board?.uses).some((l) => l.project === dep);
  const same = (a: string, b: string) =>
    validLinks(bySlug.get(a)?.board?.sameProblem).some((l) => l.project === b) ||
    validLinks(bySlug.get(b)?.board?.sameProblem).some((l) => l.project === a);
  const linked = (a: string, b: string) => uses(a, b) || uses(b, a) || same(a, b);

  const bands = packBands(zoneOrder, byZone, linked).map((b) => arrangeBand(b, linked, uses));

  const nodes: BoardNode[] = [];
  const labels: BoardLabel[] = [];
  const dividers: string[] = [];
  let more: Board["more"] = null;
  let y = HEADER;

  bands.forEach((band, bandIndex) => {
    const items = band.flatMap((s) => s.items);
    const inBand = new Set(items.map((p) => p.slug));
    const top = y;
    if (bandIndex > 0) {
      dividers.push(
        `M24 ${top - 8} C${BOARD_WIDTH * 0.3} ${top - 18} ${BOARD_WIDTH * 0.6} ${top + 2} ${BOARD_WIDTH - 24} ${top - 10}`,
      );
    }
    y += ZONE_HEAD;
    const hasArc = items.some((p) => validLinks(p.board?.uses).some((l) => inBand.has(l.project)));
    if (hasArc) y += ARC_ROOM;
    else if (items.some((p) => p.board?.shape === "library")) y += TAB_ROOM;

    /*
      A short last band would leave most of a row empty. Instead it is
      centred, with a link to the full work page in the next slot.
    */
    const short = bandIndex === bands.length - 1 && items.length < COLS;
    let col = short ? (COLS - items.length - 1) / 2 : 0;

    band.forEach((seg, segIndex) => {
      const segX = PAD_X + col * (BOX_W + GAP_X);
      labels.push({ name: seg.zone, color: markerOf(seg.zone), x: segX, y: top + 30 });
      if (segIndex > 0) {
        // Stops at the boxes' bottom edge, so lines under the band cross clean.
        const dx = segX - GAP_X / 2;
        dividers.push(`M${dx} ${top + 6} C${dx - 4} ${top + 60} ${dx + 4} ${y + BOX_H * 0.6} ${dx - 2} ${y + BOX_H}`);
      }
      seg.items.forEach((p) => {
        const b = p.board;
        const flow = (b?.shape ?? "service") === "service";
        const posts = articles.filter((a) => a.related?.includes(p.slug));
        const x = PAD_X + col * (BOX_W + GAP_X);
        col += 1;
        nodes.push({
          slug: p.slug,
          title: p.title,
          href: `/work/${p.slug}`,
          zone: seg.zone,
          color: markerOf(seg.zone),
          shape: b?.shape ?? "service",
          x,
          y,
          w: BOX_W,
          h: BOX_H,
          parts: layoutParts(b?.parts ?? p.stack.slice(0, 3), flow),
          flow,
          caption: b?.caption ?? p.stack.slice(0, 4).join(" · "),
          note: b?.note,
          noteAnchor: "start",
          audience: b?.audience
            ? { label: b.audience, arrowLabel: b.audienceLabel, x: x + BOX_W * 0.62, y: y + BOX_H }
            : undefined,
          posts: posts.length
            ? { count: posts.length, href: `/writing/${posts[0].slug}` }
            : null,
        });
      });
    });

    if (short) more = { x: PAD_X + col * (BOX_W + GAP_X), y, w: BOX_W, h: BOX_H };

    // Room under the band for whatever hangs below its boxes.
    const below = Math.max(
      0,
      ...items.map((p) => (p.board?.audience ? AUDIENCE_ROOM : p.board?.note ? NOTE_ROOM : 0)),
    );
    // A same-band pair needs a dip under the boxes; a pair across bands
    // needs a clear run from this band's bottom to the next one's top.
    const dip = items.some((a) => items.some((b) => a !== b && same(a.slug, b.slug)))
      ? SAME_ROOM
      : items.some((a) => projects.some((b) => !inBand.has(b.slug) && same(a.slug, b.slug)))
        ? SAME_ROOM - 40
        : 0;
    y += BOX_H + Math.max(below, dip) + ROW_GAP;
  });

  const zones: BoardZone[] = zoneOrder.map((name) => ({ name, color: markerOf(name) }));

  // ── Lines: only what projects declare ──
  const at = new Map(nodes.map((n) => [n.slug, n]));
  const edges: BoardEdge[] = [];

  for (const p of projects) {
    const target = at.get(p.slug)!;

    for (const link of validLinks(p.board?.uses)) {
      const source = at.get(link.project)!;
      let p0: number[], p1: number[], p2: number[], p3: number[];
      const adjacent = Math.abs(source.x - target.x) < source.w + GAP_X + 1;
      if (Math.abs(source.y - target.y) < 1 && adjacent) {
        /*
          Neighbours in a row: out of the dependency's side, up over the gap
          and down into its user's top. Leaving from the side keeps the start
          visibly on the box — the top right corner is where a posts note
          sits, and a line leaving there looked like it began in mid-air.
        */
        const leftToRight = source.x < target.x;
        const dir = leftToRight ? 1 : -1;
        const sx = leftToRight ? source.x + source.w + 4 : source.x - 4;
        const tx = leftToRight ? target.x + target.w * 0.2 : target.x + target.w * 0.8;
        // Two curves: rise through the gap to just above the target's
        // corner, then over and down into its top.
        const corner = [leftToRight ? target.x + 6 : target.x + target.w - 6, target.y - 36];
        p0 = [sx, source.y + 48];
        p1 = [sx + dir * GAP_X * 0.8, p0[1]];
        p2 = [corner[0] - dir * 34, corner[1]];
        p3 = [tx, target.y - 10];
        edges.push({
          id: `uses-${source.slug}-${target.slug}`,
          kind: "uses",
          from: source.slug,
          to: target.slug,
          d: `M${p0} C${p1} ${p2} ${corner} C${[corner[0] + dir * 40, corner[1] - 26]} ${[tx, target.y - 52]} ${p3}`,
          label: link.label,
          labelX: tx + 18 * dir,
          labelY: target.y - 52,
          anchor: leftToRight ? "start" : "end",
        });
        continue;
      } else if (Math.abs(source.y - target.y) < 1) {
        // Further apart in a row: an arc over whatever is between them, from
        // the middle of each box's top, clear of the posts notes.
        const leftToRight = source.x < target.x;
        const sx = source.x + source.w * (leftToRight ? 0.55 : 0.2);
        const tx = target.x + target.w * (leftToRight ? 0.2 : 0.55);
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
      let labelX: number, labelY: number, anchor: "middle" | "start" | "end";
      const label = `same problem: ${link.label}`;
      if (Math.abs(target.y - other.y) < 1) {
        /*
          Same band: a dip under both boxes, labelled underneath. It leaves
          the left box near its right end and meets the right box near its
          left end, so the right box's note moves to its right-hand end.
        */
        const [a, b] = target.x <= other.x ? [target, other] : [other, target];
        b.noteAnchor = "end";
        const depth = a.y + a.h + SAME_ROOM - 44;
        p0 = [a.x + a.w * 0.8, a.y + a.h + 4];
        p3 = [b.x + b.w * 0.2, b.y + b.h + 4];
        p1 = [p0[0], depth];
        p2 = [p3[0], depth];
        const m = mid(p0, p1, p2, p3);
        [labelX, labelY, anchor] = [m[0], m[1] + 30, "middle"];
      } else {
        /*
          Different rows: from the right-hand end of the upper box's bottom to
          the right-hand end of the lower box's top. Notes hang under the left
          of a box, so the right side keeps the line clear of them; the label
          sits just above the lower box, where nothing else is written.
        */
        const [a, b] = target.y < other.y ? [target, other] : [other, target];
        const tab = b.shape === "library" ? TAB_ROOM : 0;
        p0 = [a.x + a.w * 0.88, a.y + a.h + 6];
        p3 = [b.x + b.w * 0.88, b.y - 12 - tab];
        const bend = (p3[1] - p0[1]) * 0.5;
        p1 = [p0[0] + 50, p0[1] + bend];
        p2 = [p3[0] + 50, p3[1] - bend];
        // Written to the right of the line, unless that runs off the board.
        [labelX, labelY, anchor] =
          p3[0] + 30 + textWidth(label, 22) < BOARD_WIDTH
            ? [p3[0] + 30, p3[1] - 6, "start"]
            : [p3[0] - 10, p3[1] - 6, "end"];
      }
      edges.push({
        id,
        kind: "same",
        from: target.slug,
        to: other.slug,
        d: `M${p0} C${p1} ${p2} ${p3}`,
        label,
        labelX,
        labelY,
        anchor,
      });
    }
  }

  return { width: BOARD_WIDTH, height: y + 10, zones, labels, dividers, nodes, edges, more };
}

export type Connection = {
  kind: "uses" | "usedBy" | "same";
  project: Project;
  label: string;
};

/**
 * Every declared link touching one project, from either end: what it uses,
 * what uses it, and what shares its problem. Same rule as the board — only
 * declared links, never inferred ones.
 */
export function connectionsOf(project: Project, all: Project[]): Connection[] {
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const out: Connection[] = [];
  for (const l of project.board?.uses ?? []) {
    const other = bySlug.get(l.project);
    if (other) out.push({ kind: "uses", project: other, label: l.label });
  }
  for (const other of all) {
    for (const l of other.board?.uses ?? []) {
      if (l.project === project.slug) out.push({ kind: "usedBy", project: other, label: l.label });
    }
  }
  const same = new Set<string>();
  for (const l of project.board?.sameProblem ?? []) {
    const other = bySlug.get(l.project);
    if (other && !same.has(other.slug)) {
      same.add(other.slug);
      out.push({ kind: "same", project: other, label: l.label });
    }
  }
  for (const other of all) {
    for (const l of other.board?.sameProblem ?? []) {
      if (l.project === project.slug && !same.has(other.slug)) {
        same.add(other.slug);
        out.push({ kind: "same", project: other, label: l.label });
      }
    }
  }
  return out;
}

/** A project's parts laid out on their own, for a card cover. */
export function sketchOf(project: Project): { parts: BoardPart[]; flow: boolean } {
  const flow = (project.board?.shape ?? "service") === "service";
  return { parts: layoutParts(project.board?.parts ?? project.stack.slice(0, 3), flow), flow };
}
