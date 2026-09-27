import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/types";
import { DOMAIN_EMOJI, DOMAIN_LABELS } from "@/content/taxonomy";
import { popFill } from "./ui";
import { Emoji } from "./emoji";

/**
 * A project as a sticker card: a 16:10 cover — the uploaded thumbnail, else the
 * first screenshot, else the domain stickers — then the facts an engineer scans
 * for: domains, stack, and the one number that matters.
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
  const metric = project.metrics[0];
  const wide = size === "wide";
  const big = size !== "md";

  return (
    <Link
      href={`/work/${project.slug}`}
      className={`pop-card group flex h-full overflow-hidden rounded-[28px] bg-paper ${
        wide ? "flex-col lg:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative aspect-[16/10] shrink-0 overflow-hidden border-on-pop text-ink dark:border-rule ${popFill(index)} ${
          wide
            ? "border-b-2 lg:aspect-auto lg:min-h-[360px] lg:w-[58%] lg:border-r-2 lg:border-b-0"
            : size === "lg"
              ? "border-b-2 md:aspect-[21/10]"
              : "border-b-2"
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
            No image: the domains become the art. Each sticker takes its own
            angle so the cluster reads as hand-placed.
          */
          <div aria-hidden className="absolute inset-0">
            <span className="absolute top-4 left-5 font-mono text-[13px] font-semibold opacity-60">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              {project.domains.slice(0, 3).map((domain, i) => (
                <span
                  key={domain}
                  style={{ ["--tilt" as string]: `${[-8, 6, -4][i]}deg` }}
                  className="grid h-16 w-16 rotate-[var(--tilt)] place-items-center rounded-[20px] border-2 border-on-pop bg-white text-[32px] shadow-[4px_4px_0_0_var(--on-pop)] transition-transform duration-300 group-hover:-translate-y-1 sm:h-20 sm:w-20 sm:text-[40px]"
                >
                  <Emoji char={DOMAIN_EMOJI[domain]} />
                </span>
              ))}
            </div>
          </div>
        )}

        {metric ? (
          <span className="absolute bottom-3 left-3 inline-flex items-baseline gap-1.5 rounded-full border-2 border-on-pop bg-white px-3 py-1 text-on-pop">
            <span className="tabular font-display text-[15px] font-extrabold">
              {metric.value}
            </span>
            <span className="font-mono text-[11px]">{metric.label}</span>
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${wide ? "p-7 lg:p-10" : "p-6"}`}>
        <p className="font-mono text-[12px] text-ink-muted">
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
              className="rounded-full bg-paper-raised px-2.5 py-1 font-mono text-[11px] font-medium text-ink"
            >
              {tech}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-[14px] font-semibold text-accent">
            Case study
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
