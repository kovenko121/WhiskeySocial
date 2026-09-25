/**
 * The attendee's own pours that the leaderboard hasn't seen yet, held as counter deltas and
 * laid over the server's counters until it catches up. A "Tasted" tap reaches the board the
 * long way round — pour row, DynamoDB stream, counter Lambda, next poll — so the number the
 * attendee just caused is otherwise the one number on screen that lags.
 *
 * Reconciliation is by ECHO, not by count: a delta clears once the counter row reports an
 * `updatedAt` other than the one observed when the delta was recorded, or once the row
 * appears at all for a bottle nobody had tasted yet. Comparing counts cannot tell the
 * attendee's own +1 from another attendee's, so it would either double-count or snap
 * backwards the moment someone else stamped the same bottle.
 */

export type CounterEcho = { bottleKey: string; updatedAt?: string | null };

export type LeaderboardDelta = {
  delta: number;
  /** Carried so a bottle with no counter row yet lands on the board named, not blank. */
  bottleName: string;
  brand: string;
};

type Entry = LeaderboardDelta & {
  seenUpdatedAt: string | null;
  recordedAt: number;
};

// Three poll cycles. A delta outstanding past this belongs to a write the queue never
// managed to land, and holding it longer misreports the board to everyone reading it.
const DELTA_TTL_MS = 90 * 1000;

const EMPTY: Map<string, LeaderboardDelta> = new Map();

/** eventId → bottleKey → outstanding delta. */
const byEvent = new Map<string, Map<string, Entry>>();
/** eventId → bottleKey → the `updatedAt` the last poll reported. */
const echoes = new Map<string, Map<string, string | null>>();
/** Rebuilt only on change, so `useSyncExternalStore` sees a stable reference. */
const snapshots = new Map<string, Map<string, LeaderboardDelta>>();

const listeners = new Set<() => void>();

const rebuild = (eventId: string): void => {
  const entries = byEvent.get(eventId);
  if (!entries?.size) {
    snapshots.delete(eventId);
    return;
  }
  const next = new Map<string, LeaderboardDelta>();
  entries.forEach((entry, bottleKey) =>
    next.set(bottleKey, {
      delta: entry.delta,
      bottleName: entry.bottleName,
      brand: entry.brand,
    }),
  );
  snapshots.set(eventId, next);
};

const publish = (): void => listeners.forEach((listener) => listener());

/** Callers must only call this when `tasted` actually changed, or it will double-count. */
export const recordTasted = (
  eventId: string,
  bottleKey: string,
  tasted: boolean,
  display: { bottleName: string; brand: string },
): void => {
  const entries = byEvent.get(eventId) ?? new Map<string, Entry>();
  byEvent.set(eventId, entries);

  const existing = entries.get(bottleKey);
  const delta = (existing?.delta ?? 0) + (tasted ? 1 : -1);

  // Tasted then untasted before the server heard either: there is nothing left to correct.
  if (delta === 0) {
    entries.delete(bottleKey);
  } else {
    entries.set(bottleKey, {
      delta,
      bottleName: display.bottleName,
      brand: display.brand,
      // Keep the FIRST observation. The wait is for the server to move past the state the
      // attendee was looking at when they started toggling, not past each tap in between.
      seenUpdatedAt: existing?.seenUpdatedAt ?? echoes.get(eventId)?.get(bottleKey) ?? null,
      recordedAt: Date.now(),
    });
  }

  rebuild(eventId);
  publish();
};

/**
 * Hand the store what the server just returned: it clears the deltas the server has now
 * accounted for, and remembers the rest as the baseline for the next tap. Expiry is swept
 * here rather than on a timer — the poll that calls this is the only clock the board has.
 */
export const observeCounters = (eventId: string, counters: CounterEcho[]): void => {
  const seen = new Map<string, string | null>();
  counters.forEach((counter) => seen.set(counter.bottleKey, counter.updatedAt ?? null));
  echoes.set(eventId, seen);

  const entries = byEvent.get(eventId);
  if (!entries?.size) return;

  const now = Date.now();
  let changed = false;
  [...entries.entries()].forEach(([bottleKey, entry]) => {
    const landed =
      seen.has(bottleKey) && (seen.get(bottleKey) ?? null) !== entry.seenUpdatedAt;
    if (!landed && now - entry.recordedAt < DELTA_TTL_MS) return;
    entries.delete(bottleKey);
    changed = true;
  });

  if (!changed) return;
  rebuild(eventId);
  publish();
};

export const pendingDeltas = (eventId: string): Map<string, LeaderboardDelta> =>
  snapshots.get(eventId) ?? EMPTY;

export const subscribeDeltas = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetLeaderboardDeltas = (): void => {
  byEvent.clear();
  echoes.clear();
  snapshots.clear();
};
