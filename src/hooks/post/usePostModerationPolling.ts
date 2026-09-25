import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { amplify, queryClient } from '@services';
import { useAuth } from '../../contexts';
import { GetPost } from './query/GetPost';
import { createLogger } from '../../services/logger';

const logger = createLogger('usePostModerationPolling');

// Constants for polling and timing
const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds
const MAX_TRACKING_DURATION_MS = 30 * 1000; // Maximum 30 seconds to track
const CACHE_UPDATE_DELAY_MS = 500; // Delay before updating cache

interface TrackedPost {
  id: string;
  addedAt: number;
  lastStatus: string | null;
}

/**
 * Hook that polls recently created posts to detect moderation status changes
 * Shows rejection alerts when posts change from PENDING to REJECTED
 */
export const usePostModerationPolling = () => {
  const { user: { sub: currentUserId } } = useAuth();
  const [trackedPosts, setTrackedPosts] = useState<TrackedPost[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add a new post to track
  const trackPost = (postId: string) => {
    logger.info(`Starting to track post for moderation: ${  postId}`);
    setTrackedPosts(prev => {
      // Don't add duplicates
      if (prev.find(p => p.id === postId)) return prev;

      return [...prev, {
        id: postId,
        addedAt: Date.now(),
        lastStatus: 'PENDING'
      }];
    });
  };

  // Remove posts that are too old or resolved
  const cleanupOldPosts = () => {
    const maxAge = MAX_TRACKING_DURATION_MS;
    const now = Date.now();

    setTrackedPosts(prev => {
      // Check for timed-out posts that are still pending
      const timedOut = prev.filter(post =>
        (now - post.addedAt) >= maxAge && post.lastStatus === 'PENDING'
      );

      // If any posts timed out, alert user and refresh feed
      if (timedOut.length > 0) {
        logger.info(`Posts timed out after 30 seconds: ${  timedOut.map(p => p.id).join(', ')}`);
        Alert.alert(
          'Processing Taking Longer Than Expected',
          'Your post is still being processed. Please check back later.',
          [{ text: 'OK' }]
        );

        // Refresh the feed to hide stuck PENDING posts
        setTimeout(() => {
          queryClient.refetchQueries({ predicate: (query) => query.queryKey[0] === 'get-posts' });
          // Also refetch all club-posts in case any timed out posts were club posts
          queryClient.refetchQueries({ predicate: (query) => query.queryKey[0] === 'club-posts' });
        }, CACHE_UPDATE_DELAY_MS);
      }

      return prev.filter(post => (now - post.addedAt) < maxAge);
    });
  };

  // Poll a specific post for status changes
  const pollPostStatus = async (trackedPost: TrackedPost) => {
    try {
      const { getPost } = await amplify.request<{ getPost: any }>(GetPost, {
        id: trackedPost.id
      });

      if (!getPost) {
        logger.info(`Post not found, removing from tracking: ${  trackedPost.id}`);
        setTrackedPosts(prev => prev.filter(p => p.id !== trackedPost.id));
        return;
      }

      const currentStatus = getPost.photoModerationStatus;
      logger.info(`Polled post ${trackedPost.id} status: ${currentStatus}, previous: ${trackedPost.lastStatus}`);

      // Check for PENDING → REJECTED transition
      if (trackedPost.lastStatus === 'PENDING' && currentStatus === 'REJECTED') {
        logger.info(`Post rejected! Showing alert for: ${  trackedPost.id}`);
        Alert.alert(
          'Image Not Approved',
          'Your post did not pass content moderation and has been removed.',
          [{ text: 'OK' }]
        );
        // Refresh cache to remove the rejected post from UI
        setTimeout(() => {
          queryClient.refetchQueries({ predicate: (query) => query.queryKey[0] === 'get-posts' });
          // Also refetch club-posts if this is a club post
          if (getPost.clubId) {
            queryClient.refetchQueries({ queryKey: ['club-posts', getPost.clubId] });
          }
        }, CACHE_UPDATE_DELAY_MS);
      }

      // Check for PENDING → ERROR transition
      if (trackedPost.lastStatus === 'PENDING' && currentStatus === 'ERROR') {
        logger.error(`Post moderation failed! Showing alert for: ${  trackedPost.id}`);
        Alert.alert(
          'Processing Failed',
          'Unable to process your image. Please try posting again.',
          [{ text: 'OK' }]
        );
      }

      // Update tracked status
      setTrackedPosts(prev =>
        prev.map(p =>
          p.id === trackedPost.id
            ? { ...p, lastStatus: currentStatus }
            : p
        )
      );

      // Stop tracking if status is final (APPROVED, REJECTED, or ERROR)
      if (currentStatus === 'APPROVED' || currentStatus === 'REJECTED' || currentStatus === 'ERROR') {
        logger.info(`Final status reached, removing from tracking: ${  trackedPost.id}`);
        setTrackedPosts(prev => prev.filter(p => p.id !== trackedPost.id));

        // Refresh the posts cache when status changes from PENDING to APPROVED
        if (trackedPost.lastStatus === 'PENDING' && currentStatus === 'APPROVED') {
          logger.info(`Post approved! Refreshing cache for: ${  trackedPost.id}`);
          setTimeout(() => {
            queryClient.refetchQueries({ predicate: (query) => query.queryKey[0] === 'get-posts' });
            // Also refetch club-posts if this is a club post
            if (getPost.clubId) {
              queryClient.refetchQueries({ queryKey: ['club-posts', getPost.clubId] });
            }
          }, 500);
        }
      }

    } catch (error) {
      logger.warn('Error polling post status:', error as Error);
    }
  };

  // Main polling effect
  useEffect(() => {
    if (!currentUserId || trackedPosts.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    logger.info(`Starting polling for ${  trackedPosts.length  } posts`);

    // Poll every 2 seconds
    intervalRef.current = setInterval(() => {
      cleanupOldPosts();
      trackedPosts.forEach(pollPostStatus);
    }, POLLING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Keyed on trackedPosts.length so the interval is not torn down and recreated on
    // every state update. The interval closes over trackedPosts, so it can read a
    // stale array if the contents change without the length changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, trackedPosts.length]);

  // Cleanup on unmount
  useEffect(() => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, []);

  return {
    trackPost,
    trackedPostsCount: trackedPosts.length
  };
};