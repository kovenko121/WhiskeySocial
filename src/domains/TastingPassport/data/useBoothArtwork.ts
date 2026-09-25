/**
 * Brand artwork for the surfaces that only know a bottle, not a booth.
 *
 * The booth grid resolves its own logo per tile, but "Your Pours Tonight" and the leaderboard
 * are keyed by bottle: a curated pour carries the CMS bottle shot and no logo, and a leaderboard
 * counter that already knows its own name never reaches the catalogue lookup that would have
 * found one. Both then fell back to initials for a brand whose logo was already loaded two rows
 * up the screen.
 *
 * Every bottle on either surface was poured at a booth at this event, so the booths are the
 * answer — indexed here by bottle key and by brand name, and costing no extra request because
 * `useBrandDetails` has already fetched them.
 */
import { S3Object } from '@types';
import { useMemo } from 'react';
import { TastingEvent } from '../types';
import { boothLogo } from '../utils';
import { BrandDetailMap } from './useBrandDetails';

export type BoothArtwork = {
  forBooth: (boothId: string) => S3Object | null;
  forBottle: (bottleKey: string, brand: string) => S3Object | null;
};

const EMPTY_ARTWORK: BoothArtwork = {
  forBooth: () => null,
  forBottle: () => null,
};

/** Brand names are free text on both sides of the match — compare on letters and digits only. */
const normalizeBrand = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');

export const useBoothArtwork = (
  event: TastingEvent,
  brandDetails: BrandDetailMap,
): BoothArtwork =>
  useMemo(() => {
    const byBooth = new Map<string, S3Object>();
    const byBottle = new Map<string, S3Object>();
    const byBrand = new Map<string, S3Object>();

    const remember = (map: Map<string, S3Object>, key: string | undefined | null, logo: S3Object) => {
      if (key && !map.has(key)) map.set(key, logo);
    };

    event.booths.forEach((booth) => {
      const brand = booth.brandUserId ? brandDetails.get(booth.brandUserId) : undefined;
      const logo = boothLogo(booth, brand);
      if (!logo) return;

      byBooth.set(booth.id, logo);
      remember(byBrand, normalizeBrand(booth.name), logo);
      remember(byBrand, normalizeBrand(brand?.brandName ?? ''), logo);

      // A counter's `bottleKey` is the pour's authored key, its catalogue id, or — for
      // offline content that had neither — the pour id. Index all three.
      booth.pours.forEach((pour) => {
        remember(byBottle, pour.bottleKey, logo);
        remember(byBottle, pour.whiskeyRefId, logo);
        remember(byBottle, pour.id, logo);
        remember(byBrand, normalizeBrand(pour.brand), logo);
      });
    });

    if (byBooth.size === 0) return EMPTY_ARTWORK;

    return {
      forBooth: (boothId) => byBooth.get(boothId) ?? null,
      forBottle: (bottleKey, brand) =>
        byBottle.get(bottleKey) ?? byBrand.get(normalizeBrand(brand)) ?? null,
    };
  }, [event, brandDetails]);
