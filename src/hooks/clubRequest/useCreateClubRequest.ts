import { amplify } from '@services';
import { ClubRequestStatus } from '@types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClubRequestMutation } from './mutation/createClubRequest';

interface CreateClubRequestInput {
  clubName: string;
  description: string;
  location?: string;
  currentMemberCount: number;
  isPrivate: boolean;
  requestedBy: string;
}

function useCreateClubRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClubRequestInput) => {
      const response = await amplify.request(createClubRequestMutation, {
        input: {
          ...input,
          status: ClubRequestStatus.PENDING,
        },
      });

      return response;
    },
    onSuccess: () => {
      // Invalidate any club request queries if needed
      queryClient.invalidateQueries({ queryKey: ['club-requests'] });
    },
  });
}

export { useCreateClubRequest };
