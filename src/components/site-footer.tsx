import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-rule">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-[11px] tracking-[0.1em] text-ink-muted lowercase transition-colors hover:text-accent"
          >
            {site.email}
          </a>
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] text-ink-muted lowercase transition-colors hover:text-accent"
            >
              {social.label}
            </a>
          ))}
        </div>

        <p className="font-mono text-[11px] tracking-[0.1em] text-ink-faint lowercase">
          {site.location}
        </p>
      </div>
    </footer>
  );
}
