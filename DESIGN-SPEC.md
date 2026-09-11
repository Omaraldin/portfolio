# Design specification — "Technical Specification"

Direction A, approved. This document is the contract for the build. No code is
written until it is approved.

The site reads like a datasheet for an engineer: labelled fields, revision
numbers, precise measurements, hairline rules. Not terminal cosplay — the
*document* kind of technical, the kind that ships with hardware.

The organising idea is also the argument. Omar's problem is that breadth reads
as scatter; a spec sheet presents range as an engineered, indexed system. A
recruiter sees the work organised, not merely listed.

---

## 1. Foundations

### 1.1 Colour

Two full themes. Light is the default and the primary design target; dark is a
true inversion, not a dimmed copy. Both are warm — no pure white, no pure black.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#F4F1EA` | `#12120F` | Page ground |
| `--paper-raised` | `#EFEBE2` | `#1A1A16` | Cards, table stripes, inset blocks |
| `--ink` | `#16150F` | `#EDEAE0` | Body text, headings |
| `--ink-muted` | `#6B6659` | `#9B958A` | Labels, metadata, captions |
| `--ink-faint` | `#A39C8C` | `#66625A` | Disabled, placeholder |
| `--rule` | `#D8D2C4` | `#2C2B25` | Hairlines, borders, grid |
| `--rule-strong` | `#16150F` | `#EDEAE0` | Section dividers (full ink) |
| `--accent` | `#4D5F26` | `#9AB55C` | Live values, links, active state |
| `--accent-quiet` | `#E4E3D5` | `#262A18` | Accent fills, highlight rows |

Accent is olive green. Every ground sits at hue ~42°, a warm amber-beige, so a
true green near 150° reads as a foreign element dropped onto the page; olive at
~79° belongs to the same family while still reading as green. It appears only
on: links, the active CV profile, hover underlines, "currently available" style
live values, and focus rings. Never as decoration, never as a large fill. The
dark-mode accent is lightened to hold contrast against the dark ground.

Contrast targets: body text ≥ 7:1 in both themes; muted text ≥ 4.5:1; accent on
paper ≥ 4.5:1.

### 1.2 The grid

A blueprint grid is faintly but permanently visible — the single strongest
signal that this is a technical document.

- 8px base unit. All spacing is a multiple.
- Background grid: 1px lines in `--rule` at 10% opacity, 64px squares.
- Content grid: 12 columns, 24px gutters, max width 1240px, 24px page margins
  (16px on mobile).
- The grid is drawn as a fixed background layer, so it does not scroll with
  content and reads as the page's substrate.

### 1.3 Type

Two families only.

- **Display / body**: a grotesque with a technical cast — Archivo, with Inter
  Tight as the fallback candidate. Tight tracking at large sizes.
- **Mono**: JetBrains Mono. Every label, number, unit, tag, timestamp, and
  metadata line. This is what makes the spec-sheet reading work.

| Role | Size / line-height | Family | Treatment |
| --- | --- | --- | --- |
| Display | 72 / 0.95 (mobile 44) | Grotesque | 700, tracking −0.03em |
| H1 page title | 44 / 1.05 | Grotesque | 700, tracking −0.02em |
| H2 section | 28 / 1.15 | Grotesque | 600, tracking −0.01em |
| H3 | 20 / 1.3 | Grotesque | 600 |
| Body | 17 / 1.65 | Grotesque | 400 |
| Body small | 15 / 1.6 | Grotesque | 400 |
| Field label | 11 / 1.2 | Mono | 500, uppercase, tracking 0.12em, muted |
| Metadata | 13 / 1.5 | Mono | 400, muted |
| Numeral | 13 / 1 | Mono | 500, tabular figures |

Tabular figures everywhere numbers align in columns.

### 1.4 Section headers

Every major section is headed like a numbered spec field:

```
── 02 ─────────────────────────────────────────────  CAPABILITIES ──
```

Implementation: a flex row — mono index number, a hairline rule that flexes to
fill, then the mono uppercase title. Full-width, `--rule` coloured, 1px.

### 1.5 Motion

Restrained by decision. The reference sites that used spectacle were explicitly
rejected. Everything respects `prefers-reduced-motion` by collapsing to instant.

| Element | Behaviour | Duration |
| --- | --- | --- |
| Section entry | Fade + 12px rise, staggered 60ms | 500ms, ease-out-quart |
| Work row hover | Underline wipes left→right, metadata shifts 4px | 240ms |
| Numerals | Count up once when scrolled into view | 900ms |
| CV profile switch | Cross-fade + 8px rise on changed blocks | 320ms |
| Matrix cell hover | Cell and its row/column labels take accent | 160ms |
| Theme toggle | Instant. No transition — a flashing page is worse. | — |
| Page navigation | No custom transition. Native, fast. | — |

No scroll-jacking. No parallax. No custom cursor. No entrance animation on
anything above the fold except a single fade, so first paint is immediate.

---

## 2. Components

- **SpecHeader** — the numbered rule-and-title section header.
- **FieldRow** — mono label on the left, value on the right, hairline beneath.
  The atom of the whole design.
- **WorkRow** — numbered project row: index, title, year, domain tags, one-line
  summary. Expands or links to detail.
- **CapabilityMatrix** — the centrepiece. See §3.1.
- **TagChip** — mono, uppercase, hairline border, 4px radius. Domain and
  capability tags.
- **ProfileSwitch** — segmented control for the CV role selector.
- **ArticleRow** — date, title, reading time, tags.
- **StatBlock** — large numeral + mono caption, tabular.
- **ThemeToggle** — sun/moon, in the header.
- **Prose** — article body styles.

---

## 3. Pages

### 3.1 Home `/`

1. **Header bar** — name left; `WORK · WRITING · CV · ABOUT` right; theme
   toggle. Sticky, hairline bottom border, paper background.

2. **Identity block** — no portrait. Display type:
   ```
   OMAR ALDIN
   SOFTWARE ENGINEER
   ```
   Beneath, a `FieldRow` stack reading as a spec sheet header:
   ```
   LOCATION      New Cairo, Egypt
   FOCUS         Systems design · data flow
   DOMAINS       Embedded · Web · Mobile · Desktop · Backend
   STATUS        Open to opportunities        ← accent
   ```
   One line of prose carries the thesis: design the system before choosing the
   stack.

3. **`01 / CAPABILITY MATRIX`** — the argument, made visually. Capabilities as
   rows, domains as columns. A filled cell means shipped work at that
   intersection; hovering a cell surfaces which project, and highlights its row
   and column labels in accent.

   This is the anti-generalist device: it shows range *and* that the range is
   structured. A list of ten technologies reads as scatter; a matrix reads as
   coverage.

4. **`02 / SELECTED WORK`** — 3–4 `WorkRow`s, then a link to the full index.

5. **`03 / WRITING`** — 2–3 `ArticleRow`s, then a link.

6. **`04 / CV`** — a short callout: pick the role, get the CV built for it.

7. **Footer** — email, GitHub, LinkedIn, last-updated timestamp in mono.

### 3.2 Work `/work`

Full index. Filter bar of domain and capability chips; rows reflow when
filtered. Rows are numbered and carry title, year, role, domains, stack.

### 3.3 Project `/work/[slug]`

Reads as a datasheet for one project.

- Title, then a `FieldRow` block: role, timeline, domains, capabilities, stack,
  links.
- **Problem → Approach → Outcome** as three prose sections.
- **Metrics** as `StatBlock`s where real numbers exist.
- Prev/next project navigation.

### 3.4 CV `/cv` and `/cv/[profile]`

The feature that answers "will he be satisfied in this role?"

- `ProfileSwitch` across the top: `GENERAL · BACKEND · MOBILE · EMBEDDED ·
  FULLSTACK`. Switching is a client-side transition, not a page load — the
  document visibly rebuilds itself for the selected role.
- Below: summary written per profile, experience, projects ordered by that
  profile's domain priority, skills grouped per profile, education, community,
  awards.
- Print stylesheet renders a clean A4 CV with no grid, no accent, no navigation.
- Each profile is its own URL, so a specific CV can be sent directly.

### 3.5 Writing `/writing` and `/writing/[slug]`

- Index: `ArticleRow`s, newest first, tag filter.
- Article: measured column (~68ch), mono metadata header, syntax-highlighted
  code, footnotes. Cross-references to related projects where relevant.

### 3.6 About `/about`

Longer prose: the path from age ten to now, why the breadth is deliberate, the
community and award record. Reads as the narrative counterpart to the matrix.

---

## 4. Technical

- Next.js App Router, TypeScript, Tailwind v4.
- Content as typed TS modules; articles as MDX.
- Theme: class on `<html>`, `localStorage`, no-flash inline script, respects
  system preference until the user chooses.
- Motion: CSS transitions and small IntersectionObserver reveals. A motion
  library only if the CV switch needs it.
- Static generation throughout. RSS and sitemap.
- Targets: Lighthouse ≥ 95 across the board, no layout shift, keyboard
  navigable, visible focus rings in accent.

---

## 5. Open content questions

Design does not block on these, but the site cannot ship without them.

- GitHub and LinkedIn URLs
- Award exact names and years
- Freelance history: since when, rough count
- Per-profile CV summaries — written by Omar, not generated
- Projects: problem, stack, what shipped, links, numbers. See below on how many.

### 5.1 How many projects

There is no target count. What matters is **coverage, not volume**.

The matrix only makes its argument if the domains and capabilities it claims
have real work behind them. An empty row is worse than an absent one: it reads
as a claim Omar cannot back. So the rule is that every axis shown must be
earned, and any that is not gets dropped from the axes entirely.

Volume is handled by hierarchy rather than by cutting:

- **Home** — the 4–5 that best demonstrate spread across domains. Chosen for
  range, not recency.
- **`/work`** — everything real and worth showing. If that is fifteen projects,
  it is fifteen; breadth is the thesis, and the filter bar makes a long index
  navigable.
- **Matrix** — driven by whatever the full set actually covers.
