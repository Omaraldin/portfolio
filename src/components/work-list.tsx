import Link from "next/link";
import type { Project } from "@/content/types";
import { DOMAIN_LABELS } from "@/content/taxonomy";
import { markerOf, sketchOf, zoneOf } from "@/lib/board-layout";
import { PartsSketch } from "./board/parts-sketch";
import { MarkerUnderline } from "./ui";

/**
 * The work index, grouped the way the home-page board groups it. Each project
 * is an editorial row: its system sketch on the left — always, so every
 * project is shown the same way — and the facts on the right. Screenshots and
 * logos live on the project page, where they have room.
 */
export function WorkList({ projects }: { projects: Project[] }) {
  // Featured first, then the rest, each keeping its order in the data.
  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  const zones: { name: string; items: Project[] }[] = [];
  for (const project of ordered) {
    const name = zoneOf(project);
    let zone = zones.find((z) => z.name === name);
    if (!zone) zones.push((zone = { name, items: [] }));
    zone.items.push(project);
  }

  return (
    <div className="space-y-16 pt-6">
      {zones.map((zone) => (
        <section key={zone.name} aria-labelledby={`zone-${zone.name}`}>
          {/* Written in the zone's marker, as on the home-page board. */}
          <h2
            id={`zone-${zone.name}`}
            className="inline-block text-[26px]"
            style={{ fontFamily: "var(--font-hand)", color: markerOf(zone.name) }}
          >
            {zone.name}
            <MarkerUnderline className="w-full" color={markerOf(zone.name)} />
          </h2>
          <div className="mt-4 border-b border-rule">
            {zone.items.map((project) => (
              <WorkRow key={project.slug} project={project} color={markerOf(zone.name)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WorkRow({ project, color }: { project: Project; color: string }) {
  const sketch = sketchOf(project);
  const metric = project.metrics[0];
  const note = project.board?.note;

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid gap-6 border-t border-rule py-8 md:grid-cols-[minmax(0,380px)_1fr] md:gap-10"
    >
      {/* The system, drawn the way the board draws it. */}
      <div className="surface relative grid aspect-[16/9] place-items-center transition-colors group-hover:border-accent">
        {/* The zone's corner tick, as on the board's boxes. */}
        <span
          aria-hidden
          className="absolute -right-1.5 -bottom-1.5 h-8 w-8 rounded-br-[10px] border-r-[3px] border-b-[3px]"
          style={{ borderColor: color }}
        />
        <PartsSketch
          parts={sketch.parts}
          flow={sketch.flow}
          id={`work-${project.slug}`}
          label={`How ${project.title} is built: ${sketch.parts.map((p) => p.label).join(", ")}`}
        />
      </div>

      <div className="min-w-0 self-center">
        <p className="text-[14px] text-ink-muted">
          {project.domains.map((d) => DOMAIN_LABELS[d]).join(" · ")} ·{" "}
          <span className="tabular">{project.timeline}</span>
        </p>
        {/* Not lowercased — project titles carry acronyms. */}
        <h3 className="mt-1.5 font-display text-[28px] leading-[1.08] font-extrabold tracking-[-0.03em] decoration-[color:var(--wb-red)] decoration-[3px] underline-offset-[6px] group-hover:underline sm:text-[34px]">
          {project.title}
        </h3>
        <p className="mt-2.5 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {metric ? (
            <p className="text-[20px] text-[color:var(--wb-red)]" style={{ fontFamily: "var(--font-hand)" }}>
              {metric.value} {metric.label.toLowerCase()}
            </p>
          ) : null}
          {note ? (
            <p className="text-[20px] text-ink-muted" style={{ fontFamily: "var(--font-hand)" }}>
              {note}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="chip chip-static font-semibold">{project.role}</span>
          {project.stack.slice(0, 5).map((tech) => (
            <span key={tech} className="chip chip-static text-ink-muted">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
