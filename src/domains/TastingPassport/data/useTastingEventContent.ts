import { useAuth } from '@contexts';
import { amplify, amplifyApiKey } from '@services';
import { GraphQLClient } from 'graphql-request';
import { S3Object } from '@types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { Booth, Pour, TastingEvent } from '../types';
import { joinWhiskeyTypes } from '../utils';
import { createLogger } from '../../../services/logger';
import {
  LiveTastingEvents,
  TastingBoothsByEvent,
  TastingPoursPage,
} from './tastingEventContentQuery';
import {
  TastingEventStatus,
  isEventStamping,
  isEventNotStarted,
  nextTransitionAt,
  openEvents,
  pastEvents,
} from './eventWindow';
import { useIsAdmin } from '../../../hooks/admin/useIsAdmin';
import { SearchWhiskeysByIds } from './whiskeysByIdsQuery';

const logger = createLogger('tastingEventContent');

/**
 * Furthest ahead a wake-up is worth arming; beyond it, the next app open refetches.
 * Kept clear of the open window itself, or the closing boundary of an event that has
 * only just gone live would fall outside it and never be armed.
 */
const MAX_SCHEDULED_WAKE_MS = 48 * 60 * 60 * 1000;

type RawPour = {
  id: string;
  boothId: string;
  name: string;
  brand?: string | null;
  tag?: string | null;
  proof?: number | null;
  rating?: number | null;
  bottleKey?: string | null;
  whiskeyRefId?: string | null;
  picture?: S3Object | null;
  order?: number | null;
};
type RawBooth = {
  id: string;
  name: string;
  brandRefId?: string | null;
  location?: string | null;
  boothNumber?: string | null;
  logo?: S3Object | null;
};
type RawEvent = {
  id: string;
  title: string;
  description?: string | null;
  status?: TastingEventStatus | null;
  publishAt?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  image?: S3Object | null;
  mapImage?: S3Object | null;
  hostBoothNumber?: string | null;
};
type EventResponse = {
  listTastingEvents: { items: RawEvent[]; nextToken?: string | null } | null;
};
type BoothResponse = {
  listTastingBooths: { items: RawBooth[]; nextToken?: string | null } | null;
};
type PourResponse = {
  listTastingPours: { items: RawPour[]; nextToken?: string | null } | null;
};
type TypeResponse = {
  searchWhiskeys: {
    items:
      | ({
          id: string;
          type?: (string | null)[] | null;
          picture?: S3Object | null;
        } | null)[]
      | null;
  } | null;
};

/** What a curated pour can borrow from the bottle it was authored from. */
type CatalogueFill = { tag?: string; picture?: S3Object };

/** An event as the Discover list and the events screen need it — no booths, no pours. */
export type TastingEventSummary = {
  id: string;
  name: string;
  venue: string;
  /** Unpublished, and only ever reaching an admin. The card marks it so. */
  isDraft: boolean;
  /** Listed, but not started — browsable, and nothing can be stamped yet. */
  notStarted: boolean;
  image?: S3Object | null;
};

/**
 * Pours keep the position curation gave them inside a booth; anything the CMS never
 * numbered sorts last, alphabetically rather than by scan order.
 */
const byOrderThenName = (
  a: { order?: number | null; name: string },
  b: { order?: number | null; name: string }
) => {
  const left = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
  const right = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
  if (left !== right) return left - right;
  return a.name.localeCompare(b.name);
};

/**
 * The brand list reads like a printed directory: A→Z by booth name, with no curated
 * position to fall back on, so a booth the CMS never numbered lands in its correct
 * alphabetical place rather than at the end.
 */
const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name);

const mapPour = (p: RawPour): Pour => ({
  id: p.id,
  name: p.name,
  brand: p.brand ?? '',
  tag: p.tag ?? '',
  // Left null when the CMS has none — see the note on `Pour.proof`.
  rating: p.rating ?? null,
  proof: p.proof ?? null,
  image: p.picture ?? null,
  bottleKey: p.bottleKey ?? undefined,
  whiskeyRefId: p.whiskeyRefId ?? undefined,
});

const mapBooth = (b: RawBooth, pours: RawPour[]): Booth => ({
  id: b.id,
  name: b.name,
  brandUserId: b.brandRefId ?? undefined,
  location: b.location ?? undefined,
  boothNumber: b.boothNumber ?? undefined,
  logo: b.logo ?? null,
  darkLogo: false,
  pours: pours.slice().sort(byOrderThenName).map(mapPour),
});

const mapEvent = (
  e: RawEvent,
  booths: RawBooth[],
  poursByBooth: Map<string, RawPour[]>
): TastingEvent => ({
  id: e.id,
  name: e.title,
  // The backend keeps date/location in the free-text description (rule: no split fields).
  dateLabel: '',
  timeLabel: '',
  venue: e.description ?? '',
  image: e.image ?? null,
  mapImage: e.mapImage ?? null,
  hostBoothNumber: e.hostBoothNumber ?? undefined,
  booths: booths
    .slice()
    .sort(byName)
    .map((booth) => mapBooth(booth, poursByBooth.get(booth.id) ?? [])),
});

const summarizeRaw = (e: RawEvent): TastingEventSummary => ({
  id: e.id,
  name: e.title,
  venue: e.description ?? '',
  isDraft: e.status === 'DRAFT',
  notStarted: isEventNotStarted(e, Date.now()),
  image: e.image ?? null,
});

/** Walks every page so a growing roster can never be silently truncated. */
const fetchAllPages = async <TResponse, TItem>(
  client: GraphQLClient,
  document: string,
  variables: Record<string, unknown>,
  read: (res: TResponse) => { items: TItem[]; nextToken?: string | null } | null
): Promise<TItem[]> => {
  const items: TItem[] = [];
  let nextToken: string | null | undefined;
  do {
    // eslint-disable-next-line no-await-in-loop -- cursor pagination is inherently sequential
    const res = await client.request<TResponse>(document, {
      ...variables,
      nextToken: nextToken ?? null,
    });
    const page = read(res);
    items.push(...(page?.items ?? []));
    nextToken = page?.nextToken;
  } while (nextToken);
  return items;
};

const OPEN_STATUSES = [
  { status: { eq: 'PUBLISHED' } },
  { status: { eq: 'SCHEDULED' } },
];

/**
 * What this account is allowed to be sent. An admin asks for drafts as well, so a
 * festival still being built can be checked on a real device; nobody else receives
 * one, so there is no unpublished row on the wire to hide in the first place.
 */
const eventStatusFilter = (isAdmin: boolean) => ({
  or: isAdmin ? [...OPEN_STATUSES, { status: { eq: 'DRAFT' } }] : OPEN_STATUSES,
});

/**
 * Every event the clock says is on right now, plus the moment that answer next
 * changes. `failed` separates a query that could not run from a straight "nothing is
 * on"; neither invents an event, but only the first is worth retrying.
 */
type OpenEvents = {
  events: RawEvent[];
  past: RawEvent[];
  failed: boolean;
  nextChangeAt: number | null;
};

/**
 * Reads the whole roster and splits it the way Discover shows it: what is current —
 * running, or listed ahead of its start — and what has finished. Both come from one
 * read, and the reported change time covers every boundary in either list, so a
 * festival crossing from one to the other needs nothing but the timer.
 *
 * Booths and pours are not touched here: Discover only needs the names, and pulling
 * every pour to draw a card would be paid on every app open.
 */
const fetchOpenEvents = async (
  client: GraphQLClient,
  isAdmin: boolean
): Promise<OpenEvents> => {
  try {
    const candidates = await fetchAllPages<EventResponse, RawEvent>(
      client,
      LiveTastingEvents,
      { filter: eventStatusFilter(isAdmin) },
      (page) => page.listTastingEvents
    );

    const now = Date.now();
    const events = openEvents(candidates, now, isAdmin);
    const past = pastEvents(candidates, now, isAdmin);
    if (events.length === 0) logger.info('No tasting event is on right now');

    return {
      events,
      past,
      failed: false,
      nextChangeAt: nextTransitionAt(candidates, now),
    };
  } catch (error) {
    // Swallowed on purpose so the event night never shows a broken screen, but
    // logged so a failing query is distinguishable from "nothing is open".
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to fetch the open tasting events:', normalizedError);
    return { events: [], past: [], failed: true, nextChangeAt: null };
  }
};

type EventContent = { event: TastingEvent | null; failed: boolean };

/**
 * Booths and pours for one event, stitched together here — see the queries for why
 * the nested connections drop anything curated without an order.
 */
const fetchEventContent = async (
  client: GraphQLClient,
  event: RawEvent
): Promise<EventContent> => {
  try {
    const booths = await fetchAllPages<BoothResponse, RawBooth>(
      client,
      TastingBoothsByEvent,
      { eventId: event.id },
      (page) => page.listTastingBooths
    );

    const boothIds = new Set(booths.map((booth) => booth.id));
    const pours = await fetchAllPages<PourResponse, RawPour>(
      client,
      TastingPoursPage,
      {},
      (page) => page.listTastingPours
    );

    const poursByBooth = new Map<string, RawPour[]>();
    pours.forEach((pour) => {
      if (!boothIds.has(pour.boothId)) return;
      const bucket = poursByBooth.get(pour.boothId);
      if (bucket) bucket.push(pour);
      else poursByBooth.set(pour.boothId, [pour]);
    });

    return { event: mapEvent(event, booths, poursByBooth), failed: false };
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to fetch the tasting event content:', normalizedError);
    return { event: null, failed: true };
  }
};

/** Linked bottles whose pour was curated with a gap — the ids to go ask the catalogue about. */
const incompleteRefIds = (event: TastingEvent | null): string[] => {
  if (!event) return [];
  const ids = event.booths.flatMap((booth) =>
    booth.pours
      .filter((pour) => (!pour.tag || !pour.image) && pour.whiskeyRefId)
      .map((pour) => pour.whiskeyRefId as string)
  );
  return [...new Set(ids)].sort();
};

const fetchCatalogueFills = async (
  ids: string[]
): Promise<Map<string, CatalogueFill>> => {
  const fills = new Map<string, CatalogueFill>();
  try {
    const res = await amplify.request<TypeResponse>(SearchWhiskeysByIds, {
      filter: { or: ids.map((id) => ({ id: { eq: id } })) },
      limit: ids.length,
    });
    (res.searchWhiskeys?.items ?? []).forEach((item) => {
      if (!item?.id) return;
      const tag = joinWhiskeyTypes(item.type);
      const fill: CatalogueFill = {};
      if (tag) fill.tag = tag;
      if (item.picture) fill.picture = item.picture;
      if (fill.tag || fill.picture) fills.set(item.id, fill);
    });
  } catch (error) {
    // A gap costs the card its style line or its bottle shot; never the pour itself.
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    logger.error(
      'Failed to resolve pour details from the catalogue:',
      normalizedError
    );
  }
  return fills;
};

/** Rebuild the event only when a lookup actually filled something in. */
const withCatalogueFills = (
  event: TastingEvent | null,
  fills: Map<string, CatalogueFill> | undefined
): TastingEvent | null => {
  if (!event || !fills?.size) return event;
  return {
    ...event,
    booths: event.booths.map((booth) => ({
      ...booth,
      pours: booth.pours.map((pour) => {
        const fill = pour.whiskeyRefId ? fills.get(pour.whiskeyRefId) : undefined;
        if (!fill) return pour;
        const tag = pour.tag || fill.tag;
        const image = pour.image ?? fill.picture ?? null;
        if (tag === pour.tag && image === pour.image) return pour;
        return { ...pour, tag: tag ?? '', image };
      }),
    })),
  };
};

/**
 * The live roster, shared by every surface that needs it. Guests read it too — the
 * tasting content models allow public read, so the query goes through the API-key
 * client for them and the token-authed one for members. That is what lets the
 * Discover card advertise the real events by name to a signed-out visitor; the
 * Passport behind them still needs an account (see `TastingEventCard`).
 *
 * A scheduled event opens, and later closes, at a known instant. Rather than poll
 * for it, come back exactly once at that instant; anything further out than two days
 * is left to the next app open (and would overflow the timer besides).
 */
const useOpenEventsQuery = () => {
  const { isGuest } = useAuth();
  const isAdmin = useIsAdmin();
  const client = isGuest ? amplifyApiKey : amplify;

  const { data, isLoading, refetch } = useQuery({
    // Keyed on the audience: the member copy carries catalogue-filled tags the
    // guest copy can't have, so signing in must not keep serving the thinner one,
    // and the admin copy carries drafts no other account may be shown.
    queryKey: ['tastingOpenEvents', isGuest, isAdmin],
    queryFn: () => fetchOpenEvents(client, isAdmin),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const nextChangeAt = data?.nextChangeAt ?? null;
  useEffect(() => {
    if (nextChangeAt === null) return undefined;
    const delay = nextChangeAt - Date.now();
    if (delay > MAX_SCHEDULED_WAKE_MS) return undefined;
    const timer = setTimeout(() => {
      refetch();
    }, Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [nextChangeAt, refetch]);

  return { client, isGuest, data, isLoading };
};

/**
 * Every event that is on right now, for the surfaces that list them rather than open
 * one: the Discover section and the Tasting Events screen.
 *
 * A query that could not run reports nothing on, and the section renders nothing.
 * There is no sample event behind this any more: advertising a night that is not
 * happening is worse than an empty space where the section would be.
 */
export const useOpenTastingEvents = (): {
  events: TastingEventSummary[];
  past: TastingEventSummary[];
  loading: boolean;
} => {
  const { data, isLoading } = useOpenEventsQuery();

  const events = useMemo(() => (data?.events ?? []).map(summarizeRaw), [data]);
  const past = useMemo(() => (data?.past ?? []).map(summarizeRaw), [data]);

  return { events, past, loading: isLoading };
};

/**
 * One event's full content — booths, pours, artwork — or `null` when it cannot be
 * read. Pass the id the screen was opened with: two festivals can be published at
 * once, and the passport must show the one the attendee tapped, not whichever the
 * roster happens to list first. Omitting the id falls back to the first open event,
 * which is what an entry point with nothing to go on wants.
 *
 * Nothing is invented when the read fails. A caller that gets `null` must say so —
 * see `LoadError` — rather than render a passport nobody is standing in.
 *
 * A pour's display fields are snapshots taken at curation, so any the CMS left
 * blank are filled from the linked catalogue bottle here rather than being
 * re-typed by hand — the style tag, which the catalogue holds as `type`, and the
 * bottle shot, which curation only carries when someone uploaded one.
 * The catalogue itself is private-read, so that top-up is members-only; a guest
 * simply sees whatever the CMS curated.
 *
 * `isOpen` is the clock's verdict, and it is what callers gate on: the passport
 * stops accepting stamps once the event closes. A query that could not run leaves it
 * true — a bad connection at the door must not be read as "the event is over". The
 * event last fetched is kept after it closes so an attendee standing in the passport
 * as the window ends keeps their own booths in front of them, which is their real
 * event and not a stand-in for it.
 */
export const useTastingEventContent = (
  eventId?: string
): {
  event: TastingEvent | null;
  loading: boolean;
  isOpen: boolean;
  /** Closed because it has not started yet, rather than because it is over. */
  notStarted: boolean;
  failed: boolean;
} => {
  const { client, isGuest, data, isLoading } = useOpenEventsQuery();

  // A finished event is still openable — from Past Events, or from a passport left
  // on screen — so selection spans both lists. Whether it can be written to is a
  // separate question, answered by `isOpen` below.
  const selected = useMemo(() => {
    const current = data?.events ?? [];
    if (!eventId) return current[0] ?? null;
    const roster = [...current, ...(data?.past ?? [])];
    return roster.find((candidate) => candidate.id === eventId) ?? null;
  }, [data, eventId]);

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['tastingEventContent', isGuest, selected?.id ?? ''],
    queryFn: () => fetchEventContent(client, selected as RawEvent),
    enabled: !!selected,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const incompleteIds = useMemo(
    () => incompleteRefIds(content?.event ?? null),
    [content]
  );

  const { data: catalogueFills } = useQuery({
    queryKey: ['tastingPourFills', incompleteIds.join(',')],
    queryFn: () => fetchCatalogueFills(incompleteIds),
    // Catalogue reads are private-authed — a guest would only earn a 401.
    enabled: !isGuest && incompleteIds.length > 0,
    staleTime: 30 * 60 * 1000,
  });

  // Held across a close so the screen keeps the event it was already showing.
  const lastEvent = useRef<TastingEvent | null>(null);
  const resolved = useMemo(() => {
    const filled = withCatalogueFills(content?.event ?? null, catalogueFills);
    if (filled) lastEvent.current = filled;
    return filled ?? lastEvent.current;
  }, [content, catalogueFills]);

  const loading = isLoading || (!!selected && contentLoading);

  return {
    event: resolved,
    loading,
    // Stamping follows the event's own start and end, not merely whether it is
    // listed: a festival is browsable from its go-live and read-only once it is
    // over. Still loading, or a query that could not run, both stay open — a bad
    // connection at the door must not be read as "the event is not running".
    isOpen:
      !data ||
      data.failed ||
      (!!selected && isEventStamping(selected, Date.now())),
    // Which side of the window it is closed on, so the passport can say the right
    // thing: still to come reads very differently from already over.
    notStarted: !!selected && isEventNotStarted(selected, Date.now()),
    // Either read failing counts, and so does a roster that came back without this
    // event in it — from the screen's side they are the same "cannot show it".
    failed: !loading && !resolved,
  };
};
