import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Emoji } from "./emoji";

/**
 * Overrides for elements markdown produces.
 *
 * The point is that an author writes plain markdown — `![alt](/path)` and
 * `[text](/link)` — and still gets optimised images and client-side navigation
 * without having to reach for components.
 */
/*
  Themed tints take ink; the fixed fills (butter, rose) take --on-pop, which is
  dark in both themes.
*/
const CALLOUTS = {
  info: { emoji: "💡", fill: "bg-tint-1 text-ink border-rule" },
  warning: { emoji: "⚠️", fill: "bg-pop-yellow text-on-pop border-on-pop" },
  success: { emoji: "✅", fill: "bg-tint-1 text-ink border-rule" },
  danger: { emoji: "🚨", fill: "bg-pop-rose text-on-pop border-on-pop" },
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
  const { emoji, fill } = CALLOUTS[type] ?? CALLOUTS.info;
  return (
    <aside
      className={`relative my-8 rounded-[22px] border-2 px-6 py-5 text-[17px] [&_a]:text-current [&_code]:bg-white/60 [&_code]:text-on-pop ${fill}`}
    >
      <span
        aria-hidden
        className="absolute -top-4 -left-3 grid h-9 w-9 -rotate-12 place-items-center rounded-full border-2 border-on-pop bg-white text-[18px]"
      >
        <Emoji char={emoji} />
      </span>
      <div className="space-y-3">{children}</div>
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
          className="h-auto w-full rounded-[20px] border-2 border-rule bg-paper-raised"
        />
        {/*
          Markdown's title attribute — the quoted string after the URL — is the
          natural place for a caption, since alt text is for description.
        */}
        {title ? (
          <span className="mt-3 block text-center font-mono text-[12px] text-ink-muted">
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
