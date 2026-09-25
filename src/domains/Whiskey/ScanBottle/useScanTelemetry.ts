import { useAuth } from '@contexts';
import type { ScannedMatch } from '@helpers';
import type { ScanOutcome } from '@hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  completeScanAttempt,
  startScanAttempt,
  trackScanCompleted,
  trackScanOutcome,
} from '../data/scanAnalytics';
import type { ScanIntent, ScanSelection, ScanUserOutcome } from '../data/scanAnalytics';

export const useScanTelemetry = (intent: ScanIntent, outcome?: ScanOutcome) => {
  const { user } = useAuth();
  const [attempt] = useState(() => startScanAttempt(intent, user?.sub));
  const attemptRef = useRef(attempt);
  const outcomeCountRef = useRef(0);

  useEffect(() => {
    if (!outcome || attemptRef.current.status !== 'pending') return;

    attemptRef.current = completeScanAttempt(attemptRef.current, outcome);
    trackScanCompleted(attemptRef.current);
  }, [outcome]);

  const record = useCallback((result: ScanUserOutcome, selection?: ScanSelection) => {
    outcomeCountRef.current += 1;
    trackScanOutcome(attemptRef.current, result, outcomeCountRef.current, selection);
  }, []);

  const recordMatchSelected = useCallback(
    (match: ScannedMatch, index: number) => record('match_selected', { match, index }),
    [record]
  );

  const recordSuggestNew = useCallback(() => record('suggest_new'), [record]);

  const recordRetake = useCallback(() => record('retake'), [record]);

  useEffect(
    () => () => {
      if (outcomeCountRef.current === 0) record('abandoned');
    },
    [record]
  );

  return { recordMatchSelected, recordSuggestNew, recordRetake };
};
