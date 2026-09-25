import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const UpdateClubMember = gql`
  mutation UpdateClubMember($input: UpdateClubMemberInput!) {
    updateClubMember(input: $input) {
      id
    }
  }
`;

const DeleteClubMember = gql`
  mutation DeleteClubMember($input: DeleteClubMemberInput!) {
    deleteClubMember(input: $input) {
      id
      clubId
      userId
      status
      __typename
    }
  }
`;

interface CancelJoinRequestParams {
  clubId: string;
  membershipId: string;
}

function useCancelJoinRequest() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<void, unknown, CancelJoinRequestParams>({
    mutationFn: async ({ membershipId }: CancelJoinRequestParams) => {
      // Mark as user-canceled before delete to prevent "rejected" notification
      await amplify.request(UpdateClubMember, {
        input: { id: membershipId, deletionType: 'USER_CANCELED' },
      });
      await amplify.request(DeleteClubMember, {
        input: { id: membershipId },
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate membership queries
      queryClient.refetchQueries({
        queryKey: ['club-membership', variables.clubId, sub],
      });
    },
  });
}

export { useCancelJoinRequest };
