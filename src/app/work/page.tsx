import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { projects } from "@/content/projects";
import { WorkList } from "@/components/work-list";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: "Work",
  description:
    "Systems I've designed and shipped: platforms, libraries, tools and devices.",
});

export default function WorkPage() {
  return (
    <>
      <PageTitle
        index="work"
        title="Things I've built"
        intro="Systems I've designed and shipped, grouped the way they sit on my board."
      />
      <WorkList projects={projects} />
    </>
  );
}
