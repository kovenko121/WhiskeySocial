import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListClubWhiskeys = gql`
  query ListClubWhiskeys(
    $clubId: ID!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    clubWhiskeysByClubIdAndAddedAt(
      clubId: $clubId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        clubId
        whiskeyId
        addedBy
        addedAt
        notes
        whiskey {
          id
          name
          picture {
            bucket
            region
            key
          }
          type
          calculatedRating
          brandUser {
            brandName
            brandLogo {
              bucket
              region
              key
            }
          }
        }
      }
      nextToken
      __typename
    }
  }
`;

interface ClubWhiskeyWithDetails {
  id: string;
  clubId: string;
  whiskeyId: string;
  addedBy: string;
  addedAt: string;
  notes?: string | null;
  whiskey: {
    id: string;
    name: string;
    picture?: {
      bucket: string;
      region: string;
      key: string;
    } | null;
    type?: string[];
    calculatedRating?: number | null;
    brandUser?: {
      brandName?: string;
      brandLogo?: {
        bucket: string;
        region: string;
        key: string;
      } | null;
    } | null;
  } | null;
}

interface ListClubWhiskeysResponse {
  items: ClubWhiskeyWithDetails[];
  nextToken: string | null;
}

function useListClubWhiskeys(clubId: string, sortDirection: 'ASC' | 'DESC' = 'DESC') {
  return useInfiniteQuery<ListClubWhiskeysResponse>({
    queryKey: ['club-whiskeys', clubId, sortDirection],
    queryFn: async ({ pageParam }) => {
      const { clubWhiskeysByClubIdAndAddedAt } = await amplify.request<{
        clubWhiskeysByClubIdAndAddedAt: ListClubWhiskeysResponse;
      }>(ListClubWhiskeys, {
        clubId,
        sortDirection,
        limit: 20,
        nextToken: pageParam || null,
      });

      return clubWhiskeysByClubIdAndAddedAt;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!clubId,
  });
}

export { useListClubWhiskeys };
export type { ClubWhiskeyWithDetails };
