import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { WorkIndex } from "@/components/work-index";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Projects across embedded, web, mobile, desktop, backend, and automation.",
};

export default function WorkPage() {
  return (
    <>
      <PageTitle
        index="work"
        title="Things I've built"
        intro="Filter by where the work happened, or by what it required. The second axis is usually the more useful one."
      />
      <WorkIndex projects={projects} />
    </>
  );
}
