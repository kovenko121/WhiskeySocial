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
      __typename
    }
  }
`;

function useDemoteMember() {
  const {
    user: { sub },
  } = useAuth();

  const demoteMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ memberId }: { clubId: string; memberId: string }) => {
      // Update member role to MEMBER
      const { updateClubMember } = await amplify.request<{
        updateClubMember: ClubMember;
      }>(UpdateClubMember, {
        input: {
          id: memberId,
          role: ClubRole.CLUBMEMBERROLE,
        },
      });

      return updateClubMember;
    },
    'Only club admins can demote members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => demoteMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubId] });
    },
  });
}

export { useDemoteMember };
