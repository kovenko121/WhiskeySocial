import { useFocusEffect } from '@react-navigation/native';
import { Post } from '@types';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, ViewToken } from 'react-native';
import {
  FeedItem,
  feedItemKey,
  feedItemOf,
  trackFeedItemsViewed,
} from '../data/feedAnalytics';

// Module-level and frozen: FlatList deep-compares viewabilityConfig on every update and
// throws if it differs, and Home re-renders on each refetch. Exactly one percent threshold
// may be set.
const FEED_VIEWABILITY_CONFIG = Object.freeze({
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
});

const FLUSH_AT = 10;

// Call from the screen, not the list: a tab round-trip can unmount the FlatList, and a
// de-duplication set living in that subtree would re-log everything already counted.
// De-duplication is per screen mount rather than per analytics session, so re-entry stays
// visible; $session_id rides along on every event if it ever needs collapsing further.
export const useFeedImpressions = () => {
  const seen = useRef<Set<string>>(new Set());
  const buffered = useRef<FeedItem[]>([]);

  const flush = useCallback(() => {
    if (buffered.current.length === 0) return;
    const batch = buffered.current;
    buffered.current = [];
    trackFeedItemsViewed(batch);
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ changed }: { changed: ViewToken[] }) => {
      changed.forEach((token) => {
        // `changed` also carries the items that just left the viewport.
        if (!token.isViewable || token.index == null || !token.item) return;

        // Read once here and never re-derived: the dwell timer builds the token against
        // whatever data is current when it fires, so a post arriving mid-dwell shifts
        // every index and a later lookup would credit the neighbouring card.
        const item = feedItemOf(token.item as Post, token.index);
        const key = feedItemKey(item);
        if (seen.current.has(key)) return;

        seen.current.add(key);
        buffered.current.push(item);
      });

      if (buffered.current.length >= FLUSH_AT) flush();
    },
    [flush]
  );

  // Held back until the scroll settles: each capture serialises and persists the whole
  // PostHog store on the JS thread, landing on the scroll being measured. Drag-end covers
  // the slow release that never produces momentum.
  const onScrollSettled = useCallback(() => flush(), [flush]);

  useFocusEffect(useCallback(() => flush, [flush]));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flush();
    });
    return () => subscription.remove();
  }, [flush]);

  return {
    viewabilityConfig: FEED_VIEWABILITY_CONFIG,
    onViewableItemsChanged,
    onScrollSettled,
  };
};
