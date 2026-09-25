import { useAuth } from '@contexts';
import { useGetUser } from '@hooks';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { AsyncStoragePassportRepository } from './data/AsyncStoragePassportRepository';
import { appSyncPassportRepository } from './data/AppSyncPassportRepository';
import { PassportRepository } from './data/PassportRepository';
import { useBoothArtwork } from './data/useBoothArtwork';
import { useBrandDetails } from './data/useBrandDetails';
import { useEventLeaderboard } from './data/useEventLeaderboard';
import { useShowLeaderboard } from './data/useShowLeaderboard';
import { useTastedPours } from './data/useTastedPours';
import { useTastingEventContent } from './data/useTastingEventContent';
import {
  DEFAULT_BOOTH,
  EMPTY_POUR,
  actions,
  ensureEntry,
  getSnapshot,
  subscribe,
} from './data/passportStore';
import { visitedCount as machineVisitedCount } from './state/stateMachine';
import {
  BoothUserState,
  BrandDetail,
  ContactIdentity,
  LeaderboardRow,
  PourStatus,
  TastedPour,
  NO_EVENT,
  TastingEvent,
} from './types';

type PassportContextValue = {
  event: TastingEvent;
  /** The attendee this passport belongs to — the Cognito `sub`, or `'guest'`. */
  attendeeId: string;
  /**
   * Whether the event is running. False means the passport cannot be written to — either
   * it has not started yet or it is over — so every setter below is inert and the screens
   * say which it is. A late tap can never write a stamp the export has already been taken
   * from, and an early one cannot record a visit to a booth nobody has stood at.
   */
  isOpen: boolean;
  /** Of the two closed states, the one that is still to come rather than already over. */
  notStarted: boolean;
  loading: boolean;
  /**
   * The passport could not be shown — either the stored state failed to read, or the
   * event's own content did. Screens must render `LoadError`, never the grid.
   */
  loadFailed: boolean;
  reloadPassport: () => void;
  showLeaderboard: boolean;
  showBoothMap: boolean;
  /** Live bottle ranking for this event; empty until the first pour is stamped. */
  leaderboard: LeaderboardRow[];
  visitedCount: number;
  isComplete: boolean;
  getBooth: (boothId: string) => BoothUserState;
  /** Source-of-truth brand identity for a booth, or undefined (no account / not yet loaded). */
  getBrand: (boothId: string) => BrandDetail | undefined;
  getPour: (boothId: string, pourId: string) => PourStatus;
  boothTastedCount: (boothId: string) => number;
  /** Whether any of this booth's bottles is favorited — the other half of rule 4's default. */
  boothHasFavPour: (boothId: string) => boolean;
  tastedPours: TastedPour[];
  setWant: (boothId: string, value: boolean) => void;
  setWent: (boothId: string, value: boolean) => void;
  setFav: (boothId: string, value: boolean) => void;
  setNotes: (boothId: string, notes: string) => void;
  setShareEmail: (boothId: string, value: boolean) => void;
  setPourTasted: (boothId: string, pourId: string, value: boolean) => void;
  setPourFav: (boothId: string, pourId: string, value: boolean) => void;
  onboarded: boolean;
  markOnboarded: () => void;
  /** Event-level lead sharing — ON by default, and the master switch over every booth opt-in. */
  shareContact: boolean;
  setShareContact: (value: boolean) => void;
  /** The name and email that would be shared, so the consent copy can name them. */
  contact: ContactIdentity | null;
  /** Changes the backend has not accepted yet. Non-zero is normal and momentary. */
  unsavedCount: number;
  /** Those changes have stopped landing — the screen must stop implying they saved. */
  saveFailed: boolean;
  retrySaves: () => void;
};

const PassportContext = createContext<PassportContextValue | null>(null);

const pourKey = (boothId: string, pourId: string) => `${boothId}:${pourId}`;

type Props = {
  eventId: string;
  children: ReactNode;
  repository?: PassportRepository;
};

export const PassportProvider = ({ eventId, children, repository }: Props) => {
  const { user } = useAuth();
  // `user` is the Cognito attribute bag (see loadAuth) — the identity lives on
  // `sub`, not `id`. Passport state records are keyed by this value.
  const userId: string = user?.sub ?? 'guest';
  const isSignedIn = userId !== 'guest';

  // DB-backed content for the event the screen was opened with. Passing the id
  // matters once more than one festival is published: the passport must be the one
  // that was tapped. A read that fails resolves to nothing rather than to sample
  // content, and the screens render `LoadError` off `loadFailed` below.
  const {
    event: liveEvent,
    isOpen,
    notStarted,
    loading: contentLoading,
    failed: contentFailed,
  } = useTastingEventContent(eventId);
  const event = liveEvent ?? NO_EVENT;

  const brandDetails = useBrandDetails(event.booths);

  // The booths' own logos, reused by the bottle-keyed surfaces (leaderboard rows,
  // "Your Pours Tonight") so those badges show artwork rather than brand initials.
  const artwork = useBoothArtwork(event, brandDetails);

  const showLeaderboard = useShowLeaderboard(event);

  // Keyed on the resolved event id, so an unresolved event simply finds no counters.
  const { rows: leaderboard } = useEventLeaderboard(
    event.id,
    isSignedIn && showLeaderboard,
    artwork,
  );

  // The screen is behind the auth gate, so this is effectively always the AppSync
  // repository; the local one stays as the safety net for an unresolved session.
  const repo = useMemo(
    () =>
      repository ??
      (isSignedIn ? appSyncPassportRepository : new AsyncStoragePassportRepository()),
    [repository, isSignedIn],
  );

  // Key on the event the screen was opened with, so a read that failed still loads
  // and saves passport state under the scope a retry will land in.
  const key = useMemo(
    () => ensureEntry(userId, liveEvent?.id ?? eventId, event, repo),
    [userId, liveEvent, eventId, event, repo],
  );

  const snapshot = useSyncExternalStore(
    (listener) => subscribe(key, listener),
    () => getSnapshot(key),
  );

  // The lead snapshot is name + email, read once here and written into passport-dedicated
  // storage. The export reads it back from there — never from the user's app record.
  const { data: profile } = useGetUser();
  const contact = useMemo<ContactIdentity | null>(() => {
    const email = user?.email;
    if (!isSignedIn || !email) return null;
    return {
      displayName: profile?.personFullName || profile?.username || '',
      email,
    };
  }, [isSignedIn, user?.email, profile?.personFullName, profile?.username]);

  useEffect(() => {
    if (contact) actions.setIdentity(key, contact);
  }, [key, contact]);

  const tastedPours = useTastedPours(event, snapshot.passport.pours, isSignedIn, artwork);

  const value = useMemo<PassportContextValue>(() => {
    const { passport } = snapshot;

    // One gate for every write. Retrying already-queued saves stays allowed — those
    // were made while the event was open — and so does dismissing the guide.
    const write = (run: () => void) => {
      if (isOpen) run();
    };

    const getBooth = (boothId: string): BoothUserState =>
      passport.booths[boothId] ?? DEFAULT_BOOTH;

    const getBrand = (boothId: string): BrandDetail | undefined => {
      const booth = event.booths.find((b) => b.id === boothId);
      return booth?.brandUserId ? brandDetails.get(booth.brandUserId) : undefined;
    };

    const getPour = (boothId: string, pourId: string): PourStatus =>
      passport.pours[pourKey(boothId, pourId)] ?? EMPTY_POUR;

    // Count tasted pours by `${boothId}:` key prefix (the `:` avoids `b1` matching `b12`).
    const boothTastedCount = (boothId: string): number => {
      const prefix = `${boothId}:`;
      return Object.keys(passport.pours).filter(
        (pKey) => pKey.startsWith(prefix) && passport.pours[pKey].tasted,
      ).length;
    };

    const boothHasFavPour = (boothId: string): boolean => {
      const prefix = `${boothId}:`;
      return Object.keys(passport.pours).some(
        (pKey) => pKey.startsWith(prefix) && passport.pours[pKey].fav,
      );
    };

    const visitedCount = machineVisitedCount(Object.values(passport.booths));

    return {
      event,
      attendeeId: userId,
      isOpen,
      notStarted,
      loading: snapshot.loading || contentLoading,
      loadFailed: snapshot.loadFailed || contentFailed,
      reloadPassport: () => actions.reloadPassport(key),
      showLeaderboard,
      showBoothMap: !!event.mapImage,
      leaderboard,
      visitedCount,
      isComplete: event.booths.length > 0 && visitedCount === event.booths.length,
      getBooth,
      getBrand,
      getPour,
      boothTastedCount,
      boothHasFavPour,
      tastedPours,
      setWant: (boothId, v) => write(() => actions.setWant(key, boothId, v)),
      setWent: (boothId, v) => write(() => actions.setWent(key, boothId, v)),
      setFav: (boothId, v) => write(() => actions.setFav(key, boothId, v)),
      setNotes: (boothId, notes) => write(() => actions.setNotes(key, boothId, notes)),
      setShareEmail: (boothId, v) => write(() => actions.setShareEmail(key, boothId, v)),
      setPourTasted: (boothId, pourId, v) =>
        write(() => actions.setPourTasted(key, boothId, pourId, v)),
      setPourFav: (boothId, pourId, v) =>
        write(() => actions.setPourFav(key, boothId, pourId, v)),
      onboarded: snapshot.onboarded,
      markOnboarded: () => actions.markOnboarded(key),
      shareContact: snapshot.shareContact,
      setShareContact: (v) => write(() => actions.setShareContact(key, v)),
      contact,
      unsavedCount: snapshot.sync.pending,
      saveFailed: snapshot.sync.failed,
      retrySaves: () => actions.retrySaves(key),
    };
  }, [
    snapshot,
    event,
    contentLoading,
    contentFailed,
    isOpen,
    notStarted,
    showLeaderboard,
    leaderboard,
    tastedPours,
    key,
    userId,
    brandDetails,
    contact,
  ]);

  return <PassportContext.Provider value={value}>{children}</PassportContext.Provider>;
};

export const usePassport = (): PassportContextValue => {
  const ctx = useContext(PassportContext);
  if (!ctx) throw new Error('usePassport must be used within a PassportProvider');
  return ctx;
};
