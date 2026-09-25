import { amplify } from '@services';
import { ClubMember, MemberStatus } from '@types';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListBlockedMembers = gql`
  query ListBlockedMembers(
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
        updatedAt
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

interface ListBlockedMembersResponse {
  items: ClubMember[];
  nextToken: string | null;
}

/**
 * Recursively fetch all blocked members (not paginated)
 * This ensures the search works across all members
 */
async function fetchAllBlockedMembers(clubId: string): Promise<ClubMember[]> {
  let allMembers: ClubMember[] = [];
  let nextToken: string | null = null;

  do {
    // Cursor pagination: each page needs the previous page's nextToken.
    // eslint-disable-next-line no-await-in-loop
    const response = await amplify.request<{
      clubMembersByClubIdAndUserId: ListBlockedMembersResponse;
    }>(ListBlockedMembers, {
      clubId,
      filter: {
        status: { eq: MemberStatus.BLOCKED },
      },
      limit: 100, // Fetch in larger batches
      nextToken,
    });

    allMembers = [...allMembers, ...response.clubMembersByClubIdAndUserId.items];
    nextToken = response.clubMembersByClubIdAndUserId.nextToken;
  } while (nextToken);

  return allMembers;
}

function useListBlockedMembers(clubId: string) {
  return useQuery<ClubMember[]>({
    queryKey: ['club-blocked-members', clubId],
    queryFn: () => fetchAllBlockedMembers(clubId),
    enabled: !!clubId,
  });
}

export { useListBlockedMembers };
