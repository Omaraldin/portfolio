import Image from "next/image";
import type { ProjectMedia } from "@/content/types";

/**
 * Screenshots and diagrams for a project.
 *
 * A single image runs full width; two or more fall into a two-column grid.
 * Sizing from the stored intrinsic dimensions rather than a fixed aspect ratio
 * keeps a tall mobile screenshot and a wide architecture diagram both intact —
 * cropping either to a common shape would lose the part that matters.
 */
export function ProjectMediaGallery({ media }: { media: ProjectMedia[] }) {
  if (!media.length) return null;

  const single = media.length === 1;

  return (
    <div className={single ? "" : "grid gap-6 sm:grid-cols-2"}>
      {media.map((item) => (
        <figure key={item.src} className={single ? "" : "min-w-0"}>
          <div className="surface overflow-hidden">
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes={
                single
                  ? "(min-width: 1024px) 768px, 100vw"
                  : "(min-width: 640px) 50vw, 100vw"
              }
              className="h-auto w-full"
            />
          </div>
          {item.caption ? (
            <figcaption className="mt-2 text-[14px] text-ink-muted">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
