import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { ClubMember, MemberStatus } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const UpdateClubMember = gql`
  mutation UpdateClubMember($input: UpdateClubMemberInput!) {
    updateClubMember(input: $input) {
      id
      clubId
      userId
      role
      status
      __typename
    }
  }
`;

function useUnblockMember() {
  const {
    user: { sub },
  } = useAuth();

  const unblockMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ memberId }: { clubId: string; memberId: string }) => {
      // Update member status to PENDING (unblocking moves them to pending status, where they must be manually approved)
      const { updateClubMember } = await amplify.request<{
        updateClubMember: ClubMember;
      }>(UpdateClubMember, {
        input: {
          id: memberId,
          status: MemberStatus.PENDING,
        },
      });

      return updateClubMember;
    },
    'Only club admins can unblock members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => unblockMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-pending-members', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-blocked-members', variables.clubId] });
    },
  });
}

export { useUnblockMember };
