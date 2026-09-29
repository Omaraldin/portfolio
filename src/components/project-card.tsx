import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/types";
import { DOMAIN_LABELS } from "@/content/taxonomy";
import { sketchOf } from "@/lib/board-layout";
import { PartsSketch } from "./board/parts-sketch";

/**
 * A project as a card: a 16:10 cover — the uploaded thumbnail, else the first
 * screenshot, else the project's own system sketch — then the facts an
 * engineer scans for: domains, stack, and the one number that matters.
 *
 * `lg` is the bento lead on the home page; `wide` lays cover and text side by
 * side on large screens, for the spotlight slot at the top of the work index.
 */
export function ProjectCard({
  project,
  index,
  size = "md",
}: {
  project: Project;
  index: number;
  size?: "md" | "lg" | "wide";
}) {
  const cover = project.thumbnail ?? project.media[0];
  const sketch = sketchOf(project);
  const metric = project.metrics[0];
  const wide = size === "wide";
  const big = size !== "md";

  return (
    <Link
      href={`/work/${project.slug}`}
      className={`card group flex h-full overflow-hidden ${
        wide ? "flex-col lg:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative aspect-[16/10] shrink-0 overflow-hidden border-rule text-ink ${cover ? "bg-paper-raised" : "bg-[color:var(--wb-bg)]"} ${
          wide
            ? "border-b lg:aspect-auto lg:min-h-[360px] lg:w-[58%] lg:border-r lg:border-b-0"
            : size === "lg"
              ? "border-b md:aspect-[21/10]"
              : "border-b"
        }`}
      >
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={
              wide
                ? "(min-width: 1024px) 700px, 100vw"
                : big
                  ? "(min-width: 768px) 66vw, 100vw"
                  : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          /*
            No image: the project's own system sketch, drawn in marker on a
            small whiteboard, the same way the home-page board draws it.
          */
          <div className="absolute inset-0 grid place-items-center pb-6">
            <PartsSketch
              parts={sketch.parts}
              flow={sketch.flow}
              id={project.slug}
              label={`How ${project.title} is built: ${sketch.parts.map((p) => p.label).join(", ")}`}
            />
          </div>
        )}

        {metric ? (
          <span
            className={`absolute bottom-3 left-4 -rotate-2 text-[20px] text-[color:var(--wb-red)] ${
              cover ? "rounded-md bg-[color:var(--wb-bg)] px-2.5 py-0.5" : ""
            }`}
            style={{ fontFamily: "var(--font-hand)" }}
          >
            {metric.value} {metric.label.toLowerCase()}
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${wide ? "p-7 lg:p-10" : "p-6"}`}>
        <p className="text-[14px] text-ink-muted">
          {project.domains.map((d) => DOMAIN_LABELS[d]).join(" · ")} ·{" "}
          <span className="tabular">{project.timeline}</span>
        </p>
        {/* Not lowercased — project titles carry acronyms. */}
        <h3
          className={`mt-2 font-display leading-[1.05] font-extrabold tracking-[-0.03em] ${
            big ? "text-[30px] sm:text-[40px]" : "text-[24px]"
          }`}
        >
          {project.title}
        </h3>
        <p
          className={`mt-2.5 leading-relaxed text-ink-muted ${
            wide ? "text-[18px]" : "text-[16px]"
          }`}
        >
          {project.summary}
        </p>
        {wide ? (
          <p className="mt-4 text-[14px] font-semibold">{project.role}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {project.stack.slice(0, big ? 6 : 4).map((tech) => (
            <span
              key={tech}
              className="chip chip-static"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
