import { Chibi } from "@/components/chibi";
import { PillLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center py-20 text-center">
      <Chibi className="h-56" sizes="180px" priority />
      <p className="mt-8 font-mono text-[13px] font-bold text-accent">
        {"// 404: route not found"}
      </p>
      <h1 className="mt-3 font-display text-[44px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[64px]">
        This page wandered off.
      </h1>
      <p className="mt-4 max-w-md text-[18px] leading-relaxed text-ink-muted">
        The link may be old, or the page never existed. Either way, the good
        stuff is this way.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <PillLink href="/">Take me home</PillLink>
        <PillLink href="/writing" variant="outline">
          Read the blog
        </PillLink>
      </div>
    </section>
  );
}
