/**
 * Extracts the text from each generated CV PDF and checks the things an
 * applicant tracking system depends on.
 *
 * This is not a substitute for running a real parser — vendors differ, and only
 * an actual ATS tells you how it fills its fields. It catches the regressions
 * that are cheap to catch: a heading that stopped being recognisable, bullets
 * that collapsed into a paragraph, contact details that went missing.
 *
 *   node scripts/check-cv-pdf.mjs            # against a running dev server
 *   node scripts/check-cv-pdf.mjs http://…   # against any base URL
 */

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const BASE = process.argv[2] ?? "http://localhost:3000";

/** Headings a parser is likely to match on. At least one must be present. */
const EXPECTED_HEADINGS = [
  "WORK EXPERIENCE",
  "PROJECTS",
  "SKILLS",
  "EDUCATION",
  "CERTIFICATIONS",
];

async function extract(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);

  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("application/pdf")) {
    throw new Error(`Expected a PDF, got "${type}"`);
  }

  const data = new Uint8Array(await response.arrayBuffer());
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join("");
  }

  return { text, pages: pdf.numPages };
}

function check(name, passed, detail = "") {
  const mark = passed ? "PASS" : "FAIL";
  console.log(`  ${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
  return passed;
}

const handles = process.env.CV_HANDLES?.split(",") ?? [
  "general",
  "backend",
  "mobile",
  "embedded",
  "fullstack",
];

let failures = 0;

for (const handle of handles) {
  const url = `${BASE}/cv/${handle}.pdf`;
  console.log(`\n${url}`);

  let result;
  try {
    result = await extract(url);
  } catch (error) {
    console.log(`  FAIL  could not read — ${error.message}`);
    failures++;
    continue;
  }

  const { text, pages } = result;
  const found = EXPECTED_HEADINGS.filter((h) => text.includes(h));

  const results = [
    // Text at all: a PDF of images extracts to nothing, which is the single
    // worst outcome — the parser sees an empty document.
    check("text is extractable", text.length > 400, `${text.length} chars`),

    check(
      "recognisable headings",
      found.length >= 3,
      `${found.length}/${EXPECTED_HEADINGS.length}: ${found.join(", ")}`,
    ),

    // Bullets have to exist in the text run, not only as layout.
    check(
      "bullets survive extraction",
      (text.match(/•/g) ?? []).length >= 2,
      `${(text.match(/•/g) ?? []).length} found`,
    ),

    check("email present", /@/.test(text)),

    // Parsers have a dedicated phone field, and a recruiter expects one.
    check("phone present", /\+?\d[\d\s()-]{7,}/.test(text)),

    // One page is the target for someone early in their career; a second page
    // reads as padding. Two is tolerated, more is not.
    check(
      "fits one page",
      pages === 1,
      `${pages} page${pages === 1 ? "" : "s"}${pages > 1 ? " — trim content or hide a section" : ""}`,
    ),

    // Middle dots between skills are a common tokenizer failure.
    check("no middle dots between skills", !text.includes(" · ")),
  ];

  if (results.some((r) => !r)) failures++;
}

console.log(
  failures
    ? `\n${failures} CV${failures === 1 ? "" : "s"} with problems.\n`
    : `\nAll ${handles.length} CVs passed.\n`,
);

process.exit(failures ? 1 : 0);
