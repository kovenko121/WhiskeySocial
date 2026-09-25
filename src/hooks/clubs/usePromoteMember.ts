import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { ClubMember, ClubRole } from '@types';
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
      promotedBy
      __typename
    }
  }
`;

function usePromoteMember() {
  const {
    user: { sub },
  } = useAuth();

  const promoteMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    // userId is used to track who promoted the member
    async ({ memberId }: { clubId: string; memberId: string }, userId: string) => {
      // Update member role to ADMIN
      const { updateClubMember } = await amplify.request<{
        updateClubMember: ClubMember;
      }>(UpdateClubMember, {
        input: {
          id: memberId,
          role: ClubRole.CLUBADMINROLE,
          promotedBy: userId,
        },
      });

      return updateClubMember;
    },
    'Only club admins can promote members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => promoteMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubId] });
    },
  });
}

export { usePromoteMember };
