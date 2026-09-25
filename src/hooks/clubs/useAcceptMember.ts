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
      joinedAt
      requestedAt
      createdAt
      updatedAt
      approvedBy
      __typename
    }
  }
`;

function useAcceptMember() {
  const {
    user: { sub },
  } = useAuth();

  const acceptMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    // userId is used to track who approved the member
    async ({ memberId }: { clubId: string; memberId: string }, userId: string) => {
      const now = new Date().toISOString();

      // Update member status to ACTIVE - Lambda will handle memberCount update via DynamoDB stream
      const { updateClubMember } = await amplify.request<{
        updateClubMember: ClubMember;
      }>(UpdateClubMember, {
        input: {
          id: memberId,
          status: MemberStatus.ACTIVE,
          joinedAt: now,
          approvedBy: userId,
        },
      });

      return updateClubMember;
    },
    'Only club admins can accept members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => acceptMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries to refetch updated counts from Lambda
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-pending-members', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-blocked-members', variables.clubId] });
    },
  });
}

export { useAcceptMember };
