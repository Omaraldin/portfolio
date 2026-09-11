export const site = {
  name: "Omar El-Khashab",
  /*
    The domain, and what the wordmark flips to on hover. Kept separate from
    `name` so the two never drift apart.
  */
  handle: "omaraldin",
  role: "Software Engineer",
  /** The thesis. Everything on the site is arguing this. */
  thesis:
    "I design the system before I choose the stack. That is the part that transfers.",
  location: "New Cairo, Egypt",
  email: "baytreeeg99@gmail.com",
  /*
    TODO: replace with the real number.

    Written in full international form because that is what a parser stores and
    what an overseas recruiter can dial without editing. It appears on the CV
    and its PDF only — publishing a personal number on every page of a public
    site invites scrapers.
  */
  phone: "+20 100 000 0000",
  url: "https://omaraldin.dev",
  /*
    The card a shared link previews with when the page has no image of its own.

    TODO: add the file. A 1200x630 PNG or JPG under /public — name, role, and
    the thesis line is enough. Until it exists the tag points at a missing file,
    which degrades to no preview rather than breaking anything.
  */
  ogImage: "/og.png",
  /** Shown as a live value in the identity block. */
  status: "Open to opportunities",
  socials: [
    // TODO: real URLs still needed.
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/in/" },
  ],
} as const;

/**
 * Byline shown at the foot of each article, and the identity search engines are
 * given for the author of the writing.
 */
export const author = {
  name: site.name,
  /** Square. Renders at 56px on the byline and is never used larger. */
  portrait: "/avatar.png",
  /** One line. What gives this person standing to write about this. */
  bio: "Software engineer in New Cairo. I build across embedded, web, mobile, and desktop, and write about what actually transfers between them.",
} as const;

/*
  Set lowercase because the header renders them as written rather than
  transforming them — "cv" is the one that would look wrong uppercased by CSS
  and right here.
*/
export const nav = [
  { label: "home", href: "/" },
  { label: "about", href: "/about" },
  { label: "projects", href: "/work" },
  { label: "blogs", href: "/writing" },
  { label: "certs", href: "/certifications" },
  { label: "cv", href: "/cv" },
] as const;
