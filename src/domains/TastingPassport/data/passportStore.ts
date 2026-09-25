/* eslint-disable no-param-reassign -- this module IS a deliberately mutable store; `entry` is its cell */
import {
  setFav as machineSetFav,
  setPourFav as machineSetPourFav,
  setPourTasted as machineSetPourTasted,
  setWant as machineSetWant,
  setWent as machineSetWent,
  resolveShareEmail,
} from '../state/stateMachine';
import {
  AttendanceRecord,
  BoothStatus,
  BoothUserState,
  ContactIdentity,
  PersistedPassport,
  Pour,
  PourStatus,
  TastingEvent,
} from '../types';
import { recordTasted, resetLeaderboardDeltas } from './leaderboardDeltas';
import {
  BoothMark,
  trackBoothMarked,
  trackLeadOptIn,
  trackPassportCompleted,
  trackPourFavorited,
  trackPourTasted,
} from './passportAnalytics';
import { PassportRepository, pourKeyOf } from './PassportRepository';
import {
  IDLE_STATUS,
  PassportWriteQueue,
  PendingWrite,
  QueueStatus,
  isAttendanceWrite,
  isOnboardedWrite,
} from './writeQueue';

export const DEFAULT_BOOTH: BoothUserState = {
  want: false,
  went: false,
  fav: false,
  notes: '',
  shareEmail: undefined,
};

export const EMPTY_POUR: PourStatus = { tasted: false, fav: false };

export type EventSnapshot = {
  passport: PersistedPassport;
  onboarded: boolean;
  loading: boolean;
  /**
   * The passport could not be read. Screens must show this instead of the grid: an
   * unstamped grid is indistinguishable from a real empty passport, and the first tap on
   * one would write that emptiness back over what the server is still holding.
   */
  loadFailed: boolean;
  /** Event-level lead sharing. ON until the attendee turns it off. */
  shareContact: boolean;
  /** Outstanding writes, and whether they have stopped landing. */
  sync: QueueStatus;
};

type EventEntry = {
  snapshot: EventSnapshot;
  event: TastingEvent;
  userId: string;
  eventId: string;
  repo: PassportRepository;
  /**
   * A load has completed successfully. Until it has, nothing may be written: every write
   * carries the FULL record, so one sent against un-loaded state overwrites the stored one.
   */
  initialized: boolean;
  loadStarted: boolean;
  /** Name + email for the snapshot, handed down from auth once resolved. */
  identity: ContactIdentity | null;
  /** What the repository currently holds, so we only write on a real change. */
  storedContact: AttendanceRecord | null;
  /** Every write leaves through here — durable, ordered, and retried. */
  queue: PassportWriteQueue;
  /** Completion is reported once per session, not on every toggle at 40/40. */
  completionTracked: boolean;
  listeners: Set<() => void>;
};

// Stable reference so an unknown key doesn't produce a fresh object on every render.
const LOADING_SNAPSHOT: EventSnapshot = {
  passport: { booths: {}, pours: {} },
  onboarded: true,
  loading: true,
  loadFailed: false,
  shareContact: true,
  sync: IDLE_STATUS,
};

const entries = new Map<string, EventEntry>();

export const storeKey = (userId: string, eventId: string): string => `${userId}:${eventId}`;

const statusOf = (booth: BoothUserState): BoothStatus => ({
  want: booth.want,
  went: booth.went,
  fav: booth.fav,
});

/** Replace the snapshot with a new object, then notify. Never mutate the snapshot in place. */
const publish = (entry: EventEntry, next: Partial<EventSnapshot>) => {
  entry.snapshot = { ...entry.snapshot, ...next };
  entry.listeners.forEach((listener) => listener());
};

/**
 * Push the name + email snapshot into passport storage when sharing is on. Called once the
 * passport has loaded and auth has handed down an identity, so a first-time attendee gets a
 * contact row without having to opt in — that's the default. An explicit opt-out is respected
 * and never re-armed here; only `applyShareContact` can turn sharing back on.
 */
const syncContact = (entry: EventEntry) => {
  if (!entry.initialized || !entry.identity) return;
  const stored = entry.storedContact;
  if (stored && !stored.shareContact) return;
  const next: AttendanceRecord = {
    shareContact: true,
    displayName: entry.identity.displayName,
    email: entry.identity.email,
  };
  const unchanged =
    stored?.displayName === next.displayName && stored?.email === next.email;
  if (unchanged) return;
  entry.storedContact = next;
  entry.queue.enqueue({ kind: 'attendance', attendance: next });
};

const applyShareContact = (entry: EventEntry, value: boolean) => {
  if (entry.snapshot.shareContact === value) return;
  publish(entry, { shareContact: value });
  trackLeadOptIn(entry.event, entry.userId, value);
  // Opting out wipes the stored snapshot rather than just flagging it, so an export
  // run afterwards has no address left to find.
  const next: AttendanceRecord = value
    ? {
        shareContact: true,
        displayName: entry.identity?.displayName ?? null,
        email: entry.identity?.email ?? null,
      }
    : { shareContact: false, displayName: null, email: null };
  entry.storedContact = next;
  entry.queue.enqueue({ kind: 'attendance', attendance: next });
};

type PendingOverlay = {
  passport: PersistedPassport;
  onboarded: boolean | null;
  attendance: AttendanceRecord | null;
};

/**
 * Lay writes that never reached the server over what the server just returned.
 *
 * This is the half of WHI-189 the retry can't cover on its own: a force quit with work
 * still queued would otherwise read the pre-change row back, and the attendee would watch
 * selections they cleared reappear. Queued writes are newer than anything loaded, by
 * definition, so they win.
 */
const applyPending = (
  loaded: PersistedPassport,
  pending: PendingWrite[],
): PendingOverlay => {
  const booths = { ...loaded.booths };
  const pours = { ...loaded.pours };
  pending.forEach((write) => {
    if (write.kind === 'booth') booths[write.boothId] = write.booth;
    if (write.kind === 'pour') pours[write.pourKey] = write.pour;
  });
  const onboarding = pending.filter(isOnboardedWrite).pop();
  const attendance = pending.filter(isAttendanceWrite).pop();
  return {
    passport: { booths, pours },
    onboarded: onboarding?.value ?? null,
    attendance: attendance?.attendance ?? null,
  };
};

/**
 * Read the stored passport and open the entry for writing.
 *
 * A failure leaves `initialized` false, so every action below refuses to write and the
 * screens show the error instead of an empty grid. Queued writes still drain: they are the
 * attendee's own changes from before, and they carry full records the load has no bearing on.
 */
const startLoad = (entry: EventEntry) => {
  entry.loadStarted = true;
  (async () => {
    try {
      const pending = await entry.queue.restore();
      const [loaded, seenOnboarding, attendance] = await Promise.all([
        entry.repo.loadPassport(entry.userId, entry.eventId),
        entry.repo.loadOnboarded(entry.userId),
        entry.repo.loadAttendance(entry.userId, entry.eventId),
      ]);
      const overlay = applyPending(loaded, pending);
      entry.storedContact = overlay.attendance ?? attendance;
      entry.initialized = true;
      publish(entry, {
        passport: overlay.passport,
        onboarded: overlay.onboarded ?? seenOnboarding,
        loading: false,
        loadFailed: false,
        // No row yet means a first-time attendee, who shares by default.
        shareContact: entry.storedContact?.shareContact ?? true,
      });
      syncContact(entry);
    } catch (err) {
      // eslint-disable-next-line no-console -- the only surface a failed load reports to
      console.warn('[passport] load failed, holding writes', err);
      publish(entry, { loading: false, loadFailed: true });
    }
    entry.queue.flush();
  })();
};

export const ensureEntry = (
  userId: string,
  eventId: string,
  event: TastingEvent,
  repo: PassportRepository,
): string => {
  const key = storeKey(userId, eventId);
  let entry = entries.get(key);
  if (!entry) {
    const queue = new PassportWriteQueue(repo, userId, eventId);
    const created: EventEntry = {
      snapshot: LOADING_SNAPSHOT,
      event,
      userId,
      eventId,
      repo,
      initialized: false,
      loadStarted: false,
      identity: null,
      storedContact: null,
      queue,
      completionTracked: false,
      listeners: new Set(),
    };
    queue.onStatus = (sync) => publish(created, { sync });
    entry = created;
    entries.set(key, entry);
  }
  if (!entry.loadStarted) startLoad(entry);
  return key;
};

export const subscribe = (key: string, listener: () => void): (() => void) => {
  const entry = entries.get(key);
  if (!entry) return () => {};
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
  };
};

export const getSnapshot = (key: string): EventSnapshot =>
  entries.get(key)?.snapshot ?? LOADING_SNAPSHOT;

/**
 * The entry, but only once a load has actually landed. Every write carries the full record,
 * so one issued against un-loaded state would overwrite the stored one with defaults. The
 * screens already refuse to render controls in that state; this is the backstop.
 */
const writableEntry = (key: string): EventEntry | undefined => {
  const entry = entries.get(key);
  if (!entry?.initialized) return undefined;
  return entry;
};

const boothOf = (entry: EventEntry, boothId: string): BoothUserState =>
  entry.snapshot.passport.booths[boothId] ?? DEFAULT_BOOTH;

const pourOf = (entry: EventEntry, boothId: string, pourId: string): PourStatus =>
  entry.snapshot.passport.pours[pourKeyOf(boothId, pourId)] ?? EMPTY_POUR;

const pourContentOf = (entry: EventEntry, boothId: string, pourId: string): Pour | undefined =>
  entry.event.booths.find((b) => b.id === boothId)?.pours.find((p) => p.id === pourId);

// The leaderboard identity for a pour, read from the event content. Undefined for
// mock/offline pours; the backend repository falls back to the pour id.
const bottleKeyOf = (entry: EventEntry, boothId: string, pourId: string): string | undefined =>
  pourContentOf(entry, boothId, pourId)?.bottleKey;

const hasFavoritePour = (pours: Record<string, PourStatus>, boothId: string): boolean => {
  const prefix = `${boothId}:`;
  return Object.keys(pours).some((pKey) => pKey.startsWith(prefix) && pours[pKey].fav);
};

/**
 * Rule 4, derived rather than materialized. `shareEmail` stores ONLY a switch the attendee
 * threw by hand; a booth they never touched stays unset, and its opt-in is recomputed from
 * the Favorites every time it is read.
 *
 * That is what lets removing a Favorite take the opt-in back off. Writing the default into
 * the row instead — as this used to — left a stored `true` indistinguishable from a
 * deliberate one, so the flag could only ratchet on: un-favoriting, or undoing the "To Go"
 * or "Visited" that armed it under the old rule, left the share switch stuck ON with nothing
 * on screen still justifying it. An explicit choice is still absolute, in both directions.
 */
const effectiveShare = (
  booth: BoothUserState,
  pours: Record<string, PourStatus>,
  boothId: string,
): boolean =>
  resolveShareEmail(booth.shareEmail, statusOf(booth), hasFavoritePour(pours, boothId));

const commitBooth = (entry: EventEntry, boothId: string, nextBooth: BoothUserState) => {
  const { pours } = entry.snapshot.passport;
  const booths = { ...entry.snapshot.passport.booths, [boothId]: nextBooth };
  publish(entry, { passport: { booths, pours } });
  entry.queue.enqueue({ kind: 'booth', boothId, booth: nextBooth });
};

/**
 * A Favorite just armed this booth's untouched opt-in. Report it, and lift an event-level
 * opt-out the same way tapping the booth's own switch does.
 *
 * Without the lift, the booth switch renders `shareContact && resolveShareEmail(...)`, so an
 * attendee who had turned event-level sharing off would favorite a distiller and still watch
 * the switch sit at OFF with nothing explaining why. Since the Favorite-only rule shipped,
 * this is the ONLY path that arms lead capture at all — so a suppressed one means the
 * distiller gets no leads whatsoever.
 */
const noteLeadSignal = (entry: EventEntry, boothId: string) => {
  trackLeadOptIn(entry.event, entry.userId, true, boothId);
  applyShareContact(entry, true);
};

/** Report 40/40 once. Cheap to call after any booth write; it returns immediately otherwise. */
const noteCompletion = (entry: EventEntry) => {
  const total = entry.event.booths.length;
  if (entry.completionTracked || total === 0) return;
  const visited = Object.values(entry.snapshot.passport.booths).filter((b) => b.went).length;
  if (visited < total) return;
  entry.completionTracked = true;
  trackPassportCompleted(entry.event, entry.userId);
};

const updateBoothStatus = (
  key: string,
  boothId: string,
  mark: BoothMark,
  value: boolean,
  produce: (status: BoothStatus) => BoothStatus,
) => {
  const entry = writableEntry(key);
  if (!entry) return;
  const current = boothOf(entry, boothId);
  const { pours } = entry.snapshot.passport;
  const wasShared = effectiveShare(current, pours, boothId);
  const next = { ...current, ...produce(statusOf(current)) };
  commitBooth(entry, boothId, next);
  trackBoothMarked(entry.event, entry.userId, boothId, mark, value);
  // Reported on the transition, not on the Favorite itself: a booth the attendee had already
  // opted out of by hand stays out, and re-favoriting it is not a fresh lead.
  if (!wasShared && effectiveShare(next, pours, boothId)) noteLeadSignal(entry, boothId);
  noteCompletion(entry);
};

export const actions = {
  setWant: (key: string, boothId: string, value: boolean) =>
    updateBoothStatus(key, boothId, 'togo', value, (status) => machineSetWant(status, value)),

  setWent: (key: string, boothId: string, value: boolean) =>
    updateBoothStatus(key, boothId, 'visited', value, (status) =>
      machineSetWent(status, value),
    ),

  setFav: (key: string, boothId: string, value: boolean) =>
    updateBoothStatus(key, boothId, 'favorite', value, (status) =>
      machineSetFav(status, value),
    ),

  setNotes: (key: string, boothId: string, notes: string) => {
    const entry = writableEntry(key);
    if (!entry) return;
    commitBooth(entry, boothId, { ...boothOf(entry, boothId), notes: notes.slice(0, 2000) });
  },

  setShareEmail: (key: string, boothId: string, value: boolean) => {
    const entry = writableEntry(key);
    if (!entry) return;
    commitBooth(entry, boothId, { ...boothOf(entry, boothId), shareEmail: value });
    trackLeadOptIn(entry.event, entry.userId, value, boothId);
    // Naming one distiller is an explicit "share it with them", so it lifts an earlier
    // event-level opt-out instead of silently doing nothing.
    if (value) applyShareContact(entry, true);
  },

  setShareContact: (key: string, value: boolean) => {
    const entry = writableEntry(key);
    if (!entry) return;
    applyShareContact(entry, value);
  },

  // Auth resolves after the first render, so the identity arrives separately from the load.
  setIdentity: (key: string, identity: ContactIdentity) => {
    const entry = entries.get(key);
    if (!entry) return;
    const same =
      entry.identity?.displayName === identity.displayName &&
      entry.identity?.email === identity.email;
    if (same) return;
    entry.identity = identity;
    syncContact(entry);
  },

  setPourTasted: (key: string, boothId: string, pourId: string, value: boolean) => {
    const entry = writableEntry(key);
    if (!entry) return;
    const currentBooth = boothOf(entry, boothId);
    const currentPour = pourOf(entry, boothId, pourId);
    const { booth, pour } = machineSetPourTasted(
      statusOf(currentBooth),
      currentPour,
      value,
    );
    const pKey = pourKeyOf(boothId, pourId);
    const pours = { ...entry.snapshot.passport.pours, [pKey]: pour };
    // Tasting touches the stamp and nothing else. It cannot move the opt-in either way now
    // that rule 4 is Favorite-only, so there is no share state to resolve here.
    const nextBooth = { ...currentBooth, ...booth };
    const boothChanged = nextBooth.went !== currentBooth.went;
    const booths = boothChanged
      ? { ...entry.snapshot.passport.booths, [boothId]: nextBooth }
      : entry.snapshot.passport.booths;
    publish(entry, { passport: { booths, pours } });
    const content = pourContentOf(entry, boothId, pourId);
    entry.queue.enqueue({
      kind: 'pour',
      pourKey: pKey,
      pour,
      ctx: { boothId, pourId, bottleKey: content?.bottleKey },
    });
    if (boothChanged) entry.queue.enqueue({ kind: 'booth', boothId, booth: nextBooth });
    // Only on a real change — re-tapping the value already held would double-count. Guests
    // never reach the server and never see the board, so they contribute nothing to it.
    if (pour.tasted !== currentPour.tasted) {
      trackPourTasted(entry.event, entry.userId, boothId, pourId, pour.tasted);
      if (entry.userId !== 'guest') {
        // Mirrors the repository's fallback, so the delta and the row it anticipates agree.
        recordTasted(entry.event.id, content?.bottleKey ?? pourId, pour.tasted, {
          bottleName: content?.name ?? '',
          brand: content?.brand ?? '',
        });
      }
    }
    if (boothChanged) noteCompletion(entry);
  },

  setPourFav: (key: string, boothId: string, pourId: string, value: boolean) => {
    const entry = writableEntry(key);
    if (!entry) return;
    const pKey = pourKeyOf(boothId, pourId);
    const currentPour = pourOf(entry, boothId, pourId);
    const pour = machineSetPourFav(currentPour, value);
    const booth = boothOf(entry, boothId);
    // Favoriting a bottle IS the lead signal (rule 4), so it arms the booth's opt-in — but it
    // arms it by being read, not by being written. The booth row is left alone: it now carries
    // only a hand-thrown switch, and un-favoriting has to be able to take the opt-in away.
    const wasShared = effectiveShare(booth, entry.snapshot.passport.pours, boothId);
    const pours = { ...entry.snapshot.passport.pours, [pKey]: pour };
    publish(entry, { passport: { booths: entry.snapshot.passport.booths, pours } });
    entry.queue.enqueue({
      kind: 'pour',
      pourKey: pKey,
      pour,
      ctx: { boothId, pourId, bottleKey: bottleKeyOf(entry, boothId, pourId) },
    });
    if (pour.fav !== currentPour.fav) {
      trackPourFavorited(entry.event, entry.userId, boothId, pourId, pour.fav);
      if (!wasShared && effectiveShare(booth, pours, boothId)) noteLeadSignal(entry, boothId);
    }
  },

  markOnboarded: (key: string) => {
    const entry = writableEntry(key);
    if (!entry) return;
    publish(entry, { onboarded: true });
    entry.queue.enqueue({ kind: 'onboarded', value: true });
  },

  retrySaves: (key: string) => {
    entries.get(key)?.queue.retryNow();
  },

  /** Try the read again after it failed. Only reachable from the error screen's Retry. */
  reloadPassport: (key: string) => {
    const entry = entries.get(key);
    if (!entry || !entry.snapshot.loadFailed) return;
    publish(entry, { loading: true, loadFailed: false });
    startLoad(entry);
  },
};

export const resetPassportStore = () => {
  entries.forEach((entry) => entry.queue.dispose());
  entries.clear();
  resetLeaderboardDeltas();
};
