import type { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/** The options bag MDXRemote accepts; the package exports no name for it. */
type MDXOptions = NonNullable<Parameters<typeof MDXRemote>[0]["options"]>;

/**
 * The MDX pipeline, shared by the published article pages and the admin
 * preview. Keeping one definition is what makes the preview trustworthy — a
 * second config would drift and quietly stop matching what ships.
 */
export const mdxOptions: MDXOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          // Both themes are emitted; CSS picks one via the theme attribute, so
          // highlighting follows the page.
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
        },
      ],
    ],
  },
};
