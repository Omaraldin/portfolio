import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CV } from "@/content/cv-types";
import { visibleSections } from "@/content/cvs";
import { site } from "@/content/site";
import { resolveSection, type ResolvedSection } from "@/lib/cv-content";

/**
 * The PDF is built for machines first.
 *
 * It uses a built-in font so the text is real and selectable rather than
 * outlined, a single column so extraction preserves reading order, conventional
 * uppercase headings, and literal "• " prefixes instead of list styling — an
 * ATS reads the text run, and a bullet that only exists as layout disappears.
 */
/*
  Tuned to fit a single page. A recruiter spends seconds on the first pass, and
  for someone early in their career a second page reads as padding rather than
  substance — so the spacing is tight enough that a CV only overflows when there
  is genuinely more material than fits.
*/
const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
    fontSize: 8.8,
    lineHeight: 1.3,
    color: "#111111",
  },
  /*
    The name needs air beneath it: set solid against the role line it reads as
    one crowded block rather than as a heading with a subtitle.
  */
  name: { fontSize: 17, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  role: { fontSize: 10, color: "#333333", marginBottom: 7 },
  contact: { fontSize: 8.5, color: "#333333", marginBottom: 7 },
  summary: { marginBottom: 2 },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: "#999999",
    marginTop: 4,
    marginBottom: 6,
  },
  heading: {
    fontSize: 9.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginTop: 7,
    marginBottom: 2.5,
  },
  headingRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#bbbbbb",
    marginBottom: 4,
  },
  entry: { marginBottom: 5 },
  entryTitle: { fontFamily: "Helvetica-Bold" },
  entryMeta: { color: "#444444" },
  entryDetail: { marginTop: 1 },
  bullet: { marginTop: 1, paddingLeft: 9 },
  skillRow: { flexDirection: "row", marginBottom: 1.5 },
  skillLabel: { fontFamily: "Helvetica-Bold", width: 88 },
  skillValue: { flex: 1 },
  paragraph: { marginBottom: 3 },
});

function Section({ section }: { section: ResolvedSection }) {
  return (
    /*
      Sections may break across pages; individual entries may not. Forcing a
      whole section to stay together pushes it wholesale onto a second page and
      leaves the first half empty.
    */
    <View>
      <Text style={styles.heading}>{section.heading}</Text>
      <View style={styles.headingRule} />

      {section.kind === "definitions"
        ? section.items.map((item) => (
            <View key={item.label} style={styles.skillRow}>
              <Text style={styles.skillLabel}>{item.label}</Text>
              <Text style={styles.skillValue}>{item.value}</Text>
            </View>
          ))
        : null}

      {section.kind === "prose"
        ? section.blocks.map((block, i) =>
            block.type === "paragraph" ? (
              <Text key={i} style={styles.paragraph}>
                {block.text}
              </Text>
            ) : (
              <View key={i}>
                {block.items.map((item) => (
                  <Text key={item} style={styles.bullet}>
                    {`• ${item}`}
                  </Text>
                ))}
              </View>
            ),
          )
        : null}

      {section.kind === "entries"
        ? section.entries.map((entry, i) => (
            <View key={`${entry.title}-${i}`} style={styles.entry} wrap={false}>
              {/*
                Title, employer, and dates share one line. They stay adjacent in
                the extracted text, which is what keeps a parser attaching the
                right dates to the right role, and it saves a line per entry.
              */}
              <Text>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.org ? <Text>{` — ${entry.org}`}</Text> : null}
                {entry.timeline ? (
                  <Text style={styles.entryMeta}>{`  |  ${entry.timeline}`}</Text>
                ) : null}
              </Text>

              {entry.detail ? (
                <Text style={styles.entryDetail}>{entry.detail}</Text>
              ) : null}

              {entry.bullets.map((bullet) => (
                <Text key={bullet} style={styles.bullet}>
                  {`• ${bullet}`}
                </Text>
              ))}
            </View>
          ))
        : null}
    </View>
  );
}

function CVPdf({ cv }: { cv: CV }) {
  const sections = visibleSections(cv)
    .map((section) => resolveSection(section, { ats: true }))
    .filter((s): s is ResolvedSection => s !== null);

  // Phone and email lead: those are the fields an applicant tracking system
  // pulls out, and the ones a recruiter acts on.
  const contact = [
    site.phone,
    site.email,
    site.location,
    ...site.socials.map((s) => s.href),
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <Document
      title={`${site.name} — ${cv.title}`}
      author={site.name}
      subject={cv.title}
      // Keywords give a parser a second chance at the skills it may have missed
      // in the body text.
      keywords={sections
        .filter((s) => s.kind === "definitions")
        .flatMap((s) => (s.kind === "definitions" ? s.items : []))
        .map((i) => i.value)
        .join(", ")}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{site.name}</Text>
        <Text style={styles.role}>{cv.title}</Text>
        <Text style={styles.contact}>{contact}</Text>

        {cv.summary ? <Text style={styles.summary}>{cv.summary}</Text> : null}

        <View style={styles.rule} />

        {sections.map((section, i) => (
          <Section key={`${section.heading}-${i}`} section={section} />
        ))}
      </Page>
    </Document>
  );
}

/** Renders a CV to PDF bytes. */
export function renderCVPdf(cv: CV): Promise<Buffer> {
  return renderToBuffer(<CVPdf cv={cv} />);
}
