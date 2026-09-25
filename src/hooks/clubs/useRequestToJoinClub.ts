import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { ClubMember, ClubRole, MemberStatus } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const CreateClubMemberRequest = gql`
  mutation CreateClubMember($input: CreateClubMemberInput!) {
    createClubMember(input: $input) {
      id
      clubId
      userId
      role
      status
      joinedAt
      requestedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;

function useRequestToJoinClub() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId }: { clubId: string }) => {
      const now = new Date().toISOString();

      const { createClubMember } = await amplify.request<{
        createClubMember: ClubMember;
      }>(CreateClubMemberRequest, {
        input: {
          clubId,
          userId: sub,
          role: ClubRole.CLUBMEMBERROLE,
          status: MemberStatus.PENDING,
          requestedAt: now,
          // Note: joinedAt is NOT set for pending requests
        },
      });

      return createClubMember;
    },
    onSuccess: (_data, variables) => {
      // Refetch user's membership status
      queryClient.invalidateQueries({
        queryKey: ['club-membership', variables.clubId, sub],
      });
      // Refetch club search results (button text will change from "Request to Join" to "Request Pending")
      queryClient.invalidateQueries({ queryKey: ['search-clubs'] });
    },
  });
}

export { useRequestToJoinClub };
