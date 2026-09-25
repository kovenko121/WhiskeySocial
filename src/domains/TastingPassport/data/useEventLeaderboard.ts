import { amplify } from '@services';
import { S3Object } from '@types';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useSyncExternalStore } from 'react';
import { LeaderboardRow } from '../types';
import { createLogger } from '../../../services/logger';
import { EventLeaderboard } from './leaderboardQuery';
import {
  LeaderboardDelta,
  observeCounters,
  pendingDeltas,
  subscribeDeltas,
} from './leaderboardDeltas';
import { BoothArtwork } from './useBoothArtwork';
import { SearchWhiskeysByIds } from './whiskeysByIdsQuery';
import { SearchPassportBrands } from './brandDetailsQuery';

const logger = createLogger('eventLeaderboard');

const PAGE_LIMIT = 200;
/** searchWhiskeys page cap for the id batch; the board is chunked to match. */
const BOTTLE_BATCH = 100;
/** "Live Updates" only ever has to mean "recent" — polling beats a socket on venue wifi. */
const REFRESH_MS = 30 * 1000;
const EMPTY: LeaderboardRow[] = [];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RawCounter = {
  id: string;
  bottleKey: string;
  bottleName?: string | null;
  brand?: string | null;
  count?: number | null;
  /** The echo the delta overlay reconciles against; see `leaderboardDeltas`. */
  updatedAt?: string | null;
};

/** A counter ranked but not yet named — `bottleKey` survives so it can be resolved. */
type RankedCounter = LeaderboardRow & { bottleKey: string };

type Page = { items: (RawCounter | null)[] | null; nextToken: string | null };
type CounterResponse = { listTastingLeaderboardCounters: Page | null };

type RawBottle = {
  id: string;
  name?: string | null;
  brand?: string | null;
  brandId?: string | null;
  picture?: S3Object | null;
  brandPicture?: S3Object | null;
};
type BottleResponse = { searchWhiskeys: { items: (RawBottle | null)[] | null } | null };

type RawBrand = {
  id: string;
  brandName?: string | null;
  brandLogo?: S3Object | null;
};
type BrandResponse = { searchUsers: { items: (RawBrand | null)[] | null } | null };

type BottleDisplay = {
  name: string;
  brand: string;
  brandId?: string;
  image?: S3Object | null;
};
type BrandDisplay = { name: string; logo?: S3Object | null };

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const rank = (counters: RawCounter[]): RankedCounter[] =>
  counters
    .filter((counter) => (counter.count ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.count ?? 0) - (a.count ?? 0) ||
        (a.bottleName ?? a.bottleKey).localeCompare(b.bottleName ?? b.bottleKey),
    )
    .map((counter, index) => ({
      rank: index + 1,
      brand: counter.brand ?? '',
      // A bare key is never shown as a title — a readable curated key can be,
      // a raw id cannot. Hydration below replaces both when it resolves.
      bottle:
        counter.bottleName ??
        (UUID_PATTERN.test(counter.bottleKey) ? '' : counter.bottleKey),
      count: counter.count ?? 0,
      bottleKey: counter.bottleKey,
    }));

const fetchLeaderboard = async (eventId: string): Promise<RawCounter[]> => {
  const counters: RawCounter[] = [];
  let nextToken: string | null = null;
  do {
    // eslint-disable-next-line no-await-in-loop -- cursor pagination is inherently sequential
    const res: CounterResponse = await amplify.request<CounterResponse>(
      EventLeaderboard,
      { eventId, limit: PAGE_LIMIT, nextToken },
    );
    const page = res.listTastingLeaderboardCounters;
    (page?.items ?? []).forEach((item) => {
      if (item?.bottleKey) counters.push(item);
    });
    nextToken = page?.nextToken ?? null;
  } while (nextToken);
  observeCounters(eventId, counters);
  return counters;
};

/**
 * Lay the attendee's un-landed taps over the server's counters. A bottle nobody has tasted
 * yet has no counter row at all, so it is synthesized here rather than waiting out a poll to
 * appear — the first person to stamp a pour is the likeliest person to go looking for it.
 */
const applyDeltas = (
  counters: RawCounter[],
  deltas: Map<string, LeaderboardDelta>,
): RawCounter[] => {
  if (deltas.size === 0) return counters;

  const merged = counters.map((counter) => {
    const pending = deltas.get(counter.bottleKey);
    if (!pending) return counter;
    return { ...counter, count: (counter.count ?? 0) + pending.delta };
  });

  const known = new Set(counters.map((counter) => counter.bottleKey));
  deltas.forEach((pending, bottleKey) => {
    if (known.has(bottleKey)) return;
    merged.push({
      id: bottleKey,
      bottleKey,
      bottleName: pending.bottleName,
      brand: pending.brand,
      count: pending.delta,
    });
  });
  return merged;
};

const fetchBottles = async (ids: string[]): Promise<Map<string, BottleDisplay>> => {
  // Batches are independent id lookups — a board big enough to need more than
  // one is rare, and running them together keeps the board's first paint quick.
  const pages = await Promise.all(
    chunk(ids, BOTTLE_BATCH).map((batch) =>
      amplify.request<BottleResponse>(SearchWhiskeysByIds, {
        filter: { or: batch.map((id) => ({ id: { eq: id } })) },
        limit: BOTTLE_BATCH,
      }),
    ),
  );

  const map = new Map<string, BottleDisplay>();
  pages.forEach((page) => {
    (page.searchWhiskeys?.items ?? []).forEach((item) => {
      if (!item?.id) return;
      map.set(item.id, {
        name: item.name ?? '',
        brand: item.brand ?? '',
        brandId: item.brandId ?? undefined,
        image: item.brandPicture ?? item.picture ?? null,
      });
    });
  });
  return map;
};

/**
 * Brand identity for bottles whose catalogue row carries a `brandId` but no
 * `brand` string — common enough that the booth screen has the same fallback.
 */
const fetchBrands = async (ids: string[]): Promise<Map<string, BrandDisplay>> => {
  const pages = await Promise.all(
    chunk(ids, BOTTLE_BATCH).map((batch) =>
      amplify.request<BrandResponse>(SearchPassportBrands, {
        nextToken: null,
        limit: BOTTLE_BATCH,
        filter: { or: batch.map((id) => ({ id: { eq: id } })) },
      }),
    ),
  );

  const map = new Map<string, BrandDisplay>();
  pages.forEach((res) => {
    (res.searchUsers?.items ?? []).forEach((item) => {
      if (!item?.id) return;
      map.set(item.id, {
        name: item.brandName ?? '',
        logo: item.brandLogo ?? null,
      });
    });
  });
  return map;
};

/**
 * `artwork` carries the booths' own brand logos. A counter that already knows its bottle and
 * brand never reaches the catalogue lookup below — the common case for a curated pour — so
 * without it the row badge would show initials for a brand whose logo is already on screen.
 */
const hydrate = (
  ranked: RankedCounter[],
  bottles: Map<string, BottleDisplay>,
  brands: Map<string, BrandDisplay>,
  artwork: BoothArtwork,
): LeaderboardRow[] =>
  ranked.map(({ bottleKey, ...row }) => {
    const bottle = bottles.get(bottleKey);
    if (!bottle) {
      return {
        ...row,
        bottle: row.bottle || 'Unnamed bottle',
        image: artwork.forBottle(bottleKey, row.brand),
      };
    }
    const brand = bottle.brandId ? brands.get(bottle.brandId) : undefined;
    return {
      ...row,
      // The brand account is the source of truth for identity; the catalogue's
      // free-text `brand` is only a stand-in when the bottle has no account.
      brand: row.brand || bottle.brand || brand?.name || '',
      bottle: row.bottle || bottle.name || 'Unnamed bottle',
      image:
        brand?.logo ??
        artwork.forBottle(bottleKey, row.brand || bottle.brand) ??
        bottle.image,
    };
  });

/**
 * The live bottle ranking for one event, ranked here rather than server-side —
 * the counters carry no sort key. Returns an empty list until the first pour of
 * the night is stamped; callers show an empty state rather than sample rows.
 *
 * The attendee's own taps are overlaid from `leaderboardDeltas` so they land at once;
 * everyone else's arrive on the poll.
 *
 * `enabled` should be true only for signed-in users (the models are private-auth).
 */
export const useEventLeaderboard = (
  eventId: string,
  enabled: boolean,
  artwork: BoothArtwork,
): { rows: LeaderboardRow[]; loading: boolean; refetch: () => Promise<unknown> } => {
  const {
    data: counters,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tastingLeaderboard', eventId],
    queryFn: async () => {
      try {
        return await fetchLeaderboard(eventId);
      } catch (error) {
        // An empty board is a better failure than stale or invented rows.
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to fetch tasting leaderboard:', normalizedError);
        return null;
      }
    },
    enabled: enabled && !!eventId,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
    // Opted in per query: the app-wide default is off, so returning to the app doesn't
    // refetch every screen at once. See `services/react-query`.
    refetchOnWindowFocus: true,
  });

  const deltas = useSyncExternalStore(subscribeDeltas, () => pendingDeltas(eventId));

  // A failed fetch overlays nothing — the attendee's own rows standing alone would be
  // exactly the invented board the empty state exists to avoid.
  const ranked = useMemo(
    () => (counters ? rank(applyDeltas(counters, deltas)) : []),
    [counters, deltas],
  );

  // Only the rows the counter could not name; a fully-named board skips this entirely.
  const unresolved = ranked
    .filter((row) => !row.bottle || !row.brand)
    .map((row) => row.bottleKey)
    .filter((key) => UUID_PATTERN.test(key));
  const unresolvedIds = [...new Set(unresolved)].sort();

  const { data: bottles } = useQuery({
    queryKey: ['tastingLeaderboardBottles', unresolvedIds.join(',')],
    queryFn: async () => {
      try {
        return await fetchBottles(unresolvedIds);
      } catch (error) {
        // Degrade to whatever the counter row carried — never blank the board.
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to resolve leaderboard bottles:', normalizedError);
        return new Map<string, BottleDisplay>();
      }
    },
    enabled: unresolvedIds.length > 0,
    staleTime: 30 * 60 * 1000,
  });

  // Bottles whose catalogue row named no brand, but points at a brand account.
  const brandIds = [
    ...new Set(
      [...(bottles?.values() ?? [])]
        .filter((bottle) => !bottle.brand && bottle.brandId)
        .map((bottle) => bottle.brandId as string),
    ),
  ].sort();

  const { data: brands } = useQuery({
    queryKey: ['tastingLeaderboardBrands', brandIds.join(',')],
    queryFn: async () => {
      try {
        return await fetchBrands(brandIds);
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to resolve leaderboard brands:', normalizedError);
        return new Map<string, BrandDisplay>();
      }
    },
    enabled: brandIds.length > 0,
    staleTime: 30 * 60 * 1000,
  });

  if (!ranked.length) return { rows: EMPTY, loading: enabled && isLoading, refetch };

  return {
    rows: hydrate(ranked, bottles ?? new Map(), brands ?? new Map(), artwork),
    loading: enabled && isLoading,
    refetch,
  };
};
