import { BoothStatus, FilterChip, PourStatus, TileKind } from '../types';

export const EMPTY_BOOTH_STATUS: BoothStatus = { want: false, went: false, fav: false };
export const EMPTY_POUR_STATUS: PourStatus = { tasted: false, fav: false };

// Rule 1 — want/went are mutually exclusive: turning one ON clears the other. fav is independent.
export const setWant = (status: BoothStatus, value: boolean): BoothStatus =>
  value ? { ...status, want: true, went: false } : { ...status, want: false };

export const setWent = (status: BoothStatus, value: boolean): BoothStatus =>
  value ? { ...status, went: true, want: false } : { ...status, went: false };

export const setFav = (status: BoothStatus, value: boolean): BoothStatus => ({
  ...status,
  fav: value,
});

// Rule 2 — tasting a pour auto-stamps the booth (one-way): un-tasting never un-stamps it.
export const setPourTasted = (
  booth: BoothStatus,
  pour: PourStatus,
  tasted: boolean,
): { booth: BoothStatus; pour: PourStatus } => ({
  booth: tasted && !booth.went ? setWent(booth, true) : booth,
  pour: { ...pour, tasted },
});

export const setPourFav = (pour: PourStatus, value: boolean): PourStatus => ({
  ...pour,
  fav: value,
});

export const tastedPourCount = (pours: PourStatus[]): number =>
  pours.filter((pour) => pour.tasted).length;

export const visitedCount = (booths: BoothStatus[]): number =>
  booths.filter((booth) => booth.went).length;

/**
 * Rule 4 — email-share default: ON only where the attendee marked a FAVORITE, either of the
 * booth itself or of one of its bottles. An explicit choice always wins. Passport-only.
 *
 * Narrowed from "any interest signal": To Go, Visited and Tasted used to arm it too, which
 * meant walking up to a booth handed over an address. Planning a route or drinking what is
 * poured is not a request to be contacted; a Favorite is.
 */
export const shareEmailDefault = (
  status: BoothStatus,
  boothHasAnyFavoritePour: boolean,
): boolean => status.fav || boothHasAnyFavoritePour;

export const resolveShareEmail = (
  explicit: boolean | undefined,
  status: BoothStatus,
  boothHasAnyFavoritePour: boolean,
): boolean =>
  explicit === undefined ? shareEmailDefault(status, boothHasAnyFavoritePour) : explicit;

// Rule 5 — chips are OR'd, never AND'd; no active chip shows all booths.
export const boothMatchesChip = (
  chip: FilterChip,
  status: BoothStatus,
  boothTastedCount: number,
): boolean => {
  switch (chip) {
    case 'notyet':
      return !status.went && !status.want;
    case 'togo':
      return status.want && !status.went;
    case 'went':
      return status.went;
    case 'poured':
      return boothTastedCount > 0;
    default:
      return false;
  }
};

export const boothMatchesFilters = (
  activeChips: FilterChip[],
  status: BoothStatus,
  boothTastedCount: number,
): boolean =>
  activeChips.length === 0 ||
  activeChips.some((chip) => boothMatchesChip(chip, status, boothTastedCount));

// Resolve tile kind here — never nested ternaries in the view (house style).
export const resolveTileKind = (status: BoothStatus): TileKind => {
  if (status.went) return 'visited';
  if (status.want) return 'togo';
  return 'notyet';
};

export const glassFillLevel = (boothTastedCount: number): 0 | 1 | 2 | 3 => {
  if (boothTastedCount >= 3) return 3;
  if (boothTastedCount === 2) return 2;
  if (boothTastedCount === 1) return 1;
  return 0;
};
