import { useAuth } from '@contexts';
import { getS3Image } from '@helpers';
import { amplify } from '@services';
import { useQuery } from '@tanstack/react-query';
import { createLogger } from '../../services/logger';
import { GetUserBottle } from './query/getUserBottle';

const logger = createLogger('useGetUserBottle');

function useGetUserBottle(bottleId: string) {
  const {
    user: { sub },
  } = useAuth();

  return useQuery({
    queryKey: ['get-user-whiskey', bottleId],
    queryFn: async () => {
      const { getUserWhiskeys } = await amplify.request<{
        getUserWhiskeys: any;
      }>(GetUserBottle, {
        bottleId,
        userId: sub,
      });

      if (!getUserWhiskeys.whiskey) {
        logger.warn('Bottle has no associated whiskey record', {
          extra: { bottleId, userId: sub },
        });
        return getUserWhiskeys;
      }

      try {
        if (getUserWhiskeys.whiskey.brandUser?.brandLogo) {
          getUserWhiskeys.whiskey.brandUser.brandLogo = await getS3Image(
            getUserWhiskeys.whiskey.brandUser.brandLogo
          );
        }
        if (getUserWhiskeys.whiskey.picture) {
          getUserWhiskeys.whiskey.picture = await getS3Image(
            getUserWhiskeys.whiskey.picture
          );
        }
      } catch (err) {
        logger.error('Failed to load bottle images', err instanceof Error ? err : new Error(String(err)), {
          extra: { bottleId },
        });
      }

      return getUserWhiskeys;
    },
  });
}

export { useGetUserBottle };
