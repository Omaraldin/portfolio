/**
 * The two axes the site is organised around.
 *
 * Domains are *where* work happened; capabilities are *what the work required*.
 * Keeping them separate is the whole argument of the site: a list of ten
 * technologies reads as scatter, but a capability that recurs across four
 * domains reads as depth.
 *
 * Both axes are declared here, but the matrix on the home page only renders the
 * ones that real projects actually cover — an unearned row is worse than an
 * absent one.
 */

export const DOMAINS = [
  "embedded",
  "web",
  "mobile",
  "desktop",
  "backend",
  "automation",
  "games",
  "security",
  "ecommerce",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const DOMAIN_LABELS: Record<Domain, string> = {
  embedded: "Embedded / IoT",
  web: "Web",
  mobile: "Mobile",
  desktop: "Desktop",
  backend: "Backend",
  automation: "Automation",
  games: "Games",
  security: "Security",
  ecommerce: "E-commerce",
};

/** Short forms for the matrix column headers, where space is tight. */
export const DOMAIN_SHORT: Record<Domain, string> = {
  embedded: "EMB",
  web: "WEB",
  mobile: "MOB",
  desktop: "DSK",
  backend: "BE",
  automation: "AUT",
  games: "GAM",
  security: "SEC",
  ecommerce: "ECM",
};

export const CAPABILITIES = [
  "system-design",
  "data-flow",
  "realtime",
  "performance",
  "reverse-engineering",
  "data-pipelines",
  "hardware-integration",
  "api-design",
  "ui-engineering",
  "devops",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const CAPABILITY_LABELS: Record<Capability, string> = {
  "system-design": "System design",
  "data-flow": "Data flow",
  realtime: "Realtime systems",
  performance: "Performance",
  "reverse-engineering": "Reverse engineering",
  "data-pipelines": "Data pipelines",
  "hardware-integration": "Hardware integration",
  "api-design": "API design",
  "ui-engineering": "UI engineering",
  devops: "DevOps",
};

/** A sticker per domain, for cards and chips. Decoration only — never the label. */
export const DOMAIN_EMOJI: Record<Domain, string> = {
  embedded: "🔌",
  web: "🌐",
  mobile: "📱",
  desktop: "🖥️",
  backend: "🗄️",
  automation: "🤖",
  games: "🎮",
  security: "🔐",
  ecommerce: "🛒",
};
