import { amplify } from '@services';
import { Club } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { createRegexpSearchString } from '../../helpers/search';

const SearchClubs = gql`
  query SearchClubs(
    $filter: SearchableClubFilterInput
    $sort: [SearchableClubSortInput]
    $limit: Int
    $nextToken: String
  ) {
    searchClubs(filter: $filter, sort: $sort, limit: $limit, nextToken: $nextToken) {
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

function useSearchClubs(search?: string) {
  return useInfiniteQuery<{ nextToken: string | null; items: Club[] }>({
    queryKey: ['search-clubs', search],
    queryFn: async ({ pageParam }) => {
      const regexpSearch = `${createRegexpSearchString(search ?? '')}.*`;

      const { searchClubs } = await amplify.request<{
        searchClubs: { nextToken: string | null; items: Club[] };
      }>(SearchClubs, {
        nextToken: pageParam || null,
        filter: {
          and: regexpSearch
            .split(' ')
            .map((item) => ({ searchName: { regexp: item } })),
        },
        sort: [
          {
            field: 'memberCount',
            direction: 'desc',
          },
        ],
        limit: 10,
      });

      return searchClubs;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
}

export { useSearchClubs };
