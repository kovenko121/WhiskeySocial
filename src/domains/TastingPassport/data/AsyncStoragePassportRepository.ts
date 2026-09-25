/* eslint-disable class-methods-use-this -- stateless implementation of the PassportRepository interface */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceRecord, BoothUserState, PersistedPassport, PourStatus } from '../types';
import { PassportRepository } from './PassportRepository';

// Per-user key: dismissing the guide must not hide it from a different user on the same device.
const onboardedKey = (userId: string) => `ws-passport-onboarded:${userId}`;

const attendanceKey = (userId: string, eventId: string) =>
  `ws-passport-attendance:${userId}:${eventId}`;

const passportKey = (userId: string, eventId: string) =>
  `ws-passport:v1:${userId}:${eventId}`;

const emptyPassport = (): PersistedPassport => ({ booths: {}, pours: {} });

export class AsyncStoragePassportRepository implements PassportRepository {
  // No key at all is a genuinely empty passport. A key we could not read or parse is NOT —
  // reporting it as empty is what let the next tap write that emptiness back over a real
  // passport, so it throws and the screen says so instead.
  private async read(userId: string, eventId: string): Promise<PersistedPassport> {
    const raw = await AsyncStorage.getItem(passportKey(userId, eventId));
    if (!raw) return emptyPassport();
    const parsed = JSON.parse(raw) as Partial<PersistedPassport>;
    return {
      booths: parsed.booths ?? {},
      pours: parsed.pours ?? {},
    };
  }

  // The write path can't refuse to save just because the stored blob is unreadable — the
  // record in hand is newer than whatever is down there. Merging onto empty at least lands it.
  private async readForMerge(userId: string, eventId: string): Promise<PersistedPassport> {
    try {
      return await this.read(userId, eventId);
    } catch {
      return emptyPassport();
    }
  }

  private async write(
    userId: string,
    eventId: string,
    passport: PersistedPassport,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(passportKey(userId, eventId), JSON.stringify(passport));
    } catch {
      // Best-effort; the provider holds the source of truth in memory.
    }
  }

  async loadPassport(userId: string, eventId: string): Promise<PersistedPassport> {
    return this.read(userId, eventId);
  }

  async saveBooth(
    userId: string,
    eventId: string,
    boothId: string,
    booth: BoothUserState,
  ): Promise<void> {
    const passport = await this.readForMerge(userId, eventId);
    passport.booths[boothId] = booth;
    await this.write(userId, eventId, passport);
  }

  async savePour(
    userId: string,
    eventId: string,
    pourKey: string,
    pour: PourStatus,
    // Content context is only needed by the backend repository; ignored here.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx?: { boothId: string; pourId: string; bottleKey?: string },
  ): Promise<void> {
    const passport = await this.readForMerge(userId, eventId);
    passport.pours[pourKey] = pour;
    await this.write(userId, eventId, passport);
  }

  async loadOnboarded(userId: string): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(onboardedKey(userId))) === 'true';
    } catch {
      return false;
    }
  }

  async saveOnboarded(userId: string, value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(onboardedKey(userId), value ? 'true' : 'false');
    } catch {
      // Non-fatal: worst case the guide shows once more.
    }
  }

  // Guests and offline sessions keep the choice on-device; nothing leaves the phone
  // until they sign in, at which point the AppSync repository takes over.
  async loadAttendance(userId: string, eventId: string): Promise<AttendanceRecord | null> {
    const raw = await AsyncStorage.getItem(attendanceKey(userId, eventId));
    if (!raw) return null;
    // Throws on a corrupt row rather than reporting `null`, which reads as "never opted
    // out" and would quietly re-arm sharing.
    return JSON.parse(raw) as AttendanceRecord;
  }

  async saveAttendance(
    userId: string,
    eventId: string,
    attendance: AttendanceRecord,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(attendanceKey(userId, eventId), JSON.stringify(attendance));
    } catch {
      // Best-effort; the provider holds the source of truth in memory.
    }
  }
}

export const passportRepository: PassportRepository = new AsyncStoragePassportRepository();
