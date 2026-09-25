import { useState, useEffect, useMemo } from 'react';
import { Storage } from 'aws-amplify';
import { S3Object } from '@types';
import { createLogger } from '../services/logger';

const logger = createLogger('useProfilePicture');

/**
 * Custom hook to load and manage profile picture URLs from S3
 * Handles multiple input formats: S3 objects, S3 keys, and direct URLs
 */
export const useProfilePicture = (profilePicture: S3Object | string | null | undefined) => {
  const [profilePictureUri, setProfilePictureUri] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create a stable representation of the profile picture to prevent unnecessary re-fetches
  // Stores the type and all necessary details in a memoized object
  const profilePictureData = useMemo(() => {
    if (!profilePicture) return null;

    // Direct URL
    if (typeof profilePicture === 'string' && profilePicture.startsWith('http')) {
      return { type: 'url' as const, url: profilePicture };
    }

    // S3 key as string
    if (typeof profilePicture === 'string') {
      return { type: 's3key' as const, key: profilePicture };
    }

    // S3 object with bucket/region/key
    if (typeof profilePicture === 'object' && profilePicture.key) {
      return {
        type: 's3object' as const,
        key: profilePicture.key,
        bucket: profilePicture.bucket,
        region: profilePicture.region,
      };
    }

    return null;
  }, [profilePicture]);

  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!profilePictureData) {
        setProfilePictureUri(undefined);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (profilePictureData.type === 's3object') {
          // S3 object with bucket/region/key
          const signedUrl = await Storage.get(profilePictureData.key, {
            bucket: profilePictureData.bucket,
            region: profilePictureData.region,
            level: 'public',
          });
          setProfilePictureUri(signedUrl);
        } else if (profilePictureData.type === 'url') {
          // Already a full URL
          setProfilePictureUri(profilePictureData.url);
        } else if (profilePictureData.type === 's3key') {
          // S3 key - get signed URL
          const signedUrl = await Storage.get(profilePictureData.key, { level: 'public' });
          setProfilePictureUri(signedUrl);
        }
      } catch (err) {
        logger.error('Error loading profile picture:', err as Error);
        setError(err instanceof Error ? err : new Error('Failed to load profile picture'));
        setProfilePictureUri(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfilePicture();
  }, [profilePictureData]);

  return { profilePictureUri, isLoading, error };
};
