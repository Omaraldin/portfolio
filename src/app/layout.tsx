import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChibiDock } from "@/components/chibi-dock";
import "./globals.css";

/*
  Variable names deliberately differ from Tailwind's own --font-sans/--font-mono
  theme tokens. Pointing a token at a variable of the same name makes it
  self-referential, which CSS resolves to an empty value.
*/

/*
  Headlines. A grotesque with a lot of personality at heavy weights — chunky and
  friendly at display sizes, which is the whole ManyChat register.
*/
const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});

/* Body. Round and open, so long articles stay easy on the eye. */
const body = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

/* Labels, tags, dates, code — the engineer's voice in the design. */
const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e4" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1612" },
  ],
};

/*
  Runs before first paint. A stored choice wins; otherwise the system
  preference. Inline and synchronous on purpose — anything later flashes the
  wrong theme.
*/
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.thesis,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.thesis,
    url: site.url,
    images: [{ url: site.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.thesis,
    images: [site.ogImage],
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/rss.xml` },
  },
  robots: {
    index: true,
    follow: true,
    // Lets search engines show a full-length description and a large preview
    // rather than truncating both to their defaults.
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/*
  Typed structurally rather than with `LayoutProps<"/">`. That helper asserts
  this is the only layout in the app, which stops being true whenever the
  development-only admin layout is present, and the generated route validator
  then fails to type check.
*/
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-24 sm:px-6">
          {children}
        </main>
        <ChibiDock />
        <SiteFooter />
      </body>
    </html>
  );
}
