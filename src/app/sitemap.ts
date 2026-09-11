import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { cvs } from "@/content/cvs";
import { getArticles } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/work",
    "/writing",
    "/certifications",
    "/cv",
    "/about",
  ].map(
    (route) => ({
      url: `${site.url}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${site.url}/work/${project.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...cvs.map((cv) => ({
      url: `${site.url}/cv/${cv.handle}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getArticles().map((article) => ({
      url: `${site.url}/writing/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
