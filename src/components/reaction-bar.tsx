"use client";

import { useEffect, useState } from "react";
import { REACTIONS, type ReactionKey } from "@/lib/reactions-config";
import { Emoji } from "./emoji";

type Counts = Record<ReactionKey, number>;
type State = { counts: Counts; mine: ReactionKey[] };

const storageKey = (slug: string) => `reactions:${slug}`;

/*
  localStorage can throw (private windows, blocked storage), so every access is
  guarded and the feature still works without it — the server's IP check alone
  then decides what counts as "already reacted".
*/
function readLocal(slug: string): ReactionKey[] {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((k): k is ReactionKey => REACTIONS.some((r) => r.key === k))
      : [];
  } catch {
    return [];
  }
}

function writeLocal(slug: string, keys: ReactionKey[]) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(keys));
  } catch {
    // Storage blocked: the server still holds the reaction.
  }
}

/**
 * The reaction row at the end of an article.
 *
 * A reaction counts once per visitor, checked two ways: the server remembers a
 * hashed IP, and this browser remembers in localStorage. Either one marks a
 * reaction as given, so switching networks does not let the same browser
 * react again, and clearing storage does not either while the IP is the same.
 * Clicking a given reaction takes it back.
 */
export function ReactionBar({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [popped, setPopped] = useState<ReactionKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reactions/${slug}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<State>) : Promise.reject()))
      .then((server) => {
        if (cancelled) return;
        const mine = Array.from(new Set([...server.mine, ...readLocal(slug)]));
        writeLocal(slug, mine);
        setState({ counts: server.counts, mine });
      })
      // Not configured or unreachable: the bar simply does not appear.
      .catch(() => !cancelled && setDisabled(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggle = async (key: ReactionKey) => {
    if (!state) return;
    const on = !state.mine.includes(key);

    // Optimistic: the button answers instantly, and the server corrects it.
    const optimistic: State = {
      counts: { ...state.counts, [key]: Math.max(0, state.counts[key] + (on ? 1 : -1)) },
      mine: on ? [...state.mine, key] : state.mine.filter((k) => k !== key),
    };
    setState(optimistic);
    writeLocal(slug, optimistic.mine);
    if (on) setPopped(key);

    try {
      const response = await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: key, on }),
      });
      if (!response.ok) throw new Error();
      const server = (await response.json()) as State;
      /*
        Counts come from the server. "Mine" keeps this browser's own record:
        on a new network the server may not know this visitor, but the browser
        does, and that is the point of checking both.
      */
      setState({ counts: server.counts, mine: optimistic.mine });
    } catch {
      setState(state);
      writeLocal(slug, state.mine);
    }
  };

  if (disabled) return null;

  const total = state
    ? Object.values(state.counts).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <section
      aria-label="Reactions"
      className="no-print mt-16 rounded-[28px] border-2 border-rule bg-paper-raised p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
          Did this land?
        </p>
        <p className="tabular font-mono text-[12px] text-ink-muted">
          {state
            ? `${total} ${total === 1 ? "reaction" : "reactions"}`
            : "loading…"}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {REACTIONS.map((reaction) => {
          const active = state?.mine.includes(reaction.key) ?? false;
          const count = state?.counts[reaction.key] ?? 0;
          return (
            <button
              key={reaction.key}
              type="button"
              onClick={() => toggle(reaction.key)}
              disabled={!state}
              aria-pressed={active}
              aria-label={`${reaction.label}, ${count}`}
              className={`pill inline-flex min-w-[76px] items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-[18px] disabled:opacity-60 ${
                active
                  ? "border-on-pop bg-brand text-on-brand"
                  : "border-rule bg-paper text-ink hover:border-ink"
              }`}
            >
              <span
                onAnimationEnd={() => setPopped(null)}
                className={`inline-flex ${popped === reaction.key ? "animate-wiggle" : ""}`}
              >
                <Emoji char={reaction.emoji} />
              </span>
              <span className="tabular font-mono text-[14px] font-semibold">
                {state ? count : "·"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
