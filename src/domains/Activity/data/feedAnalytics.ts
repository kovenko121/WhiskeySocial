import { Post, ReferenceType } from '@types';
import { capturePostHogEvent } from '../../../config/posthog';
import { PostHogEventName, PostHogProperties } from '../../../types/posthog';

const capture = (name: PostHogEventName, properties: PostHogProperties): void => {
  try {
    capturePostHogEvent(name, properties);
  } catch {
    // Analytics must never take the feed or a navigation down with it.
  }
};

export type FeedItemType = 'post' | 'shared_post' | 'check_in';

export type FeedTapTarget = 'comments' | 'post_detail';

export type FeedItem = {
  item_id: string;
  item_type: FeedItemType;
  position: number;
};

const feedItemTypeOf = (post: Post): FeedItemType => {
  if (post.sharedPostId) return 'shared_post';
  const hasWhiskey = post.references?.some(
    (reference) => reference?.type === ReferenceType.WHISKEY
  );
  return hasWhiskey ? 'check_in' : 'post';
};

export const feedItemOf = (post: Post, position: number): FeedItem => ({
  item_id: post.id,
  item_type: feedItemTypeOf(post),
  position,
});

export const feedItemKey = (item: FeedItem): string =>
  `${item.item_type}:${item.item_id}`;

export const trackFeedItemsViewed = (items: FeedItem[]): void => {
  items.forEach((item) => capture('feed_item_viewed', { ...item }));
};

export const trackFeedItemTapped = (item: FeedItem, target: FeedTapTarget): void =>
  capture('feed_item_tapped', { ...item, tap_target: target });
