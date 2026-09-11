import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Cormorant_Garamond,
  JetBrains_Mono,
  Mrs_Saint_Delafield,
} from "next/font/google";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

/*
  Variable names deliberately differ from Tailwind's own --font-sans/--font-mono
  theme tokens. Pointing a token at a variable of the same name makes it
  self-referential, which CSS resolves to an empty value.
*/
const grotesque = Archivo({
  variable: "--font-grotesque",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

/*
  The signature face, used for the wordmark and nothing else. Single weight —
  the family has no others, and a script that close to handwriting would not
  survive a synthesised bold.
*/
const script = Mrs_Saint_Delafield({
  variable: "--font-script-face",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/*
  Section headings and page titles. A high-contrast garamond set lowercase
  reads as considered rather than as a default, and its low x-height keeps the
  headings from shouting over the mono labels beneath them.
*/
const serif = Cormorant_Garamond({
  variable: "--font-serif-face",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

/*
  The site has a single dark theme, so the browser is told outright — this is
  what keeps native scrollbars, form controls, and the address bar from
  rendering light against it.
*/
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a08",
};

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
      className={`${grotesque.variable} ${mono.variable} ${script.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-32 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
