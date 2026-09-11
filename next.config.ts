import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /*
    The admin panel writes to the filesystem with no authentication, so it must
    never be deployed. Its route files use a `.dev.tsx` extension, which is only
    recognised as a page extension while developing — in a production build the
    admin routes therefore do not exist at all, rather than existing behind a
    runtime check that could be misconfigured.
  */
  pageExtensions: isDev
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],

  /*
    `/cv/<handle>.pdf` is the URL worth handing to a recruiter, but a
    `[handle].pdf` route segment would sit beside `[profile]` at the same level,
    and two dynamic segments there cannot both match. The handler therefore
    lives at `/cv/<handle>/pdf` and this rewrite exposes it at the nicer URL.
  */
  async rewrites() {
    return [
      {
        source: "/cv/:handle.pdf",
        destination: "/cv/:handle/pdf",
      },
    ];
  },
};

export default nextConfig;
