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
      role
      status
      __typename
    }
  }
`;

interface LeaveClubParams {
  clubId: string;
  membershipId: string;
}

function useLeaveClub() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<void, unknown, LeaveClubParams>({
    mutationFn: async ({ membershipId }: LeaveClubParams): Promise<void> => {
      // Mark as user-left before delete to prevent "removed" notification
      await amplify.request(UpdateClubMember, {
        input: { id: membershipId, deletionType: 'USER_LEFT' },
      });
      await amplify.request(DeleteClubMember, {
        input: { id: membershipId },
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.refetchQueries({
        queryKey: ['club-membership', variables.clubId, sub],
      });
      queryClient.refetchQueries({ queryKey: ['club', variables.clubId] });
      queryClient.refetchQueries({ queryKey: ['club-members', variables.clubId] });
      queryClient.refetchQueries({ queryKey: ['search-clubs'] });
      queryClient.refetchQueries({ queryKey: ['clubs', 'list'] });
      // Invalidate user's club list so Home feed excludes posts from left club
      queryClient.invalidateQueries({ queryKey: ['user-clubs', sub] });
    },
  });
}

export { useLeaveClub };
