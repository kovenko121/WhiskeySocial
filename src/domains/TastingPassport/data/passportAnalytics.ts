/**
 * Tasting Passport instrumentation.
 *
 * One module so the event names and property spellings stay in one place, and so the three
 * reporting cuts the event needs all fall out of the same stream:
 *
 *  - **per brand** — every booth-scoped event carries `brand_id` and is associated with the
 *    PostHog `brand` group, so a distiller's booth traffic, stamps and leads roll up without
 *    a join;
 *  - **per bottle** — pour events carry `bottle_key`, the same leaderboard identity the
 *    counters aggregate on, so "tastes" reconcile against the board;
 *  - **per attendee** — `user_id` is on everything, and PostHog already identifies the user
 *    at sign-in, so per-attendee funnels need nothing extra.
 *
 * Booth-level events fire from the store, where every toggle passes through regardless of
 * which screen raised it. Screen views fire from the screens.
 *
 * `brand_name` is the booth's event-sheet label rather than the brand record's name: the
 * store has the event content, not the live `BrandDetail`, and the label is what the
 * exhibitor list and every report already call them.
 */
import { capturePostHogEvent } from '../../../config/posthog';
import { PostHogEventName, PostHogProperties } from '../../../types/posthog';
import { Booth, Pour, TastingEvent } from '../types';

/**
 * Reporting must never cost the attendee a stamp. These fire from inside the store's
 * actions, on the same synchronous path as the write that produced them — one throw out of
 * the SDK would take the toggle with it, and in `applyShareContact` it would land between
 * the consent change and the write that persists it. Analytics is the expendable half.
 */
const capture = (
  name: PostHogEventName,
  properties: PostHogProperties,
  groups?: { brand?: string },
): void => {
  try {
    capturePostHogEvent(name, properties, groups);
  } catch {
    // Swallowed on purpose — see above.
  }
};

/** Which of the three booth toggles moved. */
export type BoothMark = 'togo' | 'visited' | 'favorite';

const boothIn = (event: TastingEvent, boothId: string): Booth | undefined =>
  event.booths.find((booth) => booth.id === boothId);

const pourIn = (booth: Booth | undefined, pourId: string): Pour | undefined =>
  booth?.pours.find((pour) => pour.id === pourId);

const eventProps = (event: TastingEvent, userId: string): PostHogProperties => ({
  event_id: event.id,
  event_name: event.name,
  user_id: userId,
  is_guest: userId === 'guest',
  timestamp: new Date().toISOString(),
});

const boothProps = (booth: Booth | undefined): PostHogProperties => ({
  booth_id: booth?.id,
  brand_id: booth?.brandUserId,
  brand_name: booth?.name,
});

const pourProps = (pour: Pour | undefined, pourId: string): PostHogProperties => ({
  bottle_id: pourId,
  // Mirrors the repository's fallback so a pour with no catalogue link still lines up
  // with the leaderboard row it produced.
  bottle_key: pour?.bottleKey ?? pourId,
  bottle_name: pour?.name,
  bottle_brand: pour?.brand,
});

export const trackPassportOpened = (
  event: TastingEvent,
  userId: string,
  visitedCount: number,
): void =>
  capture('passport_opened', {
    ...eventProps(event, userId),
    booth_count: event.booths.length,
    visited_count: visitedCount,
  });

export const trackBoothViewed = (
  event: TastingEvent,
  userId: string,
  boothId: string,
): void => {
  const booth = boothIn(event, boothId);
  capture(
    'passport_booth_viewed',
    { ...eventProps(event, userId), ...boothProps(booth) },
    { brand: booth?.brandUserId },
  );
};

export const trackBoothMarked = (
  event: TastingEvent,
  userId: string,
  boothId: string,
  mark: BoothMark,
  value: boolean,
): void => {
  const booth = boothIn(event, boothId);
  capture(
    'passport_booth_marked',
    { ...eventProps(event, userId), ...boothProps(booth), mark, value },
    { brand: booth?.brandUserId },
  );
};

export const trackPourTasted = (
  event: TastingEvent,
  userId: string,
  boothId: string,
  pourId: string,
  tasted: boolean,
): void => {
  const booth = boothIn(event, boothId);
  capture(
    'passport_pour_tasted',
    {
      ...eventProps(event, userId),
      ...boothProps(booth),
      ...pourProps(pourIn(booth, pourId), pourId),
      tasted,
    },
    { brand: booth?.brandUserId },
  );
};

export const trackPourFavorited = (
  event: TastingEvent,
  userId: string,
  boothId: string,
  pourId: string,
  favorited: boolean,
): void => {
  const booth = boothIn(event, boothId);
  capture(
    'passport_pour_favorited',
    {
      ...eventProps(event, userId),
      ...boothProps(booth),
      ...pourProps(pourIn(booth, pourId), pourId),
      favorited,
    },
    { brand: booth?.brandUserId },
  );
};

/**
 * A lead signal changing hands. `scope` separates the per-booth switch from the event-level
 * master switch, which has no booth attached — the address either reaches one distiller or
 * all of them, and the report has to tell those apart.
 */
export const trackLeadOptIn = (
  event: TastingEvent,
  userId: string,
  optedIn: boolean,
  boothId?: string,
): void => {
  const booth = boothId ? boothIn(event, boothId) : undefined;
  capture(
    'passport_lead_opt_in',
    {
      ...eventProps(event, userId),
      ...boothProps(booth),
      scope: boothId ? 'booth' : 'event',
      opted_in: optedIn,
    },
    { brand: booth?.brandUserId },
  );
};

export const trackLeaderboardViewed = (
  event: TastingEvent,
  userId: string,
  rowCount: number,
): void =>
  capture('passport_leaderboard_viewed', {
    ...eventProps(event, userId),
    row_count: rowCount,
  });

export const trackPassportCompleted = (event: TastingEvent, userId: string): void =>
  capture('passport_completed', {
    ...eventProps(event, userId),
    booth_count: event.booths.length,
  });
