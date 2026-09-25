import { S3Object } from '@types';

/** Booth toggles. `went` is "Visited" — the stamp. */
export type BoothStatus = {
  want: boolean; // "Want to Go" (tile chip shows "Want")
  went: boolean; // "Visited" — the stamp
  fav: boolean; // "Favorite"
};

/** Per-pour state. Do NOT model a per-pour `want` (prototype had dead code for it). */
export type PourStatus = {
  tasted: boolean;
  fav: boolean;
};

/**
 * Full per-user record for one booth: the three toggles, private notes, and the lead-gen
 * email-share opt-in. `shareEmail` is `undefined` while untouched, so an explicit "off" stays
 * distinguishable from the derived default (state-model rule 4). Stored ONLY in passport-dedicated
 * storage via `PassportRepository` — never written to the user's existing app record.
 */
export type BoothUserState = BoothStatus & {
  notes: string;
  shareEmail: boolean | undefined;
};

/**
 * The lead contact snapshot for one event — name + email, held in passport-dedicated storage
 * (`TastingAttendance`) and never on the user's app record. Sharing is ON by default; opting out
 * clears the snapshot backend-side so there is nothing left to export.
 */
export type ContactIdentity = {
  displayName: string;
  email: string;
};

/** What the repository persists for one attendee at one event. */
export type AttendanceRecord = {
  /** Event-level switch. False = explicit opt-out; the snapshot fields come back null. */
  shareContact: boolean;
  displayName: string | null;
  email: string | null;
};

/** A bottle a booth is pouring. Content, not user state. */
export type Pour = {
  id: string; // stable within a booth, e.g. `${boothId}:${index}`
  name: string;
  brand: string;
  tag: string;
  /**
   * Both are genuinely absent for some bottles and must stay nullable rather than
   * collapsing to 0. A barrel-proof or cask-strength release has no single proof to
   * print, and an uncatalogued pour has no rating yet — coercing either to 0 turned
   * "not applicable" into the claim "0 proof".
   */
  rating?: number | null;
  proof?: number | null;
  /** Product shot for the card's tile; absent falls back to the glass mark. */
  image?: S3Object | null;
  /**
   * Leaderboard identity (catalogue whiskeyRefId, else normalized brand+name),
   * authored on the backend `TastingPour`. Optional because offline content
   * has none; the repository falls back to the pour id when it's absent.
   */
  bottleKey?: string;
  /**
   * The catalogue `Whiskey` this pour was curated from, when it was linked to one.
   * The CMS snapshots the display fields at curation, so anything left blank there
   * is resolved back from this id rather than being re-typed by hand.
   */
  whiskeyRefId?: string;
};

/**
 * A distillery booth at an event. Content, not user state.
 *
 * `name` is the "init name" — the exhibitor label from the event sheet. It is the stable key and
 * the display FALLBACK. When `brandUserId` is set, the brand's authoritative name / details are
 * fetched live from that brand `User` record (source of truth) via `useBrandDetails`; booths with
 * neither a logo of their own nor a brand account (or offline before the first fetch) fall back
 * to `name` + initials.
 */
export type Booth = {
  id: string;
  /** Event-sheet label — stable key and display fallback. */
  name: string;
  /** Link to the source-of-truth brand `User`. Absent when the brand has no PROD account yet. */
  brandUserId?: string;
  /** Booth logo uploaded in the CMS. Takes precedence over the linked brand's logo. */
  logo?: S3Object | null;
  /** Distillery home location, when known. Not in the brand record (country-level only), so optional. */
  location?: string;
  /** This stand's number on the printed floor plan. Absent = not on the map's directory. */
  boothNumber?: string;
  /** Dark-tile logo treatment. Rarely needed now real logos render on the white badge. */
  darkLogo: boolean;
  /** Curated FEATURED pours for this event ("Pouring Today"). Empty until curated. */
  pours: Pour[];
};

/**
 * Source-of-truth brand identity, fetched live by `brandUserId` from the brand `User` record.
 * Every field is optional/nullable — a booth may have no account, or a field may be unset.
 */
export type BrandDetail = {
  brandUserId: string;
  brandName?: string | null;
  brandLogo?: S3Object | null;
  brandCoverImage?: S3Object | null;
  brandDescription?: string | null;
  brandStory?: string | null;
  brandWebsite?: string | null;
  brandCountry?: string | null;
  brandFoundedYear?: number | null;
};

/** The event itself, with its booths. Content, not user state. */
export type TastingEvent = {
  id: string;
  name: string;
  dateLabel: string; // "Sat, Aug 8"
  timeLabel: string; // "6–8pm"
  venue: string; // "The Factory at Franklin"
  /** Artwork uploaded in the CMS. Absent (offline / not set) falls back to the watermark. */
  image?: S3Object | null;
  /** The venue floor plan, uploaded per event. Absent = this event has no booth map. */
  mapImage?: S3Object | null;
  /** Our own stand, called out under the map. Absent = no callout. */
  hostBoothNumber?: string;
  booths: Booth[];
};

/**
 * Stands in for an event that could not be read, so the hooks below it keep their
 * shape without a null check at every call site. It carries no content of its own:
 * screens must render `LoadError` rather than anything built from this.
 */
export const NO_EVENT: TastingEvent = {
  id: '',
  name: '',
  dateLabel: '',
  timeLabel: '',
  venue: '',
  image: null,
  booths: [],
};

/**
 * One row of the live bottle leaderboard, produced by passport-dedicated aggregation — an
 * event-scoped tasting count, NOT the app's lifetime `UserPours`. `count` is shown on the board.
 */
export type LeaderboardRow = {
  rank: number;
  brand: string;
  bottle: string;
  count: number;
  /** Brand artwork for the row badge; absent falls back to initials. */
  image?: S3Object | null;
};

/** A tasted pour surfaced in "Your Pours Tonight", flattened across every booth. */
export type TastedPour = Pour & {
  boothId: string;
  fav: boolean;
  /** Brand logo for the mark on that tile; absent falls back to initials. */
  brandImage?: S3Object | null;
};

/** Persisted per-user, per-event passport blob. Pour key is `${boothId}:${pourId}`. */
export type PersistedPassport = {
  booths: Record<string, BoothUserState>;
  pours: Record<string, PourStatus>;
};

/** Grid filter chips over the booth grid. OR'd, never AND'd (state-model rule 5). */
export type FilterChip = 'notyet' | 'togo' | 'went' | 'poured';

/** Coarse visual classification of a tile, resolved by a pure function (never nested ternaries). */
export type TileKind = 'visited' | 'togo' | 'notyet';
