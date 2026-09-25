import { amplify } from '@services';
import { Club, MemberStatus } from '@types';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const GetUserClubMemberships = gql`
  query GetUserClubMemberships(
    $userId: ID!
    $filter: ModelClubMemberFilterInput
    $limit: Int
    $nextToken: String
  ) {
    clubMembersByUserIdAndClubId(
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        clubId
        userId
        role
        status
        joinedAt
        club {
          id
          clubName
          searchName
          clubDetails
          coverPhoto
          profilePicture
          isPrivate
          memberCount
          whiskeyCount
          createdAt
          updatedAt
          __typename
        }
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
  role: string;
  status: MemberStatus;
  joinedAt?: string;
  club: Club;
}

interface GetUserClubMembershipsResponse {
  items: ClubMembership[];
  nextToken: string | null;
}

interface UseGetUserClubsParams {
  userId: string;
  enabled?: boolean;
}

function useGetUserClubs({ userId, enabled = true }: UseGetUserClubsParams) {
  return useQuery({
    queryKey: ['user-clubs', userId],
    queryFn: async () => {
      let allMemberships: ClubMembership[] = [];
      let nextToken: string | null = null;

      // Fetch all pages of memberships.
      // Cursor pagination: each page needs the previous page's nextToken.
      do {
        const {
          clubMembersByUserIdAndClubId,
        }: { clubMembersByUserIdAndClubId: GetUserClubMembershipsResponse } =
          // eslint-disable-next-line no-await-in-loop
          await amplify.request<{
            clubMembersByUserIdAndClubId: GetUserClubMembershipsResponse;
          }>(GetUserClubMemberships, {
            userId,
            filter: {
              status: { eq: MemberStatus.ACTIVE },
            },
            limit: 100,
            nextToken,
          });

        allMemberships = [
          ...allMemberships,
          ...clubMembersByUserIdAndClubId.items,
        ];
        nextToken = clubMembersByUserIdAndClubId.nextToken;
      } while (nextToken);

      // Filter out memberships without club data and sort by member count
      const clubs = allMemberships
        .filter((membership) => membership.club)
        .map((membership) => membership.club)
        .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

      return clubs;
    },
    enabled: enabled && !!userId,
  });
}

export { useGetUserClubs };
