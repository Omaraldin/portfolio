import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

/**
 * Overrides for elements markdown produces.
 *
 * The point is that an author writes plain markdown — `![alt](/path)` and
 * `[text](/link)` — and still gets optimised images and client-side navigation
 * without having to reach for components.
 */
/*
  A margin note on the whiteboard: a coloured edge and a handwritten label,
  the colour saying what kind of note it is.
*/
const CALLOUTS = {
  info: { label: "note", color: "var(--wb-blue)" },
  warning: { label: "careful", color: "#b7791f" },
  success: { label: "it worked", color: "var(--wb-green)" },
  danger: { label: "watch out", color: "var(--wb-red)" },
} as const;

/**
 * An aside set apart from the running text. Used in MDX as
 * `<Callout type="warning">…</Callout>`.
 */
function Callout({
  type = "info",
  children,
}: {
  type?: keyof typeof CALLOUTS;
  children?: React.ReactNode;
}) {
  const { label, color } = CALLOUTS[type] ?? CALLOUTS.info;
  return (
    <aside
      className="surface my-8 border-l-[4px] px-6 py-5 text-[17px]"
      style={{ borderLeftColor: color }}
    >
      <p className="text-[21px] leading-none" style={{ fontFamily: "var(--font-hand)" }}>
        <span style={{ color }}>{label}</span>
      </p>
      <div className="mt-3 space-y-3">{children}</div>
    </aside>
  );
}

export const mdxComponents: MDXComponents = {
  Callout,

  img: (props) => {
    const { src, alt, title } = props as {
      src?: string;
      alt?: string;
      title?: string;
    };

    if (typeof src !== "string" || !src) return null;

    // Remote images would need an explicit host allowlist in next.config, so
    // they fall through to a plain tag rather than failing the build.
    if (!src.startsWith("/")) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt ?? ""} title={title} loading="lazy" />;
    }

    /*
      Built from spans rather than <figure>/<figcaption>.

      Markdown wraps a standalone image in a paragraph, and neither of those
      elements may legally sit inside a <p> — the browser closes the paragraph
      early, the server and client trees diverge, and hydration fails. Spans set
      to display:block give the same layout and nest anywhere.
    */
    return (
      <span className="my-8 block">
        <Image
          src={src}
          alt={alt ?? ""}
          width={1600}
          height={900}
          sizes="(min-width: 768px) 68ch, 100vw"
          // The intrinsic size above is a ceiling; height:auto lets the real
          // aspect ratio win so tall images are not letterboxed.
          className="surface h-auto w-full"
        />
        {/*
          Markdown's title attribute — the quoted string after the URL — is the
          natural place for a caption, since alt text is for description.
        */}
        {title ? (
          <span className="mt-3 block text-center text-[14px] text-ink-muted">
            {title}
          </span>
        ) : null}
      </span>
    );
  },

  a: (props) => {
    const { href, children } = props as {
      href?: string;
      children?: React.ReactNode;
    };

    if (typeof href !== "string") return <>{children}</>;

    // Internal links route client-side; external ones open away and carry the
    // usual rel guard.
    if (href.startsWith("/")) {
      return <Link href={href}>{children}</Link>;
    }

    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  },
};
