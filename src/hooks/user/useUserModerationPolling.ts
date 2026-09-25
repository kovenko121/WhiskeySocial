import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { amplify, queryClient } from '@services';
import { ModerationStatus } from '@types';
import { useAuth } from '../../contexts';
import { GetUser } from './query/getUser';
import { createLogger } from '../../services/logger';

const logger = createLogger('useUserModerationPolling');

// Constants for polling and timing
const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds
const MAX_TRACKING_DURATION_MS = 30 * 1000; // Maximum 30 seconds to track
const CACHE_UPDATE_DELAY_MS = 500; // Delay before updating cache after approval

interface TrackedImageUpload {
  id: string; // userId
  imageType: 'profile' | 'cover';
  addedAt: number;
  lastStatus: string | null;
}

type ModerationCallback = (
  imageType: 'profile' | 'cover',
  status: ModerationStatus.APPROVED | ModerationStatus.REJECTED | ModerationStatus.ERROR
) => void;

export const useUserModerationPolling = (onStatusChange?: ModerationCallback) => {
  const { user } = useAuth();
  const currentUserId = user?.sub;
  const [trackedImages, setTrackedImages] = useState<TrackedImageUpload[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedImagesRef = useRef<TrackedImageUpload[]>([]);
  const currentUserIdRef = useRef(currentUserId);
  const callbackRef = useRef(onStatusChange);

  trackedImagesRef.current = trackedImages;
  currentUserIdRef.current = currentUserId;
  callbackRef.current = onStatusChange;

  const trackImageUpload = (imageType: 'profile' | 'cover') => {
    if (!currentUserId) return;
    setTrackedImages(prev => {
      const filtered = prev.filter(img => !(img.id === currentUserId && img.imageType === imageType));
      const newTracked = [
        ...filtered,
        {
          id: currentUserId,
          imageType,
          addedAt: Date.now(),
          lastStatus: ModerationStatus.PENDING,
        },
      ];
      return newTracked;
    });
  };

  const pollImageStatus = async (trackedImage: TrackedImageUpload) => {
    try {
      const { getUser } = await amplify.request<{ getUser: any }>(GetUser, {
        id: trackedImage.id,
      });

      if (!getUser) {
        logger.info(`User not found, removing from tracking: ${trackedImage.id}`);
        setTrackedImages(prev => prev.filter(img => img.id !== trackedImage.id));
        return;
      }

      const statusField =
        trackedImage.imageType === 'profile'
          ? 'profilePictureModerationStatus'
          : 'coverPictureModerationStatus';

      const currentStatus = getUser[statusField];

      logger.info(`Polled ${trackedImage.imageType} image for user ${trackedImage.id} status: ${currentStatus}, previous: ${trackedImage.lastStatus}`);

      // Check for PENDING → REJECTED transition
      if (trackedImage.lastStatus === ModerationStatus.PENDING && currentStatus === ModerationStatus.REJECTED) {
        logger.info(`${trackedImage.imageType} image rejected! Showing alert for user: ${trackedImage.id}`);

        // Call the callback if provided
        if (callbackRef.current) {
          callbackRef.current(trackedImage.imageType, ModerationStatus.REJECTED);
        }

        Alert.alert(
          `${trackedImage.imageType === 'profile' ? 'Profile' : 'Cover'} Picture Not Approved`,
          'Your image did not pass content moderation and will be removed.',
          [{ text: 'OK' }]
        );
        // Refresh cache to get the cleared image from database (like Posts do)
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['get-user', trackedImage.id] });
        }, CACHE_UPDATE_DELAY_MS);
      }

      // Check for PENDING → APPROVED transition
      if (trackedImage.lastStatus === ModerationStatus.PENDING && currentStatus === ModerationStatus.APPROVED) {
        logger.info(`${trackedImage.imageType} image approved for user: ${trackedImage.id}`);

        // Call the callback if provided
        if (callbackRef.current) {
          callbackRef.current(trackedImage.imageType, ModerationStatus.APPROVED);
        }

        // Refresh cache when approved (like Posts do)
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['get-user', trackedImage.id] });
        }, CACHE_UPDATE_DELAY_MS);
      }

      // Check for PENDING → ERROR transition
      if (trackedImage.lastStatus === ModerationStatus.PENDING && currentStatus === ModerationStatus.ERROR) {
        logger.error(`${trackedImage.imageType} image processing failed for user: ${trackedImage.id}`);

        // Call the callback if provided
        if (callbackRef.current) {
          callbackRef.current(trackedImage.imageType, ModerationStatus.ERROR);
        }

        Alert.alert('Processing Failed', 'Unable to process your image. Please try uploading again.', [
          { text: 'OK' },
        ]);
      }

      // Only update lastStatus when we transition from PENDING to a final status
      if (trackedImage.lastStatus === ModerationStatus.PENDING && [ModerationStatus.APPROVED, ModerationStatus.REJECTED, ModerationStatus.ERROR].includes(currentStatus)) {
        setTrackedImages(prev =>
          prev.map(img =>
            img.id === trackedImage.id && img.imageType === trackedImage.imageType
              ? { ...img, lastStatus: currentStatus }
              : img
          )
        );
      }

      // Stop tracking if status is final
      if ([ModerationStatus.APPROVED, ModerationStatus.REJECTED, ModerationStatus.ERROR].includes(currentStatus)) {
        logger.info(`Final status reached (${currentStatus}), removing ${trackedImage.imageType} from tracking for user: ${trackedImage.id}`);
        setTrackedImages(prev =>
          prev.filter(img => !(img.id === trackedImage.id && img.imageType === trackedImage.imageType))
        );

        // Cache refresh is already handled above in the specific transition handlers
      }
    } catch (error) {
      logger.warn(`Error polling ${trackedImage.imageType} image status:`, error as Error);
    }
  };

  useEffect(() => {
    if (!currentUserId || trackedImages.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    // Set up interval only when we have images to track
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const maxAge = MAX_TRACKING_DURATION_MS;
        const now = Date.now();

        // Check for timed out images and alert user
        const timedOut = trackedImagesRef.current.filter(img =>
          (now - img.addedAt) >= maxAge && img.lastStatus === ModerationStatus.PENDING
        );

        if (timedOut.length > 0) {
          logger.info(`Images timed out after 30 seconds: ${  timedOut.map(img => `${img.imageType} for ${img.id}`).join(', ')}`);
          Alert.alert(
            'Processing Taking Longer Than Expected',
            'Your image is still being processed. Please check back later.',
            [{ text: 'OK' }]
          );


          // Remove timed out images
          setTrackedImages(prev => prev.filter(img => (now - img.addedAt) < maxAge));
        }

        trackedImagesRef.current.forEach(pollImageStatus);
      }, POLLING_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentUserId, trackedImages.length]);

  return {
    trackImageUpload,
    trackedImagesCount: trackedImages.length,
  };
};
