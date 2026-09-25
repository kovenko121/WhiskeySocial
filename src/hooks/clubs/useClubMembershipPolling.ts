import { useIsFocused } from '@react-navigation/native';
import { MemberStatus } from '@types';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGetClubMembership } from './useGetClubMembership';
import { DefaultClubPollingInterval } from './useValidateClubMembership';

interface UseClubMembershipPollingResult {
  membership: ReturnType<typeof useGetClubMembership>['data'];
  wasBlocked: boolean;
  refetch: ReturnType<typeof useGetClubMembership>['refetch'];
}

/**
 * Hook that polls for club membership status and detects when a user gets blocked.
 * Handles AppState and screen focus to only poll when appropriate.
 *
 * @param clubId - The club ID to poll membership for
 * @returns membership data, a wasBlocked flag, and refetch function
 *
 * @example
 * const { membership, wasBlocked, refetch } = useClubMembershipPolling(clubId);
 *
 * useEffect(() => {
 *   if (wasBlocked) {
 *     Alert.alert('Removed from Club', 'You are no longer a member.', [
 *       { text: 'OK', onPress: () => navigation.goBack() }
 *     ]);
 *   }
 * }, [wasBlocked]);
 */
function useClubMembershipPolling(
  clubId: string
): UseClubMembershipPollingResult {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const previousStatus = useRef<MemberStatus | null>(null);
  const [wasBlocked, setWasBlocked] = useState(false);

  // Track app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  // Only poll when screen is focused AND app is in foreground
  const shouldPoll = isFocused && appState === 'active';

  const { data: membership, refetch } = useGetClubMembership(
    clubId,
    shouldPoll ? DefaultClubPollingInterval : false
  );

  // Detect when user gets blocked
  useEffect(() => {
    // Skip on initial load
    if (previousStatus.current === null) {
      previousStatus.current = membership?.status ?? null;
      return;
    }

    // Check if status changed to BLOCKED
    if (
      membership?.status === MemberStatus.BLOCKED &&
      previousStatus.current !== MemberStatus.BLOCKED
    ) {
      setWasBlocked(true);
    }

    previousStatus.current = membership?.status ?? null;
  }, [membership?.status]);

  return {
    membership,
    wasBlocked,
    refetch,
  };
}

export { useClubMembershipPolling };
