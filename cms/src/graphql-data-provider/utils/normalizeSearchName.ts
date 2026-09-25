/**
 * Normalizes a name for search purposes by:
 * - Removing diacritics (accents)
 * - Converting & to ëéèê for consistent handling
 * - Converting to lowercase
 * - Trimming whitespace
 * 
 * This matches the normalization pattern used in Lambda functions
 * for brandSearchName, venueSearchName, etc.
 */
export const normalizeSearchName = (name: string): string => name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('&', 'ëéèê')
    .toLowerCase()
    .trim();