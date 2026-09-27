/*
  Twemoji, not the system font. System emoji look different on every platform
  (and flat-out missing on some), which fights a design built on consistent
  stickers. Twemoji renders the same everywhere and matches the outlined,
  flat-colour look of the rest of the site.

  Served from jsDelivr, pinned to one release so an upstream redesign can
  never change the site under us.
*/
const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg";

/**
 * Twemoji's file name for an emoji: its code points in hex, joined by dashes.
 * The U+FE0F variation selector is dropped unless the sequence contains a
 * zero-width joiner — that is Twemoji's own naming rule.
 */
function twemojiName(char: string): string {
  const keepVariation = char.includes("‍");
  return Array.from(char)
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => keepVariation || cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join("-");
}

/**
 * One emoji as a Twemoji image, sized to the surrounding text (1em) and sitting
 * on its baseline like a glyph would.
 *
 * Decorative by default. Pass `label` when the emoji carries meaning on its
 * own; it then becomes the image's alt text.
 */
export function Emoji({
  char,
  label,
  className = "",
}: {
  char: string;
  label?: string;
  className?: string;
}) {
  return (
    // A plain <img>: these are tiny static SVGs, so next/image would add a
    // remote-host allowlist and a resize pass for nothing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${TWEMOJI_BASE}/${twemojiName(char)}.svg`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={`inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] select-none ${className}`}
    />
  );
}

/*
  An emoji is either a character that presents as emoji by default, or any
  pictograph followed by U+FE0F — joined by ZWJs into sequences. Deliberately
  narrower than "anything pictographic": text-style symbols such as ↗ and ✦
  stay text.
*/
const EMOJI =
  /((?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)(?:\p{Emoji_Modifier}|‍(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️?))*)/u;

/**
 * Renders a string with every emoji in it swapped for Twemoji. For places that
 * take a plain string, such as an empty-state message.
 */
export function EmojiText({ children }: { children: string }) {
  const parts = children.split(EMOJI);
  return (
    <>
      {parts.map((part, i) =>
        // split() with a capture group puts matches at odd indexes.
        i % 2 === 1 ? <Emoji key={i} char={part} /> : part,
      )}
    </>
  );
}
