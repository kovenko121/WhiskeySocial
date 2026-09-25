import { AttendanceRecord, BoothUserState, PersistedPassport, PourStatus } from '../types';

export interface PassportRepository {
  /**
   * REJECTS when the passport could not be read. Implementations must not degrade to an
   * empty passport: the store cannot tell that apart from a first-time attendee, would
   * render an unstamped grid, and the next toggle would write that emptiness back over
   * the stored record. An empty result must mean "genuinely nothing stored".
   */
  loadPassport(userId: string, eventId: string): Promise<PersistedPassport>;

  saveBooth(
    userId: string,
    eventId: string,
    boothId: string,
    booth: BoothUserState,
  ): Promise<void>;

  savePour(
    userId: string,
    eventId: string,
    pourKey: string,
    pour: PourStatus,
    // Content context the backend needs to write a per-pour state row; the
    // AsyncStorage repository ignores it. `bottleKey` is the leaderboard identity
    // (falls back to `pourId` when the content carries none).
    ctx: { boothId: string; pourId: string; bottleKey?: string },
  ): Promise<void>;

  // Onboarding flag is per-USER, not per-device — backend stores it on the user record.
  loadOnboarded(userId: string): Promise<boolean>;
  saveOnboarded(userId: string, value: boolean): Promise<void>;

  // The event-scoped lead contact snapshot. `null` means no row yet — a first-time
  // attendee, who shares by default until they say otherwise. REJECTS on a failed read,
  // for the same reason as `loadPassport`: `null` would re-arm sharing for an opt-out.
  loadAttendance(userId: string, eventId: string): Promise<AttendanceRecord | null>;
  saveAttendance(
    userId: string,
    eventId: string,
    attendance: AttendanceRecord,
  ): Promise<void>;
}

export const pourKeyOf = (boothId: string, pourId: string): string => `${boothId}:${pourId}`;
