import Link from "next/link";
import type { Board } from "@/lib/board-layout";

/**
 * The board on phones. The same zones, projects and declared links, as a
 * top-to-bottom list in the board's handwriting — a 1600-wide diagram scaled
 * down to a phone would be unreadable.
 */
export function BoardFlow({ board }: { board: Board }) {
  const title = (slug: string) => board.nodes.find((n) => n.slug === slug)?.title ?? slug;

  return (
    <div className="space-y-8" style={{ fontFamily: "var(--font-hand)" }}>
      {board.zones.map((zone) => (
        <section key={zone.name}>
          <h3 className="text-[22px]" style={{ color: zone.color }}>{zone.name}</h3>
          <div className="mt-3 space-y-3">
            {board.nodes
              .filter((n) => n.zone === zone.name)
              .map((n) => {
                const uses = board.edges.filter((e) => e.kind === "uses" && e.to === n.slug);
                const same = board.edges.filter(
                  (e) => e.kind === "same" && (e.from === n.slug || e.to === n.slug),
                );
                return (
                  <div key={n.slug}>
                    <Link
                      href={n.href}
                      className="block rounded-[14px_18px_12px_16px] border-[3px] border-[color:var(--wb-ink)] px-4 py-3 text-[color:var(--wb-ink)]"
                      style={{ borderLeftColor: zone.color }}
                    >
                      <span className="block text-[25px] leading-tight font-bold">{n.title}</span>
                      <span className="mt-1 block text-[17px] text-[color:var(--wb-muted)]">
                        {n.parts.map((p) => p.label).join(n.flow ? " → " : " · ")}
                      </span>
                      {n.note ? (
                        <span className="mt-1 block text-[17px] text-[color:var(--wb-red)]">{n.note}</span>
                      ) : null}
                    </Link>
                    {uses.map((e) => (
                      <p key={e.id} className="mt-1 ml-5 border-l-[3px] border-dashed border-[color:var(--wb-green)] py-1 pl-3 text-[17px] text-[color:var(--wb-green)]">
                        {title(e.from)} {e.label} ↑
                      </p>
                    ))}
                    {same.map((e) => (
                      <p key={e.id} className="mt-1 ml-5 py-1 pl-3 text-[17px] text-[color:var(--wb-ink)]">
                        - - {e.label} (with {title(e.from === n.slug ? e.to : e.from)})
                      </p>
                    ))}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
