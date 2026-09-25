import { useInfiniteQuery } from '@tanstack/react-query';
import { amplify } from '@services';
import { EntitySearchResult, InlineTagType, S3Object , UserType } from '@types';
import { SearchEntitiesForTag } from '../../graphql/custom/searchEntitiesForTag';
import { createRegexpSearchString } from '../../helpers/search';
import { createLogger } from '../../services/logger';

const logger = createLogger('useSearchEntitiesForTag');

interface SearchEntitiesResponse {
  users: {
    items: Array<{
      id: string;
      username: string;
      userType: UserType;
      personFirstName?: string;
      personLastName?: string;
      venueName?: string;
      brandName?: string;
      profilePicture?: S3Object | null;
      brandLogo?: S3Object | null;
      venueAddressStreet?: string;
      venueAddressNumber?: string;
      venueAddressCity?: string;
      venueAddressState?: string;
      followers?: string[];
      following?: string[];
      deleted?: boolean | null;
      archived?: boolean | null;
    }>;
    nextToken?: string | null;
  };
}

const transformSearchResults = (
  data: SearchEntitiesResponse
): EntitySearchResult[] => {
  const results: EntitySearchResult[] = [];

  data.users.items.forEach((user) => {
    if (user.deleted || user.archived) return;

    if (user.userType === UserType.PERSON) {
      results.push({
        id: user.id,
        type: InlineTagType.USER,
        name: `${user.personFirstName} ${user.personLastName}`,
        username: user.username,
        displayName: `${user.personFirstName} ${user.personLastName}`,
        profilePicture: user.profilePicture,
        personFirstName: user.personFirstName,
        personLastName: user.personLastName,
        followers: user.followers,
        following: user.following,
      });
    } else if (user.userType === UserType.VENUE) {
      results.push({
        id: user.id,
        type: InlineTagType.VENUE,
        name: user.venueName || '',
        username: user.username,
        displayName: user.venueName,
        profilePicture: user.profilePicture,
        venueName: user.venueName,
        location: [
          user.venueAddressStreet,
          user.venueAddressCity,
          user.venueAddressState,
        ]
          .filter(Boolean)
          .join(', '),
        followers: user.followers,
        following: user.following,
      });
    } else if (user.userType === UserType.BRAND) {
      results.push({
        id: user.id,
        type: InlineTagType.BRAND,
        name: user.brandName || '',
        username: user.username,
        displayName: user.brandName,
        logo: user.brandLogo,
        brandName: user.brandName,
        followers: user.followers,
        following: user.following,
      });
    }
  });

  return results;
};

export const useSearchEntitiesForTag = (query: string, enabled: boolean = true) => useInfiniteQuery({
    queryKey: ['searchEntitiesForTag', query],
    enabled: enabled && query.length > 0,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: { results: EntitySearchResult[]; nextToken?: string | null }) => lastPage.nextToken,
    queryFn: async ({ pageParam }) => {
      try {
        const cleanedSearch = query?.replace('@', '');
        const regexpSearch = `${createRegexpSearchString(cleanedSearch ?? '')}.*`;

        const filter = {
          and: [
            {
              or: [
                // Search by username
                {
                  and: regexpSearch
                    .split(' ')
                    .map((item) => ({ username: { regexp: item } })),
                },
                // Search by person full name
                {
                  and: regexpSearch
                    .split(' ')
                    .map((item) => ({ personFullName: { regexp: item } })),
                },
                // Search by venue search name
                {
                  and: regexpSearch
                    .split(' ')
                    .map((item) => ({ venueSearchName: { regexp: item } })),
                },
                // Search by brand search name
                {
                  and: regexpSearch
                    .split(' ')
                    .map((item) => ({ brandSearchName: { regexp: item } })),
                },
              ],
            },
            { deleted: { eq: false } },
            { archived: { ne: true } },
          ],
        };

        const data = await amplify.request<SearchEntitiesResponse>(
          SearchEntitiesForTag,
          {
            filter,
            limit: 20,
            sort: [
              {
                field: 'username',
                direction: 'asc',
              },
            ],
            nextToken: pageParam,
          }
        );

        const results = transformSearchResults(data);
        return {
          results,
          nextToken: data.users.nextToken,
        };
      } catch (error) {
        logger.error('Error in searchEntitiesForTag:', error as Error);
        throw error;
      }
    },
  });
