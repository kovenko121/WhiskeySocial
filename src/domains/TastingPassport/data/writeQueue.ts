/* eslint-disable no-console -- the queue is the only place a failed passport write is observable */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceRecord, BoothUserState, PourStatus } from '../types';
import { PassportRepository } from './PassportRepository';

/**
 * One outstanding passport write. Every variant carries the FULL record it wants stored,
 * never a delta, so a newer write for the same target can replace an older one outright
 * and a replay can never reconstruct a half-applied state.
 */
export type PendingWrite =
  | { kind: 'booth'; boothId: string; booth: BoothUserState }
  | {
      kind: 'pour';
      pourKey: string;
      pour: PourStatus;
      ctx: { boothId: string; pourId: string; bottleKey?: string };
    }
  | { kind: 'attendance'; attendance: AttendanceRecord }
  | { kind: 'onboarded'; value: boolean };

/** A write plus how many times the repository has turned it down. */
type QueuedWrite = { write: PendingWrite; attempts: number };

export type QueueStatus = {
  /** Changes the attendee has made that the repository has not accepted yet. */
  pending: number;
  /** Something has been refused often enough that the UI must stop implying it saved. */
  failed: boolean;
};

export const IDLE_STATUS: QueueStatus = { pending: 0, failed: false };

const NO_LISTENER: (status: QueueStatus) => void = () => {};

// Retries stay cheap early — a festival dead spot lasts seconds — and back off to half a
// minute so a genuinely dead connection isn't hammered for the rest of the event.
const FIRST_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

// Under this a write is still plausibly in flight; at it, we tell the attendee. Five
// attempts is ~15s of backoff — long enough that walking behind a wall stays invisible.
// At three it was ~3s, and the banner cried wolf at every dead spot on the floor, which
// trains attendees to ignore the one time it means their stamps really are not saving.
const FAILURES_BEFORE_VISIBLE = 5;

/**
 * A request that neither resolves nor rejects wedges the whole queue: `drain` sits on the
 * await, `draining` stays true, and every later toggle is enqueued behind a write that will
 * never finish. A timeout turns that into an ordinary failure the retry already handles.
 *
 * Generous on purpose. Every write is a full-record idempotent upsert, so a stalled request
 * landing late is harmless in the common case — but if a NEWER value for the same target has
 * been sent in between, a late arrival would overwrite it, and the wider the window the
 * less likely that is.
 */
const WRITE_TIMEOUT_MS = 20000;

const withTimeout = (work: Promise<void>, label: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`passport ${label} write stalled past ${WRITE_TIMEOUT_MS}ms`)),
      WRITE_TIMEOUT_MS,
    );
    const settle = (finish: () => void) => {
      clearTimeout(timer);
      finish();
    };
    work.then(
      () => settle(resolve),
      (err) => settle(() => reject(err)),
    );
  });

const storageKey = (userId: string, eventId: string): string =>
  `ws-passport-queue:v1:${userId}:${eventId}`;

/** What a write competes for. Two writes with the same target — only the newer one matters. */
const targetOf = (write: PendingWrite): string => {
  switch (write.kind) {
    case 'booth':
      return `booth:${write.boothId}`;
    case 'pour':
      return `pour:${write.pourKey}`;
    case 'attendance':
      return 'attendance';
    default:
      return 'onboarded';
  }
};

const backoffFor = (failures: number): number =>
  Math.min(FIRST_BACKOFF_MS * 2 ** (failures - 1), MAX_BACKOFF_MS);

type OnboardedWrite = Extract<PendingWrite, { kind: 'onboarded' }>;
type AttendanceWrite = Extract<PendingWrite, { kind: 'attendance' }>;

export const isOnboardedWrite = (write: PendingWrite): write is OnboardedWrite =>
  write.kind === 'onboarded';

export const isAttendanceWrite = (write: PendingWrite): write is AttendanceWrite =>
  write.kind === 'attendance';

/**
 * Durable, serialized write-behind for one attendee's passport at one event.
 *
 * Four guarantees, all of them WHI-189:
 *  - a write that fails is retried rather than dropped on the floor;
 *  - writes run one at a time, so a rapid on/off/on can't land out of sequence and leave
 *    the server holding the wrong value;
 *  - the queue outlives the process, so a force quit with work outstanding replays it on
 *    relaunch instead of reading the pre-change row back as if nothing had happened;
 *  - one target the server refuses can't take the rest of the passport down with it.
 */
export class PassportWriteQueue {
  /** Called only when the status actually changes, so it can safely drive a render. */
  onStatus: (status: QueueStatus) => void = NO_LISTENER;

  private readonly repo: PassportRepository;

  private readonly userId: string;

  private readonly eventId: string;

  private readonly key: string;

  private items: QueuedWrite[] = [];

  private draining = false;

  private failures = 0;

  private timer: ReturnType<typeof setTimeout> | null = null;

  private persistChain: Promise<void> = Promise.resolve();

  private lastStatus: QueueStatus = IDLE_STATUS;

  constructor(repo: PassportRepository, userId: string, eventId: string) {
    this.repo = repo;
    this.userId = userId;
    this.eventId = eventId;
    this.key = storageKey(userId, eventId);
  }

  /**
   * Read back whatever the last process left unwritten. Returns the writes so the caller can
   * lay them over what the repository just loaded — the server's copy is stale by exactly
   * these, and showing it raw is the bug being fixed.
   */
  async restore(): Promise<PendingWrite[]> {
    let stored: QueuedWrite[] = [];
    try {
      const raw = await AsyncStorage.getItem(this.key);
      if (raw) stored = JSON.parse(raw) as QueuedWrite[];
    } catch {
      stored = [];
    }
    // Anything enqueued while this read was in flight is newer than the stored copy.
    const live = new Set(this.items.map((item) => targetOf(item.write)));
    this.items = [
      // A new session gets a fresh retry budget: the last one may have died in a dead spot,
      // and inheriting its failures would show the attendee a warning we haven't re-earned.
      ...stored
        .filter((item) => !live.has(targetOf(item.write)))
        .map((item) => ({ write: item.write, attempts: 0 })),
      ...this.items,
    ];
    this.publishStatus();
    return this.items.map((item) => item.write);
  }

  enqueue(write: PendingWrite): void {
    const target = targetOf(write);
    const at = this.items.findIndex((item) => targetOf(item.write) === target);
    const queued: QueuedWrite = { write, attempts: 0 };
    // Replace in place rather than re-appending: the queue stays in the order the attendee
    // acted, a write already in flight is left for `drain` to notice, and the new value
    // starts its retry budget over — it is a different value, not another go at the old one.
    if (at >= 0) this.items[at] = queued;
    else this.items.push(queued);
    this.persist();
    this.publishStatus();
    this.scheduleDrain(0);
  }

  /** Start draining whatever `restore` brought back. */
  flush(): void {
    if (this.items.length > 0) this.scheduleDrain(0);
  }

  /** Skip the backoff — the attendee asked for this, so waiting out the timer reads as broken. */
  retryNow(): void {
    this.failures = 0;
    this.items = this.items.map((item) => ({ ...item, attempts: 0 }));
    this.publishStatus();
    this.clearTimer();
    this.scheduleDrain(0);
  }

  dispose(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = null;
  }

  private scheduleDrain(delayMs: number): void {
    // An armed timer already covers this; re-arming on every toggle would collapse the
    // backoff and hammer a connection that just told us it is down.
    if (this.timer || this.draining) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      // `drain` handles write failures itself; anything reaching here came out of a status
      // listener, and losing the queue to it would be the silent loss all over again.
      this.drain().catch((err) => console.warn('[passport] queue drain crashed', err));
    }, delayMs);
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.items.length > 0) {
        const head = this.items[0];
        try {
          // eslint-disable-next-line no-await-in-loop -- serialized on purpose; see class doc
          await withTimeout(this.apply(head.write), head.write.kind);
        } catch (err) {
          this.recordFailure(head, err);
          return;
        }
        // A newer write for the same target landed mid-flight; keep it and send it next.
        if (this.items[0] === head) this.items.shift();
        this.failures = 0;
        this.persist();
        this.publishStatus();
      }
    } finally {
      this.draining = false;
    }
  }

  private recordFailure(head: QueuedWrite, err: unknown): void {
    this.failures += 1;
    console.warn('[passport] write failed, will retry', head.write.kind, err);
    // Superseded mid-flight: the newer value is a different write, and it starts its own
    // retry budget rather than inheriting this one's.
    if (this.items[0] === head) {
      this.items[0] = { write: head.write, attempts: head.attempts + 1 };
      // A write the server keeps refusing must not hold up the others. There is at most one
      // pending write per target, so moving this one to the back cannot reorder anything —
      // and it stops one bad field from costing the attendee their whole passport.
      if (this.items.length > 1) this.items.push(this.items.shift() as QueuedWrite);
    }
    this.persist();
    this.publishStatus();
    this.draining = false;
    this.scheduleDrain(backoffFor(this.failures));
  }

  private apply(write: PendingWrite): Promise<void> {
    switch (write.kind) {
      case 'booth':
        return this.repo.saveBooth(this.userId, this.eventId, write.boothId, write.booth);
      case 'pour':
        return this.repo.savePour(
          this.userId,
          this.eventId,
          write.pourKey,
          write.pour,
          write.ctx,
        );
      case 'attendance':
        return this.repo.saveAttendance(this.userId, this.eventId, write.attendance);
      default:
        return this.repo.saveOnboarded(this.userId, write.value);
    }
  }

  private persist(): void {
    const snapshot = JSON.stringify(this.items);
    // Chained so two rapid toggles can't interleave and leave a torn queue on disk.
    this.persistChain = this.persistChain
      .then(() => AsyncStorage.setItem(this.key, snapshot))
      .catch(() => {
        // Losing the durable copy costs us the replay, not the write in flight.
      });
  }

  private publishStatus(): void {
    const next: QueueStatus = {
      pending: this.items.length,
      failed: this.items.some((item) => item.attempts >= FAILURES_BEFORE_VISIBLE),
    };
    if (next.pending === this.lastStatus.pending && next.failed === this.lastStatus.failed) {
      return;
    }
    this.lastStatus = next;
    this.onStatus(next);
  }
}
