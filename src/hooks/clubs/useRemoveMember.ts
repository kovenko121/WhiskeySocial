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

function useRemoveMember() {
  const {
    user: { sub },
  } = useAuth();

  const removeMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ memberId }: { clubId: string; memberId: string }) => {
      // Delete the member - Lambda will handle memberCount update via DynamoDB stream
      const { deleteClubMember } = await amplify.request<{
        deleteClubMember: ClubMember;
      }>(DeleteClubMember, {
        input: {
          id: memberId,
        },
      });

      return deleteClubMember;
    },
    'Only club admins can remove members'
  );

  return useMutation({
    mutationFn: (params: { clubId: string; memberId: string }) => removeMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries to refetch updated counts from Lambda
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubId] });
    },
  });
}

export { useRemoveMember };
