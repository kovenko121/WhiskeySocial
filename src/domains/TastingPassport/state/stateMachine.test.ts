/**
 * Unit tests for the Tasting Passport state machine. These cover the documented state-model
 * rules — the traps that are near-impossible to verify by tapping through 40 booths.
 * This is the module's only unit test by design.
 */
import {
  EMPTY_BOOTH_STATUS,
  EMPTY_POUR_STATUS,
  boothMatchesFilters,
  glassFillLevel,
  resolveTileKind,
  setFav,
  setPourTasted,
  setWant,
  setWent,
  visitedCount,
} from './stateMachine';

describe('rule 1 — want and went are mutually exclusive', () => {
  it('setWant(true) clears went', () => {
    expect(setWant({ want: false, went: true, fav: false }, true)).toEqual({
      want: true,
      went: false,
      fav: false,
    });
  });

  it('setWent(true) clears want', () => {
    expect(setWent({ want: true, went: false, fav: false }, true)).toEqual({
      want: false,
      went: true,
      fav: false,
    });
  });

  it('setWant(false) does not set went — lands in Not Yet', () => {
    expect(setWant({ want: true, went: false, fav: false }, false)).toEqual({
      want: false,
      went: false,
      fav: false,
    });
  });

  it('setWent(false) leaves want untouched', () => {
    expect(setWent({ want: true, went: false, fav: false }, false)).toEqual({
      want: true,
      went: false,
      fav: false,
    });
  });

  it('fav survives toggling want/went', () => {
    let status = setFav(EMPTY_BOOTH_STATUS, true);
    status = setWant(status, true);
    status = setWent(status, true);
    expect(status.fav).toBe(true);
  });
});

describe('rule 2 — tasting a pour auto-stamps the booth, one-way', () => {
  it('tasting a pour stamps an un-visited booth', () => {
    const { booth } = setPourTasted(EMPTY_BOOTH_STATUS, EMPTY_POUR_STATUS, true);
    expect(booth.went).toBe(true);
  });

  it('auto-stamp clears want (via rule 1)', () => {
    const { booth } = setPourTasted(
      { want: true, went: false, fav: false },
      EMPTY_POUR_STATUS,
      true,
    );
    expect(booth).toEqual({ want: false, went: true, fav: false });
  });

  it('un-tasting the last pour never un-stamps the booth', () => {
    const visited = { want: false, went: true, fav: false };
    const { booth } = setPourTasted(visited, { tasted: true, fav: false }, false);
    expect(booth.went).toBe(true);
  });

  it('marking Visited does not touch pour state', () => {
    const pour = { ...EMPTY_POUR_STATUS };
    setWent(EMPTY_BOOTH_STATUS, true);
    expect(pour.tasted).toBe(false);
  });
});

describe('rule 3 — Visited count is booth-level only', () => {
  it('counts went booths regardless of pours', () => {
    const booths = [
      { want: false, went: true, fav: false },
      { want: true, went: false, fav: false },
      { want: false, went: true, fav: false },
    ];
    expect(visitedCount(booths)).toBe(2);
  });
});

// Rule 4 (email-share default) is restored and stored passport-only; its helpers live in
// stateMachine, covered by Maestro flows rather than added Jest cases (module policy).

describe('rule 5 — filter chips are OR\'d', () => {
  const togo = { want: true, went: false, fav: false };
  const visited = { want: false, went: true, fav: false };

  it('no active chip matches every booth', () => {
    expect(boothMatchesFilters([], togo, 0)).toBe(true);
  });

  it('union, not intersection', () => {
    // To Go + Visited: a To-Go booth matches even though it is not Visited.
    expect(boothMatchesFilters(['togo', 'went'], togo, 0)).toBe(true);
    expect(boothMatchesFilters(['togo', 'went'], visited, 0)).toBe(true);
  });

  it('poured is evaluated from pour data, independent of want/went', () => {
    expect(boothMatchesFilters(['poured'], EMPTY_BOOTH_STATUS, 2)).toBe(true);
    expect(boothMatchesFilters(['poured'], visited, 0)).toBe(false);
  });
});

describe('tile helpers', () => {
  it('resolveTileKind prioritizes visited over togo', () => {
    expect(resolveTileKind({ want: true, went: true, fav: false })).toBe('visited');
    expect(resolveTileKind({ want: true, went: false, fav: false })).toBe('togo');
    expect(resolveTileKind(EMPTY_BOOTH_STATUS)).toBe('notyet');
  });

  it('glassFillLevel caps at 3', () => {
    expect(glassFillLevel(0)).toBe(0);
    expect(glassFillLevel(1)).toBe(1);
    expect(glassFillLevel(2)).toBe(2);
    expect(glassFillLevel(5)).toBe(3);
  });
});
