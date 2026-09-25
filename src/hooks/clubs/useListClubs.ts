import { amplify } from '@services';
import { Club } from '@types';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListClubs = gql`
  query ListClubs($filter: ModelClubFilterInput, $limit: Int, $nextToken: String) {
    listClubs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        clubName
        searchName
        clubDetails
        coverPhoto
        profilePicture
        isPrivate
        createdBy
        createdAt
        updatedAt
        pinnedPostId
        memberCount
        whiskeyCount
        __typename
      }
      nextToken
      __typename
    }
  }
`;

interface ListClubsResponse {
  items: Club[];
  nextToken: string | null;
}

function useListClubs(limit: number = 20) {
  return useQuery({
    queryKey: ['clubs', 'list', limit],
    queryFn: async () => {
      const { listClubs } = await amplify.request<{
        listClubs: ListClubsResponse;
      }>(ListClubs, {
        limit,
      });

      return {
        clubs: listClubs.items,
        nextToken: listClubs.nextToken,
      };
    },
  });
}

export { useListClubs };
