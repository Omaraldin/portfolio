import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEnabled } from "@/lib/admin-guard";

export const metadata = {
  title: "Admin",
  // The panel must never be indexed even if it somehow becomes reachable.
  robots: { index: false, follow: false },
};

const adminNav = [
  { label: "Overview", href: "/admin" },
  { label: "Work", href: "/admin/work" },
  { label: "Writing", href: "/admin/writing" },
  { label: "Certifications", href: "/admin/certifications" },
  { label: "CV", href: "/admin/cv" },
  { label: "About", href: "/admin/about" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rendering nothing in production is the visible half of the guard; the
  // route handlers throw independently, so neither relies on the other.
  if (!adminEnabled) notFound();

  return (
    <div className="pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule-strong pb-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Admin</h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
            Local only · writes to files in this repo
          </p>
        </div>
        <Link
          href="/"
          className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-accent"
        >
          View site →
        </Link>
      </div>

      <nav className="flex flex-wrap gap-1.5 py-4">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[3px] border border-rule px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
