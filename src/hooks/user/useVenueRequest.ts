import { useAuth } from '@contexts';
import { amplify } from '@services';
import { VenueRequest } from '@types';
import { useQuery } from '@tanstack/react-query';
import { listVenueRequests } from '../../graphql/queries';

function useGetVenueRequest(venueId: string) {
  const {
    user: { sub },
  } = useAuth();

  return useQuery<VenueRequest>({
    queryKey: ['get-venue-request', venueId],
    queryFn: async () => {
      const response = await amplify.request<{ listVenueRequests: VenueRequest }>(
        listVenueRequests,
        {
          filter: {
            userId: { eq: sub },
            and: {
              venueId: { eq: venueId },
            },
          },
        }
      );

      return response.listVenueRequests?.items.length > 0
        ? response.listVenueRequests.items[0]
        : null;
    },
  });
}

export { useGetVenueRequest };
