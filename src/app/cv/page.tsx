import { notFound, redirect } from "next/navigation";
import { cvs } from "@/content/cvs";

/** The CV always renders under a handle; the first one is the default view. */
export default function CVPage() {
  const first = cvs[0];
  if (!first) notFound();

  redirect(`/cv/${first.handle}`);
}
