/**
 * Joins the passport's per-attendee rows into one lead per booth.
 *
 * A lead is an attendee who gave a booth a reason to follow up: the per-booth email opt-in, or a
 * Favorite — of the booth itself or of one of its bottles. Visiting a booth or drinking what it
 * poured is not a lead; only a Favorite is (rule 4). Contact
 * details come from `TastingAttendance` — the passport's own snapshot, captured with consent — and
 * never from the User table, so an attendee who turned sharing off simply has no address here and
 * drops out of the export entirely.
 *
 * Private notes are deliberately not part of this shape. They are the attendee's, not the brand's.
 */

export type BoothRow = { id: string; name: string };
export type PourRow = { id: string; name: string };

export type BoothStateRow = {
  id: string;
  boothId: string;
  went?: boolean | null;
  fav?: boolean | null;
  shareEmail?: boolean | null;
};

export type PourStateRow = {
  id: string;
  boothId: string;
  pourId: string;
  fav?: boolean | null;
};

export type AttendanceRow = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  shareContact?: boolean | null;
};

export type LeadRow = {
  key: string;
  boothName: string;
  attendee: string;
  email: string;
  optedIn: boolean;
  visited: boolean;
  favoritedBooth: boolean;
  favoriteBottles: string[];
  /** How many booths this attendee stamped across the whole event — engagement context. */
  stamps: number;
};

export type LeadExport = {
  rows: LeadRow[];
  /** Attendees who signalled interest but opted out of sharing. Counted, never listed. */
  suppressed: number;
};

type Input = {
  booths: BoothRow[];
  pours: PourRow[];
  boothStates: BoothStateRow[];
  pourStates: PourStateRow[];
  attendances: AttendanceRow[];
};

// State-row ids are composed as `${ownerSub}:${eventId}:${boothId}` by the app, and a Cognito sub
// never contains a colon — so the first segment is the owner.
export const ownerOf = (stateId: string): string => stateId.split(':')[0];

const favKey = (owner: string, boothId: string) => `${owner}|${boothId}`;

export const buildLeadRows = ({
  booths,
  pours,
  boothStates,
  pourStates,
  attendances,
}: Input): LeadExport => {
  const boothNames = new Map(booths.map((booth) => [booth.id, booth.name]));
  const pourNames = new Map(pours.map((pour) => [pour.id, pour.name]));

  const contacts = new Map<string, AttendanceRow>();
  attendances.forEach((row) => contacts.set(ownerOf(row.id), row));

  const stamps = new Map<string, number>();
  boothStates.forEach((state) => {
    if (!state.went) return;
    const owner = ownerOf(state.id);
    stamps.set(owner, (stamps.get(owner) ?? 0) + 1);
  });

  const favourites = new Map<string, string[]>();
  pourStates.forEach((state) => {
    if (!state.fav) return;
    const key = favKey(ownerOf(state.id), state.boothId);
    const named = pourNames.get(state.pourId) ?? state.pourId;
    favourites.set(key, [...(favourites.get(key) ?? []), named]);
  });

  // Every (attendee, booth) pair either signal touched, so a favorite with no booth
  // state row still produces a lead.
  const pairs = new Map<string, { owner: string; boothId: string; state?: BoothStateRow }>();
  boothStates.forEach((state) => {
    const owner = ownerOf(state.id);
    pairs.set(favKey(owner, state.boothId), { owner, boothId: state.boothId, state });
  });
  pourStates.forEach((state) => {
    if (!state.fav) return;
    const owner = ownerOf(state.id);
    const key = favKey(owner, state.boothId);
    if (!pairs.has(key)) pairs.set(key, { owner, boothId: state.boothId });
  });

  const rows: LeadRow[] = [];
  const suppressedOwners = new Set<string>();

  pairs.forEach(({ owner, boothId, state }, key) => {
    const favoriteBottles = favourites.get(key) ?? [];
    // Rule 4: a Favorite — of the booth or of one of its bottles — IS the automatic opt-in.
    // The app stores `shareEmail` only when the attendee threw the switch by hand, so that
    // explicit choice still wins and the Favorite supplies the default. Reading the flag
    // alone would drop every favorite-driven lead on the floor.
    const favoritedBooth = state?.fav === true;
    const favoriteSignal = favoritedBooth || favoriteBottles.length > 0;
    const optedIn = state?.shareEmail ?? favoriteSignal;
    if (!optedIn && !favoriteSignal) return;

    const contact = contacts.get(owner);
    const email = contact?.email ?? '';
    if (!email || contact?.shareContact === false) {
      suppressedOwners.add(owner);
      return;
    }

    rows.push({
      key,
      boothName: boothNames.get(boothId) ?? boothId,
      attendee: contact?.displayName || '—',
      email,
      optedIn,
      visited: state?.went === true,
      favoritedBooth,
      favoriteBottles,
      stamps: stamps.get(owner) ?? 0,
    });
  });

  rows.sort(
    (a, b) => a.boothName.localeCompare(b.boothName) || a.attendee.localeCompare(b.attendee),
  );

  return { rows, suppressed: suppressedOwners.size };
};

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const leadRowsToCsv = (rows: LeadRow[]): string => {
  const header = [
    'Booth',
    'Attendee',
    'Email',
    'Email opt-in',
    'Visited',
    'Favorited booth',
    'Favorited bottles',
    'Stamps at event',
  ];
  const body = rows.map((row) =>
    [
      row.boothName,
      row.attendee,
      row.email,
      row.optedIn ? 'yes' : 'no',
      row.visited ? 'yes' : 'no',
      row.favoritedBooth ? 'yes' : 'no',
      row.favoriteBottles.join('; '),
      String(row.stamps),
    ]
      .map(csvCell)
      .join(','),
  );
  return [header.map(csvCell).join(','), ...body].join('\r\n');
};
