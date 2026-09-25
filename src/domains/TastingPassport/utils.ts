import { S3Object } from '@types';
import { Booth, BrandDetail } from './types';

export const brandInitials = (name: string): string => {
  const words = name
    .replace(/[’'".]/g, '')
    .split(/\s+/)
    .filter((word) => word && word.toLowerCase() !== 'the');
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * The catalogue stores a bottle's style as a `type` array ("American", "Bourbon", "Rye");
 * a pour shows it as one tag line, so keep every entry rather than just the first.
 */
export const joinWhiskeyTypes = (types?: (string | null)[] | null): string =>
  (types ?? []).filter((entry): entry is string => Boolean(entry)).join(', ');

export const visitedChipLabel = (tastedCount: number): string => {
  if (tastedCount === 0) return 'Visited';
  if (tastedCount === 1) return '1 POUR';
  return `${tastedCount} POURS`;
};

export const boothLogo = (
  booth: Pick<Booth, 'logo'>,
  brand?: Pick<BrandDetail, 'brandLogo'>
): S3Object | null => booth.logo ?? brand?.brandLogo ?? null;
