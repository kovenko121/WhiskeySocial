import { normalizeApostrophes } from './normalizeApostrophes';

// Escapes characters that carry special meaning in a regular expression so
// that user-typed input (e.g. "Michter's (Small Batch)", "Booker's *") is
// matched literally instead of being interpreted as regex syntax by the
// AppSync `regexp` filter.
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createRegexpSearchString = (
  search: string,
  options: {
    removeAccents: boolean;
    searchForAccents: boolean;
    trim: boolean;
    lowercase: boolean;
    escapeMetacharacters: boolean;
  } = {
    removeAccents: true,
    searchForAccents: true,
    trim: true,
    lowercase: true,
    escapeMetacharacters: true,
  }
) => {
  let searchString = search;
  // Escape first, while the string is still the raw user input — the
  // `searchForAccents` step below intentionally inserts regex character
  // classes ([aáàâäã], …) that must NOT be escaped.
  if (options.escapeMetacharacters) {
    searchString = escapeRegExp(searchString);
  }
  if (options.removeAccents) {
    searchString = searchString.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
  if (options.searchForAccents) {
    searchString = searchString
      .replaceAll('a', '[aáàâäã]')
      .replaceAll('e', '[eéèêë]')
      .replaceAll('i', '[iíìîï]')
      .replaceAll('o', '[oóòôöõ]')
      .replaceAll('u', '[uúùûü]')
      .replaceAll('y', '[yýÿ]')
      .replaceAll('c', '[cç]')
      .replaceAll('n', '[nñ]')
      .replaceAll('&', 'ëéèê');
    searchString = normalizeApostrophes(searchString);
  }
  if (options.trim) {
    searchString = searchString.trim();
  }
  if (options.lowercase) {
    searchString = searchString.toLowerCase();
  }
  return searchString;
};
