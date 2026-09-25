/**
 * The screen a guest was heading for when the auth gate stopped them, held across the whole
 * signup detour — login, email code, onboarding form, group swap — so the account they just
 * created lands them where they were going instead of on Home.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParams } from '@types';

const KEY = 'ws-pending-destination:v1';

// Long enough to make an account and finish onboarding at the event doors, short enough that
// an abandoned signup from last week never teleports anyone mid-browse.
const TTL_MS = 60 * 60 * 1000;

export type PendingDestination = {
  [Screen in keyof RootStackParams]: {
    name: Screen;
    params: RootStackParams[Screen];
  };
}[keyof RootStackParams];

type StoredDestination = PendingDestination & { savedAt: number };

export const savePendingDestination = async (
  destination: PendingDestination
): Promise<void> => {
  try {
    const stored: StoredDestination = { ...destination, savedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Best effort — losing the breadcrumb costs the user one tap, nothing more.
  }
};

/** Reads and clears in one go: a destination is only ever honoured once. */
export const takePendingDestination =
  async (): Promise<PendingDestination | null> => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return null;

      await AsyncStorage.removeItem(KEY);

      const { savedAt, ...destination } = JSON.parse(raw) as StoredDestination;
      if (!savedAt || Date.now() - savedAt > TTL_MS) return null;

      return destination as PendingDestination;
    } catch {
      return null;
    }
  };
