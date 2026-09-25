import { useAuth } from '@contexts';
import { amplify } from '@services';
import { ClubRole, MemberStatus } from '@types';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const GetClubMembershipByUser = gql`
  query GetClubMembershipByUser(
    $userId: ID!
    $clubId: ModelIDKeyConditionInput
    $filter: ModelClubMemberFilterInput
  ) {
    clubMembersByUserIdAndClubId(
      userId: $userId
      clubId: $clubId
      filter: $filter
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;

interface ClubMembership {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  status: MemberStatus;
  joinedAt?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface GetClubMembershipResponse {
  items: ClubMembership[];
  nextToken: string | null;
}

function useGetClubMembership(clubId: string, refetchInterval?: number | false) {
  const {
    user: { sub },
  } = useAuth();

  return useQuery({
    queryKey: ['club-membership', clubId, sub],
    queryFn: async () => {
      const { clubMembersByUserIdAndClubId } = await amplify.request<{
        clubMembersByUserIdAndClubId: GetClubMembershipResponse;
      }>(GetClubMembershipByUser, {
        userId: sub,
        clubId: { eq: clubId },
      });

      // Return the first item if exists (should only be one membership per user per club)
      return clubMembersByUserIdAndClubId.items[0] || null;
    },
    enabled: !!clubId && !!sub,
    refetchInterval,
  });
}

export { useGetClubMembership };
export type { ClubMembership };
