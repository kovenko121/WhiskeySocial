import { amplify } from '@services';
import { ClubMember, MemberStatus } from '@types';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListPendingMembers = gql`
  query ListPendingMembers(
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
        requestedAt
        user {
          id
          username
          personFirstName
          personLastName
          profilePicture {
            bucket
            region
            key
          }
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;

interface ListPendingMembersResponse {
  items: ClubMember[];
  nextToken: string | null;
}

/**
 * Recursively fetch all pending members (not paginated)
 * This ensures the badge count and search work across all members
 */
async function fetchAllPendingMembers(clubId: string): Promise<ClubMember[]> {
  let allMembers: ClubMember[] = [];
  let nextToken: string | null = null;

  do {
    // Cursor pagination: each page needs the previous page's nextToken.
    // eslint-disable-next-line no-await-in-loop
    const response = await amplify.request<{
      clubMembersByClubIdAndUserId: ListPendingMembersResponse;
    }>(ListPendingMembers, {
      clubId,
      filter: {
        status: { eq: MemberStatus.PENDING },
      },
      limit: 100, // Fetch in larger batches
      nextToken,
    });

    allMembers = [...allMembers, ...response.clubMembersByClubIdAndUserId.items];
    nextToken = response.clubMembersByClubIdAndUserId.nextToken;
  } while (nextToken);

  return allMembers;
}

function useListPendingMembers(clubId: string) {
  return useQuery<ClubMember[]>({
    queryKey: ['club-pending-members', clubId],
    queryFn: () => fetchAllPendingMembers(clubId),
    enabled: !!clubId,
  });
}

export { useListPendingMembers };
