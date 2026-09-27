/**
 * The reaction set, shared by the API and the reaction bar. Kept apart from the
 * storage code so the browser bundle never pulls in anything server-only.
 *
 * The set is fixed: the API refuses anything not listed, so the store can never
 * fill with arbitrary keys.
 */
export const REACTIONS = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "mindblown", emoji: "🤯", label: "Mind blown" },
  { key: "clap", emoji: "👏", label: "Applause" },
] as const;

export type ReactionKey = (typeof REACTIONS)[number]["key"];

export function isReactionKey(value: unknown): value is ReactionKey {
  return REACTIONS.some((r) => r.key === value);
}
