/**
 * Leaderboard — "Trending Bottles Tonight", the live bottle ranking across all attendees, read
 * from the `TastingLeaderboardCounter` rows the stream Lambda maintains. The "Live Updates" dot
 * only ever needs to mean "recent," not "instant."
 */
import { Header } from '@components';
import { useAuth } from '@contexts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '@types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { LeaderRow } from '../components/LeaderRow/LeaderRow';
import { trackLeaderboardViewed } from '../data/passportAnalytics';
import { useBoothArtwork } from '../data/useBoothArtwork';
import { useBrandDetails } from '../data/useBrandDetails';
import { useEventLeaderboard } from '../data/useEventLeaderboard';
import { useTastingEventContent } from '../data/useTastingEventContent';
import { NO_EVENT } from '../types';
import {
  Body,
  Dot,
  EmptyText,
  LiveRow,
  LiveText,
  Scroll,
  ScreenContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Leaderboard'>;

export const LeaderboardScreen = ({ route }: Props) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  // Reached directly from the Passport, so the event content and its brand records are
  // already cached — read here too, for the logos on the row badges. A read that came
  // back with nothing costs the rows their artwork, never the ranking itself.
  const { event: liveEvent } = useTastingEventContent(eventId);
  const event = liveEvent ?? NO_EVENT;
  const brandDetails = useBrandDetails(event.booths);
  const artwork = useBoothArtwork(event, brandDetails);
  const { rows, loading, refetch } = useEventLeaderboard(eventId, !!user?.sub, artwork);

  // Once per visit, after the first load — the 30s poll must not report a new view.
  const viewReported = useRef(false);
  useEffect(() => {
    if (loading || viewReported.current) return;
    viewReported.current = true;
    trackLeaderboardViewed(event, user?.sub ?? 'guest', rows.length);
  }, [loading, event, user?.sub, rows.length]);

  // Not `isFetching`, which the 30s poll would also set — the spinner answers the
  // attendee's pull, it doesn't narrate the background refresh.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScreenContainer>
      <Header title="Trending Bottles Tonight" />
      <LiveRow>
        <Dot />
        <LiveText>Live Updates</LiveText>
      </LiveRow>
      <Scroll
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
      >
        <Body>
          {loading && <ActivityIndicator color="white" />}
          {!loading && rows.length === 0 && (
            <EmptyText>
              No bottles on the board yet. Mark a pour as tasted to start the
              count.
            </EmptyText>
          )}
          {rows.map((row) => (
            <LeaderRow key={row.rank} row={row} />
          ))}
        </Body>
      </Scroll>
    </ScreenContainer>
  );
};
