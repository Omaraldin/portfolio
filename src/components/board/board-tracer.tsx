"use client";

import { useEffect, useRef } from "react";

/**
 * Hover or keyboard-focus a project on the board and everything it connects to
 * stays lit while the rest fades back. Plain DOM work on the server-rendered
 * SVG: no state, so tracing never re-renders the board.
 *
 * Three more behaviours ride on the same tracing:
 *
 * - The first time the board scrolls into view it traces one connection on
 *   its own, so visitors see that the board responds. Skipped entirely for
 *   anyone who asked for reduced motion.
 * - The project under the pointer or focus is marked `data-hot`, which lifts
 *   it and shows its "case study →" label (see globals.css).
 * - Touch has no hover, so on a touch tap the first tap on a project traces it
 *   and shows the label; a second tap on it follows the link. Mouse clicks and
 *   the keyboard go straight through.
 */
export function BoardTracer({
  children,
  demo,
}: {
  children: React.ReactNode;
  /** The edge to trace once when the board first comes into view. */
  demo?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const edges = [...root.querySelectorAll<SVGGElement>("[data-edge]")];
    const nodes = [...root.querySelectorAll<SVGElement>("[data-node]")];
    const items = [...root.querySelectorAll<SVGGElement>(".wb-item")];
    let armed: string | null = null;
    let touched = false;
    let interacted = false;

    const light = (ids: Set<string>, onEdge: (e: SVGGElement) => boolean) => {
      root.dataset.tracing = "true";
      for (const e of edges) e.toggleAttribute("data-lit", onEdge(e));
      for (const item of items) item.toggleAttribute("data-lit", ids.has(item.dataset.item ?? ""));
    };

    const trace = (id: string) => {
      const lit = new Set([id]);
      light(lit, (e) => {
        const ends = (e.dataset.links ?? "").split(" ");
        const on = ends.includes(id);
        if (on) ends.forEach((n) => lit.add(n));
        return on;
      });
      // Items are lit after the edges have added their far ends.
      for (const item of items) item.toggleAttribute("data-lit", lit.has(item.dataset.item ?? ""));
      for (const item of items) item.toggleAttribute("data-hot", item.dataset.item === id);
    };

    const clear = () => {
      delete root.dataset.tracing;
      root.querySelectorAll("[data-lit], [data-hot]").forEach((el) => {
        el.removeAttribute("data-lit");
        el.removeAttribute("data-hot");
      });
    };

    const off: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(
      el: Element,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
    ) => {
      el.addEventListener(type, fn as EventListener);
      off.push(() => el.removeEventListener(type, fn as EventListener));
    };

    for (const n of nodes) {
      const id = n.dataset.node ?? "";
      const enter = () => {
        interacted = true;
        trace(id);
      };
      const leave = () => {
        if (armed !== id) clear();
      };
      on(n, "mouseenter", enter);
      on(n, "focus", enter);
      on(n, "mouseleave", leave);
      on(n, "blur", () => {
        armed = null;
        clear();
      });
      on(n, "pointerdown", (e) => {
        touched = e.pointerType === "touch";
      });
      on(n, "click", (e) => {
        if (!touched) return;
        touched = false;
        if (armed === id) return; // second tap: follow the link
        e.preventDefault();
        armed = id;
        interacted = true;
        trace(id);
      });
    }

    // A tap anywhere else on the board puts it back.
    on(root, "pointerdown", (e) => {
      if (!(e.target as Element).closest("[data-node]")) {
        armed = null;
        clear();
      }
    });

    // ── The one-time demonstration ──
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const edge = demo ? edges.find((e) => e.dataset.edge === demo) : undefined;
    let timer: number | undefined;
    if (edge && !reduced) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          if (interacted) return;
          const ends = new Set((edge.dataset.links ?? "").split(" "));
          light(ends, (e) => e === edge);
          // Redraw the line so the eye follows it from one box to the other.
          const path = edge.querySelector<SVGPathElement>(".wb-draw");
          if (path) {
            path.classList.remove("wb-draw");
            void path.getBoundingClientRect();
            path.classList.add("wb-draw");
          }
          timer = window.setTimeout(() => {
            if (!interacted) clear();
          }, 2600);
        },
        { threshold: 0.45 },
      );
      observer.observe(root);
      off.push(() => observer.disconnect());
    }

    return () => {
      off.forEach((f) => f());
      window.clearTimeout(timer);
    };
  }, [demo]);

  return (
    <div ref={ref} className="wb-board">
      {children}
    </div>
  );
}
