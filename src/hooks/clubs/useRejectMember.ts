import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { ClubMember } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const DeleteClubMember = gql`
  mutation DeleteClubMember($input: DeleteClubMemberInput!) {
    deleteClubMember(input: $input) {
      id
      clubId
      userId
      __typename
    }
  }
`;

function useRejectMember() {
  const {
    user: { sub },
  } = useAuth();

  const rejectMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ memberId }: { clubId: string; memberId: string }) => {
      const { deleteClubMember } = await amplify.request<{
        deleteClubMember: ClubMember;
      }>(DeleteClubMember, {
        input: {
          id: memberId,
        },
      });

      return deleteClubMember;
    },
    'Only club admins can reject members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => rejectMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-pending-members', variables.clubId] });
    },
  });
}

export { useRejectMember };
