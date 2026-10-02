import type { Metadata } from "next";
import { site } from "@/content/site";

/*
  Every page's metadata goes through here, so the parts that must be per page
  are never inherited by accident.

  Next merges metadata shallowly: a page that sets nothing for `alternates`
  inherits the root layout's, and a page that sets `openGraph` replaces the
  layout's object wholesale. Both caused bugs — every subpage claimed the home
  page as its canonical URL, and a page's own share card silently lost its
  site name and URL. Building the whole set in one place, from the page's own
  path, removes both.
*/

export type ShareImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

/** The size of a generated share card (see app/og). */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * The generated share card for a project or post with no cover of its own:
 * its title on a whiteboard, rendered by app/og/[section]/[slug].
 */
export function generatedImage(
  section: "work" | "writing",
  slug: string,
  title: string,
): ShareImage {
  return { url: `/og/${section}/${slug}`, ...OG_SIZE, alt: title };
}

export const defaultTitle = `${site.name} — ${site.role}`;

/** An absolute URL on this site, for a path like "/work/kayan". */
export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

export function pageMetadata({
  path,
  title,
  description = site.thesis,
  image = site.ogImage,
  openGraph = {},
}: {
  /** The page's own path, e.g. "/work/kayan". Becomes its canonical URL. */
  path: string;
  /** Omitted on the home page, which uses the layout's default title. */
  title?: string;
  description?: string;
  image?: ShareImage;
  /** Extra Open Graph fields, e.g. an article's dates and tags. */
  openGraph?: Record<string, unknown>;
}): Metadata {
  const url = absoluteUrl(path);
  const shareTitle = title ?? defaultTitle;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": `${site.url}/rss.xml` },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      url,
      title: shareTitle,
      description,
      images: [image],
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
