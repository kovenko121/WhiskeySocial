import { amplify } from '@services';
import { ClubMember, MemberStatus } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListClubMembers = gql`
  query ListClubMembers(
    $clubId: ID!
    $filter: ModelClubMemberFilterInput
    $limit: Int
    $nextToken: String
  ) {
    clubMembersByClubIdAndUserId(
      clubId: $clubId
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
        user {
          id
          username
          userType
          personFirstName
          personLastName
          venueName
          brandName
          profilePicture {
            bucket
            region
            key
          }
          brandLogo {
            bucket
            region
            key
          }
          venueAddressStreet
          venueAddressNumber
          venueAddressCity
          venueAddressState
          followers
          following
          deleted
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;

interface ListClubMembersResponse {
  items: ClubMember[];
  nextToken: string | null;
}

function useListClubMembers(clubId: string | undefined) {
  return useInfiniteQuery<ListClubMembersResponse>({
    queryKey: ['club-members', clubId],
    queryFn: async ({ pageParam }) => {
      if (!clubId) {
        throw new Error('clubId is required');
      }

      const { clubMembersByClubIdAndUserId } = await amplify.request<{
        clubMembersByClubIdAndUserId: ListClubMembersResponse;
      }>(ListClubMembers, {
        clubId,
        filter: {
          status: { eq: MemberStatus.ACTIVE },
        },
        limit: 20,
        nextToken: pageParam || null,
      });

      return clubMembersByClubIdAndUserId;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!clubId,
  });
}

export { useListClubMembers };
