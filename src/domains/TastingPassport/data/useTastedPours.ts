import { amplify } from '@services';
import { S3Object } from '@types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pour, PourStatus, TastedPour, TastingEvent } from '../types';
import { joinWhiskeyTypes } from '../utils';
import { createLogger } from '../../../services/logger';
import { BoothArtwork } from './useBoothArtwork';
import { SearchWhiskeysByIds } from './whiskeysByIdsQuery';

const logger = createLogger('tastedPours');

const BATCH = 100;
const EMPTY: TastedPour[] = [];

type RawWhiskey = {
  id: string;
  name?: string | null;
  brand?: string | null;
  type?: (string | null)[] | null;
  proof?: number | null;
  calculatedRating?: number | null;
  picture?: S3Object | null;
  brandPicture?: S3Object | null;
};
type Response = { searchWhiskeys: { items: (RawWhiskey | null)[] | null } | null };

/** The catalogue half of a tasted card — everything but the user's own state. */
type PourContent = Pour & { brandImage?: S3Object | null };

/** One tasted entry as recorded in passport state, before it has a name. */
type TastedRef = { boothId: string; pourId: string; fav: boolean; order: number };

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/**
 * Every tasted pour in state, ordered by where its booth sits in the grid so the
 * list stays stable across refetches. The key is `${boothId}:${pourId}` and both
 * halves are ids that may contain '-' but never ':', so the first ':' splits it.
 */
const tastedRefs = (
  event: TastingEvent,
  pourStates: Record<string, PourStatus>,
): TastedRef[] => {
  const boothOrder = new Map(event.booths.map((booth, index) => [booth.id, index]));
  return Object.entries(pourStates)
    .filter(([, status]) => status.tasted)
    .map(([key, status]) => {
      const split = key.indexOf(':');
      const boothId = key.slice(0, split);
      return {
        boothId,
        pourId: key.slice(split + 1),
        fav: status.fav,
        order: boothOrder.get(boothId) ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((ref) => Boolean(ref.boothId) && Boolean(ref.pourId))
    .sort((a, b) => a.order - b.order);
};

const fetchWhiskeys = async (ids: string[]): Promise<Map<string, PourContent>> => {
  const pages = await Promise.all(
    chunk(ids, BATCH).map((batch) =>
      amplify.request<Response>(SearchWhiskeysByIds, {
        filter: { or: batch.map((id) => ({ id: { eq: id } })) },
        limit: BATCH,
      }),
    ),
  );

  const map = new Map<string, PourContent>();
  pages.forEach((page) => {
    (page.searchWhiskeys?.items ?? []).forEach((item) => {
      if (!item?.id) return;
      map.set(item.id, {
        id: item.id,
        name: item.name ?? '',
        brand: item.brand ?? '',
        tag: joinWhiskeyTypes(item.type),
        rating: item.calculatedRating ?? null,
        proof: item.proof ?? null,
        image: item.picture ?? null,
        brandImage: item.brandPicture ?? null,
      });
    });
  });
  return map;
};

/**
 * "Your Pours Tonight", built from what the attendee actually tapped.
 *
 * Driven by passport state rather than by the event's `booths[].pours`: an
 * uncurated booth lists the brand's catalogue instead, so those tasted pours
 * have no matching CMS `TastingPour` row to read a name from. Curated pours
 * resolve from the event content first — free, already in memory — and only
 * the rest go to the catalogue.
 */
export const useTastedPours = (
  event: TastingEvent,
  pourStates: Record<string, PourStatus>,
  enabled: boolean,
  artwork: BoothArtwork,
): TastedPour[] => {
  const refs = useMemo(() => tastedRefs(event, pourStates), [event, pourStates]);

  // Curated pours carry the CMS bottle shot but no brand logo; the booth's own logo fills the chip.
  const fromEvent = useMemo(() => {
    const map = new Map<string, PourContent>();
    event.booths.forEach((booth) => {
      booth.pours.forEach((pour) => map.set(pour.id, pour));
    });
    return map;
  }, [event]);

  const missingIds = useMemo(
    () =>
      [...new Set(refs.map((ref) => ref.pourId).filter((id) => !fromEvent.has(id)))].sort(),
    [refs, fromEvent],
  );

  const { data: resolved } = useQuery({
    queryKey: ['tastedPourDetails', missingIds.join(',')],
    queryFn: async () => {
      try {
        return await fetchWhiskeys(missingIds);
      } catch (error) {
        // The pour stays counted and stamped; only its card can't be drawn.
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to resolve tasted pours:', normalizedError);
        return new Map<string, PourContent>();
      }
    },
    enabled: enabled && missingIds.length > 0,
    staleTime: 30 * 60 * 1000,
  });

  return useMemo(() => {
    if (refs.length === 0) return EMPTY;
    return refs.reduce<TastedPour[]>((acc, ref) => {
      const pour = fromEvent.get(ref.pourId) ?? resolved?.get(ref.pourId);
      // Drop rather than render a nameless card — it reappears once resolved.
      if (pour) {
        acc.push({
          ...pour,
          boothId: ref.boothId,
          fav: ref.fav,
          brandImage: pour.brandImage ?? artwork.forBooth(ref.boothId),
        });
      }
      return acc;
    }, []);
  }, [refs, fromEvent, resolved, artwork]);
};
