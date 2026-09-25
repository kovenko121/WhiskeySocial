import { isBestMatch } from '@helpers';
import type { ScannedLabel, ScannedMatch } from '@helpers';
import type { ScanOutcome } from '@hooks';
import { randomUUID } from 'expo-crypto';
import { capturePostHogEvent } from '../../../config/posthog';
import { createLogger } from '../../../services/logger';
import { PostHogEventName, PostHogProperties } from '../../../types/posthog';

const logger = createLogger('scanAnalytics');

const capture = (name: PostHogEventName, properties: PostHogProperties): void => {
  try {
    capturePostHogEvent(name, properties);
  } catch (error) {
    logger.error(`Error tracking ${name}`, error as Error);
  }
};

export type ScanIntent = 'add' | 'view';

export type ScanUserOutcome = 'match_selected' | 'suggest_new' | 'retake' | 'abandoned';

export type ScanSelection = { match: ScannedMatch; index: number };

export type ScanAttempt = {
  scanId: string;
  userId?: string;
  intent: ScanIntent;
  startedAt: number;
  status: 'pending' | ScanOutcome['status'];
  durationMs?: number;
  label?: ScannedLabel;
  matches: ScannedMatch[];
};

const round = (value: number) => Math.round(value * 1000) / 1000;

export const startScanAttempt = (intent: ScanIntent, userId?: string): ScanAttempt => ({
  scanId: randomUUID(),
  userId,
  intent,
  startedAt: Date.now(),
  status: 'pending',
  matches: [],
});

export const completeScanAttempt = (
  attempt: ScanAttempt,
  outcome: ScanOutcome
): ScanAttempt => ({
  ...attempt,
  status: outcome.status,
  durationMs: Date.now() - attempt.startedAt,
  label: 'label' in outcome ? outcome.label : undefined,
  matches: outcome.status === 'matched' ? outcome.matches : [],
});

const attemptProps = (attempt: ScanAttempt): PostHogProperties => {
  const [top, second] = attempt.matches;

  return {
    scan_id: attempt.scanId,
    user_id: attempt.userId,
    intent: attempt.intent,
    status: attempt.status,
    match_count: attempt.matches.length,
    top_score: top ? round(top.score) : undefined,
    top_name_score: top ? round(top.nameScore) : undefined,
    top_whiskey_id: top?.whiskey.id,
    second_score: second ? round(second.score) : undefined,
    score_gap: top && second ? round(top.score - second.score) : undefined,
    candidate_scores: attempt.matches.map(({ score }) => round(score)),
    best_match_shown: isBestMatch(attempt.matches, 0),
    label_has_brand: !!attempt.label?.brand,
    label_has_name: !!attempt.label?.name,
    scan_duration_ms: attempt.durationMs,
    timestamp: new Date().toISOString(),
  };
};

export const trackScanCompleted = (attempt: ScanAttempt): void =>
  capture('bottle_scan_completed', attemptProps(attempt));

export const trackScanOutcome = (
  attempt: ScanAttempt,
  outcome: ScanUserOutcome,
  sequence: number,
  selection?: ScanSelection
): void =>
  capture('bottle_scan_outcome', {
    ...attemptProps(attempt),
    outcome,
    outcome_sequence: sequence,
    selected_index: selection?.index,
    selected_score: selection ? round(selection.match.score) : undefined,
    selected_name_score: selection ? round(selection.match.nameScore) : undefined,
    selected_whiskey_id: selection?.match.whiskey.id,
    selected_is_best_match: selection
      ? isBestMatch(attempt.matches, selection.index)
      : undefined,
    time_to_outcome_ms: Date.now() - attempt.startedAt,
  });
