export const EVENT_OPEN_WINDOW_MS = 24 * 60 * 60 * 1000;

export type TastingEventStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';

/**
 * Where an event sits relative to its own clock.
 *
 *  upcoming — scheduled, not yet at its go-live; nobody sees it
 *  preview  — listed and browsable, but not started, so nothing can be stamped
 *  open     — running; the passport records normally
 *  past     — over; listed under Past Events, read-only
 *  hidden   — archived, or a draft for anyone who is not an admin
 */
export type EventPhase = 'upcoming' | 'preview' | 'open' | 'past' | 'hidden';

export type EventWindow = {
  phase: EventPhase;
  /** When the card appears. Null means "already", for anything not SCHEDULED. */
  opensAt: number | null;
  /** When stamping unlocks. Null means it is not gated. */
  startsAt: number | null;
  /** When it becomes past. Null means it runs until an admin archives it. */
  endsAt: number | null;
};

export type EventCandidate = {
  title?: string | null;
  status?: TastingEventStatus | null;
  publishAt?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

const HIDDEN: EventWindow = {
  phase: 'hidden',
  opensAt: null,
  startsAt: null,
  endsAt: null,
};

const toEpoch = (value?: string | null): number | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * An event with no `endsAt` still has to stop being current on its own, or a
 * festival nobody archived stays on Discover for good. A scheduled row falls back to
 * a day from its go-live, which is what this did before the fields existed.
 */
const resolveEnd = (
  candidate: EventCandidate,
  opensAt: number | null
): number | null => {
  const explicit = toEpoch(candidate.endsAt);
  if (explicit !== null) return explicit;
  if (candidate.status === 'SCHEDULED' && opensAt !== null) {
    return opensAt + EVENT_OPEN_WINDOW_MS;
  }
  return null;
};

/**
 * The whole clock in one place. Listing, the stamping gate, and Past Events are all
 * read off the phase this returns, so they can never disagree with each other.
 *
 * A PUBLISHED row is live the moment it is saved — that is the manual override, and
 * it ignores `publishAt` deliberately. A DRAFT runs the same way so an admin sees a
 * work in progress as it will actually behave; who may see one at all is decided by
 * `isEventVisible`, not here.
 */
export const resolveEventWindow = (
  candidate: EventCandidate,
  now: number
): EventWindow => {
  if (candidate.status === 'ARCHIVED' || !candidate.status) return HIDDEN;

  const scheduled = candidate.status === 'SCHEDULED';
  const opensAt = scheduled ? toEpoch(candidate.publishAt) : null;

  // A scheduled row with no go-live time can never be due. Incomplete, not live.
  if (scheduled && opensAt === null) return HIDDEN;

  const startsAt = toEpoch(candidate.startsAt);
  const endsAt = resolveEnd(candidate, opensAt);
  const frame = { opensAt, startsAt, endsAt };

  if (opensAt !== null && now < opensAt) return { phase: 'upcoming', ...frame };
  if (endsAt !== null && now >= endsAt) return { phase: 'past', ...frame };
  if (startsAt !== null && now < startsAt)
    return { phase: 'preview', ...frame };
  return { phase: 'open', ...frame };
};

/** Listed on Discover's live Events section: running, or open for browsing before it starts. */
export const isEventCurrent = (
  candidate: EventCandidate,
  now: number
): boolean => {
  const { phase } = resolveEventWindow(candidate, now);
  return phase === 'preview' || phase === 'open';
};

/** Stamping, notes, pours — everything that writes. Only while it is actually running. */
export const isEventStamping = (
  candidate: EventCandidate,
  now: number
): boolean => resolveEventWindow(candidate, now).phase === 'open';

/**
 * Listed, but its start time has not come round yet — the `preview` phase, not the
 * `upcoming` one, which is an event nobody can see at all.
 */
export const isEventNotStarted = (
  candidate: EventCandidate,
  now: number
): boolean => resolveEventWindow(candidate, now).phase === 'preview';

/** Over, and worth keeping on the Past Events list rather than dropping. */
export const isEventPast = (candidate: EventCandidate, now: number): boolean =>
  resolveEventWindow(candidate, now).phase === 'past';

export const isDraft = (candidate: EventCandidate): boolean =>
  candidate.status === 'DRAFT';

/**
 * Whether this account may be shown the event at all. A draft only ever reaches an
 * admin; everything else is decided by the clock. The flag is the caller's answer to
 * "is this an admin" — never assumed.
 */
const isVisibleTo = (candidate: EventCandidate, isAdmin: boolean): boolean =>
  isDraft(candidate) ? isAdmin : true;

/** Live content leads; a draft is a work in progress and sorts below all of it. */
const priority = (candidate: EventCandidate): number => {
  if (candidate.status === 'PUBLISHED') return 0;
  if (candidate.status === 'SCHEDULED') return 1;
  return 2;
};

const byPriorityThenNewest = (a: EventCandidate, b: EventCandidate): number => {
  const rank = priority(a) - priority(b);
  if (rank !== 0) return rank;
  const started = (toEpoch(b.publishAt) ?? 0) - (toEpoch(a.publishAt) ?? 0);
  if (started !== 0) return started;
  return (a.title ?? '').localeCompare(b.title ?? '');
};

/**
 * Most recently finished first — a festival last week reads before one last year.
 * Ordered on the RESOLVED end, not the stored field: an event that ended on the
 * publish-plus-a-day fallback carries no `endsAt` of its own and would otherwise
 * sort below everything that does.
 */
const byMostRecentlyEnded =
  (now: number) =>
  (a: EventCandidate, b: EventCandidate): number => {
    const left = resolveEventWindow(a, now).endsAt ?? 0;
    const right = resolveEventWindow(b, now).endsAt ?? 0;
    if (left !== right) return right - left;
    return (a.title ?? '').localeCompare(b.title ?? '');
  };

/** The live Events section: running now, or listed ahead of its start time. */
export const openEvents = <T extends EventCandidate>(
  candidates: T[],
  now: number,
  isAdmin = false
): T[] =>
  candidates
    .filter(
      (candidate) =>
        isVisibleTo(candidate, isAdmin) && isEventCurrent(candidate, now)
    )
    .sort(byPriorityThenNewest);

/** The Past Events section: finished, kept rather than dropped. */
export const pastEvents = <T extends EventCandidate>(
  candidates: T[],
  now: number,
  isAdmin = false
): T[] =>
  candidates
    .filter(
      (candidate) =>
        isVisibleTo(candidate, isAdmin) && isEventPast(candidate, now)
    )
    .sort(byMostRecentlyEnded(now));

/**
 * The next instant any of these answers changes — a go-live, a start, or an end.
 * One timer on this is what lets a card appear, a passport unlock, and a festival
 * move to Past Events without anyone reopening the app.
 */
export const nextTransitionAt = (
  candidates: EventCandidate[],
  now: number
): number | null => {
  const boundaries = candidates
    .flatMap((candidate) => {
      const { opensAt, startsAt, endsAt } = resolveEventWindow(candidate, now);
      return [opensAt, startsAt, endsAt];
    })
    .filter((at): at is number => at !== null && at > now);

  if (boundaries.length === 0) return null;
  return Math.min(...boundaries);
};
