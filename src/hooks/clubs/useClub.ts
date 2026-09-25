import { amplify } from '@services';
import { Club } from '@types';
import { useQuery } from '@tanstack/react-query';
import { Storage } from 'aws-amplify';
import { GetClub } from './query/getClub';
import { createLogger } from '../../services/logger';

const logger = createLogger('useClub');

function useClub(clubId: string) {
  return useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const { getClub } = await amplify.request<{
        getClub: Club;
      }>(GetClub, {
        id: clubId,
      });

      // Process S3 image keys if they exist
      let coverPhotoUrl = getClub.coverPhoto;
      let profilePictureUrl = getClub.profilePicture;

      if (getClub.coverPhoto) {
        try {
          coverPhotoUrl = await Storage.get(getClub.coverPhoto);
        } catch (error) {
          logger.warn('Failed to load cover photo:', error as Error);
          coverPhotoUrl = undefined;
        }
      }

      if (getClub.profilePicture) {
        try {
          profilePictureUrl = await Storage.get(getClub.profilePicture);
        } catch (error) {
          logger.warn('Failed to load profile picture:', error as Error);
          profilePictureUrl = undefined;
        }
      }

      return {
        ...getClub,
        coverPhoto: coverPhotoUrl,
        profilePicture: profilePictureUrl,
      };
    },
    enabled: !!clubId,
    retry: 2, // Retry failed queries twice
    staleTime: 0, // Always refetch on mount to prevent cached failures
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 min when unmounted
  });
}

export { useClub };
