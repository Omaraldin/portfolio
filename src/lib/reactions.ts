import { createHash } from "node:crypto";

import {
  REACTIONS,
  isReactionKey,
  type ReactionKey,
} from "./reactions-config";

export { REACTIONS, isReactionKey, type ReactionKey };

export type ReactionCounts = Record<ReactionKey, number>;

export type ReactionState = {
  counts: ReactionCounts;
  /** Reactions this visitor has already given. */
  mine: ReactionKey[];
};

/*
  Storage.

  Production runs on Vercel, where nothing can be written to disk, so counts
  live in Upstash Redis over its REST API — plain fetch, no client library.
  Vercel's Upstash integration injects KV_REST_API_*; a directly created
  database uses UPSTASH_REDIS_REST_*. Either works.

  Keys, per article:
    reactions:<slug>          hash   reaction → count
    reactions:<slug>:by       set    "<reaction>:<visitor>" for every reaction given
    reactions:rl:<visitor>    string write counter for rate limiting

  One set per article, rather than one per reaction, so a page view is two
  commands — HGETALL and a single SMISMEMBER — instead of six. Upstash bills
  per command, so that is what keeps the free tier comfortable.

  With no Redis configured, development falls back to an in-memory store so the
  feature can be tried locally. Production refuses instead: a memory store
  there would reset on every cold start and quietly lose everyone's reactions.
*/

const REDIS_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const isDev = process.env.NODE_ENV === "development";

export function reactionsEnabled(): boolean {
  return Boolean((REDIS_URL && REDIS_TOKEN && process.env.REACTIONS_SALT) || isDev);
}

type Command = (string | number)[];

/** Runs commands in one round trip and returns each result in order. */
async function pipeline(commands: Command[]): Promise<unknown[]> {
  if (REDIS_URL && REDIS_TOKEN) {
    const response = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Redis responded ${response.status}`);
    }
    const results = (await response.json()) as { result?: unknown; error?: string }[];
    return results.map((r) => {
      if (r.error) throw new Error(r.error);
      return r.result;
    });
  }
  if (isDev) return commands.map(memoryCommand);
  throw new Error("Reactions storage is not configured.");
}

/*
  Add and remove are each one Lua script, so "is this visitor new?" and "bump
  the count" happen atomically. Two quick clicks can never count twice, and a
  remove can never take a count below what was given.
*/
const ADD = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
if added == 1 then redis.call('HINCRBY', KEYS[2], ARGV[2], 1) end
return added`;

const REMOVE = `
local removed = redis.call('SREM', KEYS[1], ARGV[1])
if removed == 1 then redis.call('HINCRBY', KEYS[2], ARGV[2], -1) end
return removed`;

/*
  A fixed one-minute window: the first write starts the clock. Done as a script
  rather than EXPIRE … NX, which needs Redis 7 and would fail every write on an
  older server.
*/
const RATE = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return count`;

const countsKey = (slug: string) => `reactions:${slug}`;
const votersKey = (slug: string) => `reactions:${slug}:by`;
const member = (key: ReactionKey, visitor: string) => `${key}:${visitor}`;

/**
 * A visitor's identity for reactions: their IP, salted and hashed. The raw
 * address is never stored. The salt matters — there are only four billion
 * IPv4 addresses, so an unsalted hash could be reversed by trying them all.
 */
export function visitorId(ip: string): string {
  const salt = process.env.REACTIONS_SALT ?? (isDev ? "dev-only-salt" : "");
  if (!salt) throw new Error("REACTIONS_SALT is not set.");
  return createHash("sha256").update(`${salt}:${ip}`).digest("base64url").slice(0, 32);
}

function emptyCounts(): ReactionCounts {
  return Object.fromEntries(REACTIONS.map((r) => [r.key, 0])) as ReactionCounts;
}

/** HGETALL comes back as a flat [field, value, field, value, …] array. */
function parseCounts(raw: unknown): ReactionCounts {
  const counts = emptyCounts();
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) {
      const key = raw[i];
      if (isReactionKey(key)) counts[key] = Math.max(0, Number(raw[i + 1]) || 0);
    }
  }
  return counts;
}

export async function getReactions(slug: string, visitor: string): Promise<ReactionState> {
  const [counts, membership] = await pipeline([
    ["HGETALL", countsKey(slug)],
    ["SMISMEMBER", votersKey(slug), ...REACTIONS.map((r) => member(r.key, visitor))],
  ]);
  const flags = Array.isArray(membership) ? membership : [];
  return {
    counts: parseCounts(counts),
    mine: REACTIONS.filter((_, i) => Number(flags[i]) === 1).map((r) => r.key),
  };
}

export async function setReaction(
  slug: string,
  visitor: string,
  key: ReactionKey,
  on: boolean,
): Promise<ReactionState> {
  await pipeline([
    ["EVAL", on ? ADD : REMOVE, 2, votersKey(slug), countsKey(slug), member(key, visitor), key],
  ]);
  return getReactions(slug, visitor);
}

/** How many reaction writes one visitor may make per minute, across all posts. */
const WRITES_PER_MINUTE = 20;

/** True when the visitor is still within their write budget. */
export async function allowWrite(visitor: string): Promise<boolean> {
  const [count] = await pipeline([
    ["EVAL", RATE, 1, `reactions:rl:${visitor}`],
  ]);
  return Number(count) <= WRITES_PER_MINUTE;
}

/* ───────────── Development-only memory store ───────────── */

const memory = new Map<string, Map<string, number> | Set<string> | number>();

function memoryCommand([name, ...args]: Command): unknown {
  const hash = (k: string) => {
    let h = memory.get(k);
    if (!(h instanceof Map)) memory.set(k, (h = new Map()));
    return h;
  };
  const set = (k: string) => {
    let s = memory.get(k);
    if (!(s instanceof Set)) memory.set(k, (s = new Set()));
    return s;
  };

  switch (name) {
    case "HGETALL":
      return [...hash(String(args[0])).entries()].flat();
    case "SMISMEMBER": {
      const s = set(String(args[0]));
      return args.slice(1).map((m) => (s.has(String(m)) ? 1 : 0));
    }
    case "EVAL": {
      if (args[0] === RATE) {
        // No expiry in the memory store: a dev server restart clears it.
        const next = (Number(memory.get(String(args[2]))) || 0) + 1;
        memory.set(String(args[2]), next);
        return next;
      }
      const [script, , voters, counts, entry, key] = args.map(String);
      const members = set(voters);
      const tally = hash(counts);
      const adding = script === ADD;
      const changed = adding ? !members.has(entry) : members.has(entry);
      if (changed) {
        if (adding) members.add(entry);
        else members.delete(entry);
        tally.set(key, (tally.get(key) ?? 0) + (adding ? 1 : -1));
      }
      return changed ? 1 : 0;
    }
    default:
      throw new Error(`memory store: unsupported ${name}`);
  }
}
