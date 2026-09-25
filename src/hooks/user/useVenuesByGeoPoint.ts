import { amplifyApiKey } from '@services';
import { User } from '@types';
import { LocationObject } from 'expo-location';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FindVenues } from './query/findVenues';

function useVenuesByGeoPoint(geoPoint: LocationObject, radius: number) {
  // Round coordinates to 3 decimal places (~111m precision) to prevent excessive cache entries
  // from minor GPS fluctuations. This means queries within ~111m will use the same cache.
  const roundedLat = geoPoint?.coords?.latitude
    ? Math.round(geoPoint.coords.latitude * 1000) / 1000
    : null;
  const roundedLon = geoPoint?.coords?.longitude
    ? Math.round(geoPoint.coords.longitude * 1000) / 1000
    : null;

  return useInfiniteQuery<{ nextToken: string; items: User[] }>({
    queryKey: [
      'get-venues-by-geopoint',
      roundedLat,
      roundedLon,
      radius,
    ],
    queryFn: async ({ pageParam }) => {
      const { findVenues } = await amplifyApiKey.request<{
        findVenues: { nextToken: string; items: User[] };
      }>(FindVenues, {
        input: {
          byGeoPoint: {
            geoPoint: {
              lat: geoPoint.coords.latitude,
              lon: geoPoint.coords.longitude,
            },
            radius,
          },
          nextToken: pageParam || null,
        },
      });

      return findVenues;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    staleTime: 5 * 60 * 1000,
    notifyOnChangeProps: ['data'],
    enabled: Boolean(geoPoint?.coords),
  });
}

export { useVenuesByGeoPoint };
