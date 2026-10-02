"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Board } from "@/lib/board-layout";

/**
 * The board on phones. The same zones, projects and declared links, as a
 * top-to-bottom list in the board's handwriting — a 1600-wide diagram scaled
 * down to a phone would be unreadable.
 *
 * Like the big board, a project can be traced: the first touch tap on a card
 * picks it out with everything it connects to and shows "case study →"; a
 * second tap opens it. Mouse and keyboard go straight to the case study.
 */
export function BoardFlow({ board }: { board: Board }) {
  const title = (slug: string) => board.nodes.find((n) => n.slug === slug)?.title ?? slug;
  const [selected, setSelected] = useState<string | null>(null);
  // A ref, not state: the click that follows a pointerdown must see it at once.
  const touched = useRef(false);

  const connected = new Set<string>();
  if (selected) {
    connected.add(selected);
    for (const e of board.edges) {
      if (e.from === selected) connected.add(e.to);
      if (e.to === selected) connected.add(e.from);
    }
  }

  return (
    <div
      className="space-y-8"
      style={{ fontFamily: "var(--font-hand)" }}
      onPointerDown={(e) => {
        // A tap outside every card puts the list back.
        if (!(e.target as Element).closest("[data-flow-card]")) setSelected(null);
      }}
    >
      {board.zones.map((zone) => (
        <section key={zone.name}>
          <h3 className="text-[22px]" style={{ color: zone.color }}>{zone.name}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {board.nodes
              .filter((n) => n.zone === zone.name)
              .map((n) => {
                const uses = board.edges.filter((e) => e.kind === "uses" && e.to === n.slug);
                const usedBy = board.edges.filter((e) => e.kind === "uses" && e.from === n.slug);
                const same = board.edges.filter(
                  (e) => e.kind === "same" && (e.from === n.slug || e.to === n.slug),
                );
                const isSelected = selected === n.slug;
                const dimmed = selected !== null && !connected.has(n.slug);
                return (
                  <div
                    key={n.slug}
                    data-flow-card
                    className="transition-opacity duration-200"
                    style={{ opacity: dimmed ? 0.3 : 1 }}
                  >
                    <Link
                      href={n.href}
                      aria-label={`${n.title}: case study`}
                      onPointerDown={(e) => (touched.current = e.pointerType === "touch")}
                      onClick={(e) => {
                        if (!touched.current || isSelected) return;
                        e.preventDefault();
                        setSelected(n.slug);
                      }}
                      className="block rounded-[14px_18px_12px_16px] border-[3px] border-[color:var(--wb-ink)] px-4 py-3 text-[color:var(--wb-ink)]"
                      style={{
                        borderLeftColor: zone.color,
                        boxShadow: selected && connected.has(n.slug) ? `0 0 0 3px ${zone.color}` : undefined,
                      }}
                    >
                      <span className="block text-[25px] leading-tight font-bold">{n.title}</span>
                      <span className="mt-1 block text-[17px] text-[color:var(--wb-muted)]">
                        {n.parts.map((p) => p.label).join(n.flow ? " → " : " · ")}
                      </span>
                      {n.note ? (
                        <span className="mt-1 block text-[17px] text-[color:var(--wb-red)]">{n.note}</span>
                      ) : null}
                      {/*
                        Connections as tags on every card at both ends, so a
                        link shows wherever the reader is in the list.
                      */}
                      {uses.length + usedBy.length + same.length > 0 ? (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {uses.map((e) => (
                            <span key={e.id} className="rounded-md border-2 border-[color:var(--wb-green)] px-2 py-0.5 text-[16px] leading-snug text-[color:var(--wb-green)]">
                              uses {title(e.from)}: {e.label}
                            </span>
                          ))}
                          {usedBy.map((e) => (
                            <span key={e.id} className="rounded-md border-2 border-[color:var(--wb-green)] px-2 py-0.5 text-[16px] leading-snug text-[color:var(--wb-green)]">
                              used by {title(e.to)}
                            </span>
                          ))}
                          {same.map((e) => (
                            <span key={e.id} className="rounded-md border-2 border-dashed border-[color:var(--wb-ink)] px-2 py-0.5 text-[16px] leading-snug">
                              same problem as {title(e.from === n.slug ? e.to : e.from)}: {e.label.replace(/^same problem: /, "")}
                            </span>
                          ))}
                        </span>
                      ) : null}
                      {isSelected ? (
                        <span className="mt-2 block text-right text-[20px] font-bold">case study →</span>
                      ) : null}
                    </Link>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
