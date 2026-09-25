import type { Whiskey } from '@types';
import { createRegexpSearchString } from './search';

export type ScannedLabel = {
  brand?: string | null;
  name?: string | null;
  type?: string | null;
  proof?: number | null;
  age?: number | null;
};

export type ScannedMatch = {
  whiskey: Whiskey;
  score: number;
  nameScore: number;
};

const WEIGHTS = {
  brand: 0.35,
  name: 0.35,
  type: 0.1,
  proof: 0.1,
  age: 0.1,
};

const BEST_MATCH_THRESHOLD = 0.6;

const BEST_MATCH_NAME_THRESHOLD = 0.5;

const toTokens = (value?: string | null) =>
  createRegexpSearchString(value ?? '', {
    removeAccents: true,
    searchForAccents: false,
    trim: true,
    lowercase: true,
    escapeMetacharacters: false,
  })
    .replaceAll('&', 'ëéèê')
    .split(/\s+/)
    .filter((token) => token.length > 1);

const toSearchTerms = (value?: string | null) =>
  createRegexpSearchString(value ?? '')
    .split(/\s+/)
    .filter((token) => token.replace(/\[[^\]]*\]/g, 'x').length > 1)
    .map((token) => `${token.replaceAll("'", "'?")}.*`);

const candidateTokens = (whiskey: Whiskey) => {
  const source = whiskey.fullName || `${whiskey.brand ?? ''} ${whiskey.name ?? ''}`;
  return toTokens(source);
};

const overlapRatio = (wanted: string[], available: string[]) => {
  if (!wanted.length) return 0;

  const pool = new Set(available);
  const hits = wanted.filter(
    (token) => pool.has(token) || available.some((other) => other.startsWith(token))
  );

  return hits.length / wanted.length;
};

const balancedRatio = (labelTokens: string[], candidate: string[]) => {
  const recall = overlapRatio(labelTokens, candidate);
  const precision = overlapRatio(candidate, labelTokens);

  if (recall + precision === 0) return 0;

  return (2 * recall * precision) / (recall + precision);
};

const scoreType = (whiskey: Whiskey, label: ScannedLabel) => {
  const types = Array.isArray(whiskey.type) ? whiskey.type : [whiskey.type];
  return types.some((type) => type === label.type) ? WEIGHTS.type : 0;
};

const scoreProof = (whiskey: Whiskey, label: ScannedLabel) => {
  if (typeof whiskey.proof !== 'number' || typeof label.proof !== 'number') return 0;

  const difference = Math.abs(whiskey.proof - label.proof);
  if (difference === 0) return WEIGHTS.proof;
  if (difference <= 2) return WEIGHTS.proof * 0.7;
  if (difference <= 5) return WEIGHTS.proof * 0.3;
  return 0;
};

const scoreAge = (whiskey: Whiskey, label: ScannedLabel) => {
  if (typeof whiskey.age !== 'number' || typeof label.age !== 'number') return 0;
  return whiskey.age === label.age ? WEIGHTS.age : 0;
};

const scoreCandidate = (whiskey: Whiskey, label: ScannedLabel) => {
  const tokens = candidateTokens(whiskey);
  const brandTokens = toTokens(label.brand);
  const nameTokens = toTokens(label.name);

  let score = 0;
  let total = 0;
  let nameScore = 0;

  if (brandTokens.length) {
    total += WEIGHTS.brand;
    score += overlapRatio(brandTokens, tokens) * WEIGHTS.brand;
  }

  if (nameTokens.length) {
    total += WEIGHTS.name;
    nameScore = Math.max(
      balancedRatio(nameTokens, toTokens(whiskey.name)),
      balancedRatio(nameTokens, tokens)
    );
    score += nameScore * WEIGHTS.name;
  }

  if (label.type) {
    total += WEIGHTS.type;
    score += scoreType(whiskey, label);
  }

  if (typeof label.proof === 'number') {
    total += WEIGHTS.proof;
    score += scoreProof(whiskey, label);
  }

  if (typeof label.age === 'number') {
    total += WEIGHTS.age;
    score += scoreAge(whiskey, label);
  }

  if (total === 0) return { score: 0, nameScore };

  const labelLength = brandTokens.length + nameTokens.length;
  const noise = Math.max(tokens.length - labelLength, 0);
  const specificity = 0.02 * (1 - Math.min(noise / 10, 1));

  return { score: Math.min(score / total + specificity, 1), nameScore };
};

export const buildScanSearchFilters = (label: ScannedLabel) => {
  const brandTerms = toSearchTerms(label.brand);
  const nameTerms = toSearchTerms(label.name);

  const term = (regexp: string) => ({ fullName: { regexp } });
  const filters: object[] = [];

  if (brandTerms.length && nameTerms.length) {
    filters.push({ and: [...brandTerms, ...nameTerms].map(term) });
    filters.push({
      and: [...brandTerms.map(term), { or: nameTerms.map(term) }],
    });
  }
  if (brandTerms.length) {
    filters.push({ and: brandTerms.map(term) });
  }
  if (nameTerms.length) {
    filters.push({ and: nameTerms.map(term) });
  }

  return filters;
};

export const rankScanCandidates = (
  candidates: Whiskey[],
  label: ScannedLabel,
  limit = 5
): ScannedMatch[] => {
  const seen = new Set<string>();
  const unique: Whiskey[] = [];

  candidates.forEach((whiskey) => {
    if (!whiskey?.id || seen.has(whiskey.id)) return;
    seen.add(whiskey.id);
    unique.push(whiskey);
  });

  return unique
    .map((whiskey) => ({ whiskey, ...scoreCandidate(whiskey, label) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const isBestMatch = (matches: ScannedMatch[], index: number) =>
  index === 0 &&
  matches[0]?.score >= BEST_MATCH_THRESHOLD &&
  matches[0]?.nameScore >= BEST_MATCH_NAME_THRESHOLD;
