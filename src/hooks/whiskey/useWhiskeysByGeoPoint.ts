import { useAuth } from '@contexts';
import { amplify, amplifyApiKey } from '@services';
import { User } from '@types';
import { LocationObject } from 'expo-location';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { createLogger } from '../../services/logger';
import { FindVenuesStockingWhiskey } from './query/findVenuesStockingWhiskey';

const logger = createLogger('useWhiskeysByGeoPoint');

function useWhiskeysByGeoPoint(
  whiskeyId: string,
  geoPoint: LocationObject | undefined
) {
  const { isGuest } = useAuth();
  const client = isGuest ? amplifyApiKey : amplify;

  return useInfiniteQuery<{ nextToken: string; items: { user?: User }[] }>({
    queryKey: ['get-whiskeys-by-geopoint', geoPoint, whiskeyId, isGuest],
    queryFn: async () => {
      try {
        const { findVenuesStockingWhiskey } = await client.request<{
          findVenuesStockingWhiskey: {
            nextToken: string;
            items: { user?: User }[];
          };
        }>(FindVenuesStockingWhiskey, {
          lat: geoPoint!.coords.latitude,
          lon: geoPoint!.coords.longitude,
          whiskeyId,
        });

        return findVenuesStockingWhiskey;
      } catch (error) {
        logger.error(
          'Failed to fetch nearby venues stocking bottle',
          error as Error,
          { extra: { whiskeyId, isGuest } }
        );
        throw error;
      }
    },
    enabled: !!geoPoint,
    initialPageParam: null,
    // The resolver pages by integer offset, which nothing on the bottle screen
    // asks for; a single page of results is all this section renders.
    getNextPageParam: () => null,
    // The watched position changes the query key on every location tick;
    // holding the last results keeps the section from emptying out mid-move.
    placeholderData: keepPreviousData,
  });
}

export { useWhiskeysByGeoPoint };
