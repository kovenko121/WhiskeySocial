import { amplifyApiKey, queryClient } from '@services';
import {
  CreateVenueRequestInput,
  CreateVenueRequestMutation,
  VenueRequestStatus,
} from '@types';
import { useMutation } from '@tanstack/react-query';
import { createVenueRequest } from '../../graphql/mutations';

const useCreateVenueRequest = () =>
  useMutation<CreateVenueRequestMutation, unknown, CreateVenueRequestInput>({
    mutationFn: async (data) => {
      const response = await amplifyApiKey.request<{
        createVenueRequest: CreateVenueRequestMutation;
      }>(createVenueRequest, {
        input: {
          ...data,
          status: VenueRequestStatus.PENDING,
        },
      });

      return response.createVenueRequest;
    },
    onSuccess(data) {
      queryClient.refetchQueries({
        queryKey: ['get-venue-request', data?.venueId],
      });
    },
  });

export { useCreateVenueRequest };
