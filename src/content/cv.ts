/**
 * The records a CV is assembled from. Which of these appear, in what order, is
 * decided per CV in `cvs.ts` rather than here.
 */
export type CVEntry = {
  title: string;
  org: string;
  timeline: string;
  location?: string;
  bullets: string[];
};

export const education: CVEntry[] = [
  {
    title: "B.Sc. Software Engineering",
    org: "New Cairo Technological University",
    timeline: "Graduated 2025",
    location: "New Cairo, Egypt",
    bullets: [],
  },
];

export const experience: CVEntry[] = [
  {
    title: "Freelance Software Engineer",
    org: "Self-employed",
    // TODO: confirm the real start year.
    timeline: "2022 — Present",
    bullets: [
      "Delivered projects across web, mobile, embedded, and automation, owning scope from architecture through deployment.",
      "Took on unfamiliar domains deliberately, treating system design as the transferable skill rather than any single framework.",
    ],
  },
];

export const community: CVEntry[] = [
  {
    title: "Lead, Google Developer Groups on Campus",
    org: "New Cairo Technological University",
    timeline: "2024 — 2025",
    bullets: [
      "Ran the campus chapter: organised technical sessions, coordinated a volunteer team, and grew participation.",
    ],
  },
];

export const awards: CVEntry[] = [
  {
    // TODO: exact award name and year still needed.
    title: "National Scientific Research Award",
    org: "",
    timeline: "—",
    bullets: [],
  },
  {
    // TODO: exact year still needed.
    title: "Ideal Student Award",
    org: "New Cairo Technological University",
    timeline: "—",
    bullets: [],
  },
];

export const skills: Record<string, string[]> = {
  Languages: ["TypeScript", "Dart", "C/C++", "Python", "SQL"],
  Backend: ["NestJS", "Node.js", "REST", "WebSockets", "Queues"],
  Frontend: ["Next.js", "React", "Vue", "Tailwind CSS"],
  Mobile: ["Flutter"],
  Desktop: ["Electron"],
  Embedded: ["ESP32", "Arduino", "Sensors", "Electronics"],
  Protocols: ["MQTT", "HTTP", "Serial", "BLE"],
  Databases: ["PostgreSQL", "Redis", "SQLite"],
  Infrastructure: ["Docker", "CI/CD", "Linux"],
  Tools: ["Git", "Playwright", "Figma"],
};
