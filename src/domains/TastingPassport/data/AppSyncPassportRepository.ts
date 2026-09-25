/* eslint-disable no-console -- the only place a failed passport read is observable */
/* eslint-disable class-methods-use-this -- stateless implementation of the PassportRepository interface */
import { amplify } from '@services';
import { AttendanceRecord, BoothUserState, PersistedPassport, PourStatus } from '../types';
import { PassportRepository, pourKeyOf } from './PassportRepository';
import {
  CreateTastingAttendance,
  CreateTastingBoothState,
  CreateTastingPourState,
  CreateTastingUserPref,
  GetTastingAttendance,
  GetTastingUserPref,
  ListTastingBoothStates,
  ListTastingPourStates,
  UpdateTastingAttendance,
  UpdateTastingBoothState,
  UpdateTastingPourState,
  UpdateTastingUserPref,
} from './passportGraphql';

const emptyPassport = (): PersistedPassport => ({ booths: {}, pours: {} });

const isGuest = (userId: string) => !userId || userId === 'guest';

const messageOf = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

// Amplify's create resolver guards on `attribute_not_exists(id)`, so this rejection is
// proof the row was there all along — which makes the UPDATE error the one that explains
// the lost write, not the create's duplicate complaint.
const rowAlreadyExists = (err: unknown): boolean =>
  /ConditionalCheckFailed/i.test(messageOf(err));

// Second line of defence behind the server-side id filter. A row is only rejected when it
// carries an id that provably belongs to someone else — an absent id keeps the row, so a
// query that stopped selecting `id` costs us this check rather than blanking the passport.
const isOwnRow = (id: string | null | undefined, prefix: string): boolean =>
  typeof id !== 'string' || id.length === 0 || id.startsWith(prefix);

const upsertFailure = (updateErr: unknown, createErr: unknown): Error =>
  new Error(
    rowAlreadyExists(createErr)
      ? `passport update rejected: ${messageOf(updateErr)}`
      : `passport write rejected: ${messageOf(createErr)}`,
  );

type BoothStateItem = {
  id?: string | null;
  boothId: string;
  want?: boolean | null;
  went?: boolean | null;
  fav?: boolean | null;
  notes?: string | null;
  shareEmail?: boolean | null;
};
type PourStateItem = {
  id?: string | null;
  boothId: string;
  pourId: string;
  tasted?: boolean | null;
  fav?: boolean | null;
};
type ListResult<T> = {
  [key: string]: { items: T[]; nextToken: string | null };
};
type PrefResult = { getTastingUserPref: { id: string; onboardedAt?: string | null } | null };
type AttendanceResult = {
  getTastingAttendance: {
    id: string;
    shareContact?: boolean | null;
    displayName?: string | null;
    email?: string | null;
  } | null;
};

/**
 * AppSync-backed passport state, owner-scoped. Slots behind the same
 * `PassportRepository` interface as the AsyncStorage implementation — the store
 * and screens are unchanged. Writes are best-effort (the provider holds the
 * source of truth in memory and updates optimistically). Reads are scoped by the caller's
 * row-id prefix, not by the auth rules: an `Admin`-group token reads past `owner` auth and
 * a `listX` filtered on event alone would hand it the whole event's attendees (WHI-192).
 */
export class AppSyncPassportRepository implements PassportRepository {
  private boothStateId(userId: string, eventId: string, boothId: string): string {
    return `${userId}:${eventId}:${boothId}`;
  }

  private attendanceId(userId: string, eventId: string): string {
    return `${userId}:${eventId}`;
  }

  private pourStateId(
    userId: string,
    eventId: string,
    boothId: string,
    pourId: string,
  ): string {
    return `${userId}:${eventId}:${boothId}:${pourId}`;
  }

  // Upsert: try update first (the common case after the first write); if the row
  // doesn't exist yet the conditional check fails and we create it.
  //
  // Both failing THROWS. Swallowing it here is what made WHI-189 silent: the caller had no
  // way to retry, the attendee was left looking at a value the server never took, and the
  // only evidence was a warning nobody reads.
  private async upsert(
    updateDoc: string,
    createDoc: string,
    input: Record<string, unknown>,
  ): Promise<void> {
    try {
      await amplify.request(updateDoc, { input });
    } catch (updateErr) {
      try {
        await amplify.request(createDoc, { input });
      } catch (createErr) {
        throw upsertFailure(updateErr, createErr);
      }
    }
  }

  // `owner` auth already hides other attendees from a normal account, but an admin
  // account reads with elevated permission and gets the whole event back — every
  // attendee's stamps rendered as if they were this attendee's own. Every passport row
  // id starts `${userId}:${eventId}:`, so filtering on that prefix scopes the read on
  // the client without touching the schema or the auth rules.
  private async listAll<T extends { id?: string | null }>(
    doc: string,
    queryName: string,
    userId: string,
    eventId: string,
  ): Promise<T[]> {
    const prefix = `${userId}:${eventId}:`;
    const items: T[] = [];
    let nextToken: string | null = null;
    do {
      // eslint-disable-next-line no-await-in-loop
      const res: ListResult<T> = await amplify.request<ListResult<T>>(doc, {
        filter: {
          eventId: { eq: eventId },
          id: { beginsWith: prefix },
        },
        nextToken,
      });
      const page: { items: T[]; nextToken: string | null } = res[queryName];
      items.push(...page.items.filter((item) => isOwnRow(item.id, prefix)));
      nextToken = page.nextToken;
    } while (nextToken);
    return items;
  }

  // THROWS on failure, deliberately. Degrading to an empty passport was WHI-19x: the
  // attendee saw an unstamped grid, and the first thing they tapped wrote that empty
  // record back over the booth the server was still holding. A read that failed has to
  // stay distinguishable from a passport that is genuinely empty.
  async loadPassport(userId: string, eventId: string): Promise<PersistedPassport> {
    if (isGuest(userId)) return emptyPassport();
    const [booths, pours] = await Promise.all([
      this.listAll<BoothStateItem>(
        ListTastingBoothStates,
        'listTastingBoothStates',
        userId,
        eventId,
      ),
      this.listAll<PourStateItem>(
        ListTastingPourStates,
        'listTastingPourStates',
        userId,
        eventId,
      ),
    ]);
    const passport = emptyPassport();
    booths.forEach((b) => {
      passport.booths[b.boothId] = {
        want: !!b.want,
        went: !!b.went,
        fav: !!b.fav,
        notes: b.notes ?? '',
        shareEmail: b.shareEmail ?? undefined,
      };
    });
    pours.forEach((p) => {
      passport.pours[pourKeyOf(p.boothId, p.pourId)] = {
        tasted: !!p.tasted,
        fav: !!p.fav,
      };
    });
    return passport;
  }

  async saveBooth(
    userId: string,
    eventId: string,
    boothId: string,
    booth: BoothUserState,
  ): Promise<void> {
    if (isGuest(userId)) return;
    const input: Record<string, unknown> = {
      id: this.boothStateId(userId, eventId, boothId),
      eventId,
      boothId,
      want: booth.want,
      went: booth.went,
      fav: booth.fav,
      notes: booth.notes,
    };
    // Keep an untouched opt-in absent so "off" stays distinguishable from unset.
    if (booth.shareEmail !== undefined) input.shareEmail = booth.shareEmail;
    await this.upsert(UpdateTastingBoothState, CreateTastingBoothState, input);
  }

  async savePour(
    userId: string,
    eventId: string,
    _pourKey: string,
    pour: PourStatus,
    ctx: { boothId: string; pourId: string; bottleKey?: string },
  ): Promise<void> {
    if (isGuest(userId)) return;
    const input: Record<string, unknown> = {
      id: this.pourStateId(userId, eventId, ctx.boothId, ctx.pourId),
      eventId,
      boothId: ctx.boothId,
      pourId: ctx.pourId,
      // Fall back to the pour id so a custom/mock pour still aggregates to a row.
      bottleKey: ctx.bottleKey ?? ctx.pourId,
      tasted: pour.tasted,
      fav: pour.fav,
    };
    await this.upsert(UpdateTastingPourState, CreateTastingPourState, input);
  }

  // Unlike the two reads either side of it, this one still degrades quietly: the worst a
  // wrong answer costs is one extra showing of the guide, and nothing writes over the
  // attendee's data as a result.
  async loadOnboarded(userId: string): Promise<boolean> {
    if (isGuest(userId)) return false;
    try {
      const res = await amplify.request<PrefResult>(GetTastingUserPref, { id: userId });
      return !!res.getTastingUserPref?.onboardedAt;
    } catch (err) {
      console.warn('[passport] loadOnboarded failed', err);
      return false;
    }
  }

  async saveOnboarded(userId: string, value: boolean): Promise<void> {
    if (isGuest(userId)) return;
    const input = {
      id: userId,
      onboardedAt: value ? new Date().toISOString() : null,
    };
    await this.upsert(UpdateTastingUserPref, CreateTastingUserPref, input);
  }

  // Also THROWS: `null` here means "no row yet, so this attendee shares by default", and a
  // failed read reported as `null` would re-arm sharing for someone who had opted out.
  async loadAttendance(userId: string, eventId: string): Promise<AttendanceRecord | null> {
    if (isGuest(userId)) return null;
    const res = await amplify.request<AttendanceResult>(GetTastingAttendance, {
      id: this.attendanceId(userId, eventId),
    });
    const row = res.getTastingAttendance;
    if (!row) return null;
    return {
      // A row written before this field shipped predates any opt-out, so treat
      // null as sharing — matching the default the app applies everywhere else.
      shareContact: row.shareContact ?? true,
      displayName: row.displayName ?? null,
      email: row.email ?? null,
    };
  }

  async saveAttendance(
    userId: string,
    eventId: string,
    attendance: AttendanceRecord,
  ): Promise<void> {
    if (isGuest(userId)) return;
    const input = {
      id: this.attendanceId(userId, eventId),
      eventId,
      shareContact: attendance.shareContact,
      // Opting out nulls the snapshot, so the export has nothing left to read.
      displayName: attendance.displayName,
      email: attendance.email,
    };
    try {
      await amplify.request(UpdateTastingAttendance, { input });
    } catch (updateErr) {
      // No row yet — this write is the join, so stamp the arrival time with it.
      try {
        await amplify.request(CreateTastingAttendance, {
          input: { ...input, joinedAt: new Date().toISOString() },
        });
      } catch (createErr) {
        throw upsertFailure(updateErr, createErr);
      }
    }
  }
}

export const appSyncPassportRepository: PassportRepository = new AppSyncPassportRepository();
