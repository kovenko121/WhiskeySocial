import { useInfiniteQuery } from '@tanstack/react-query';
import { amplify } from '@services';
import { EntitySearchResult, InlineTagType, MemberStatus, S3Object , UserType } from '@types';
import { gql } from 'graphql-request';
import { createRegexpSearchString } from '../../helpers/search';
import { SearchEntitiesForTag } from '../../graphql/custom/searchEntitiesForTag';
import { createLogger } from '../../services/logger';

const logger = createLogger('useSearchClubMembersForTag');

const SearchClubMembersForTag = gql`
  query SearchClubMembersForTag(
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
        userId
        status
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
            key
            region
          }
          brandLogo {
            bucket
            key
            region
          }
          venueAddressStreet
          venueAddressNumber
          venueAddressCity
          venueAddressState
          followers
          following
          deleted
        }
      }
      nextToken
    }
  }
`;

interface ClubMemberSearchResponse {
  clubMembersByClubIdAndUserId: {
    items: Array<{
      userId: string;
      status: string;
      user: {
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
      };
    }>;
    nextToken: string | null;
  };
}

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
    }>;
  };
}

const transformClubMemberResults = (
  items: ClubMemberSearchResponse['clubMembersByClubIdAndUserId']['items'],
  searchQuery: string
): EntitySearchResult[] => {
  const results: EntitySearchResult[] = [];
  const cleanedSearch = searchQuery.toLowerCase().trim();

  items.forEach((member) => {
    const {user} = member;
    if (!user || user.deleted || member.status !== MemberStatus.ACTIVE) return;

    // Filter by search query
    const matchesSearch =
      !cleanedSearch ||
      user.username?.toLowerCase().includes(cleanedSearch) ||
      user.personFirstName?.toLowerCase().includes(cleanedSearch) ||
      user.personLastName?.toLowerCase().includes(cleanedSearch) ||
      user.venueName?.toLowerCase().includes(cleanedSearch) ||
      user.brandName?.toLowerCase().includes(cleanedSearch);

    if (!matchesSearch) return;

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

const transformVenuesAndBrands = (
  items: SearchEntitiesResponse['users']['items'],
  searchQuery: string
): EntitySearchResult[] => {
  const results: EntitySearchResult[] = [];
  const cleanedSearch = searchQuery.toLowerCase().trim();

  items.forEach((user) => {
    if (user.deleted) return;

    // Only process VENUE and BRAND users
    if (user.userType !== UserType.VENUE && user.userType !== UserType.BRAND) return;

    // Filter by search query
    const matchesSearch =
      !cleanedSearch ||
      user.username?.toLowerCase().includes(cleanedSearch) ||
      user.venueName?.toLowerCase().includes(cleanedSearch) ||
      user.brandName?.toLowerCase().includes(cleanedSearch);

    if (!matchesSearch) return;

    if (user.userType === UserType.VENUE) {
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

export const useSearchClubMembersForTag = (
  clubId: string | null,
  query: string,
  enabled: boolean = true
) => useInfiniteQuery({
    queryKey: ['searchClubMembersForTag', clubId, query],
    enabled: enabled && !!clubId && query.length > 0,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: { results: EntitySearchResult[]; nextToken?: string | null }) => lastPage.nextToken,
    queryFn: async ({ pageParam }) => {
      try {
        // On first page, fetch club members and venues/brands in parallel
        // On subsequent pages, only fetch club members
        if (!pageParam) {
          // Prepare filter for venues and brands
          const cleanedSearch = query?.replace('@', '');
          const regexpSearch = `${createRegexpSearchString(cleanedSearch ?? '')}.*`;

          const venuesBrandsFilter = {
            and: [
              {
                or: [
                  // Search by username
                  {
                    and: regexpSearch
                      .split(' ')
                      .map((item) => ({ username: { regexp: item } })),
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
              // Only get VENUE and BRAND users
              {
                or: [
                  { userType: { eq: UserType.VENUE } },
                  { userType: { eq: UserType.BRAND } },
                ],
              },
            ],
          };

          // Fetch club members and venues/brands in parallel
          // Note: Club members cannot be filtered by username/name at the GraphQL level
          // because ModelClubMemberFilterInput doesn't support filtering on nested user fields.
          // Client-side filtering is applied in transformClubMemberResults.
          const [clubMemberData, venuesAndBrandsData] = await Promise.all([
            amplify.request<ClubMemberSearchResponse>(
              SearchClubMembersForTag,
              {
                clubId,
                filter: {
                  status: { eq: MemberStatus.ACTIVE },
                },
                limit: 20,
                nextToken: null,
              }
            ),
            amplify.request<SearchEntitiesResponse>(
              SearchEntitiesForTag,
              {
                filter: venuesBrandsFilter,
                limit: 20,
                sort: [
                  {
                    field: 'username',
                    direction: 'asc',
                  },
                ],
              }
            ),
          ]);

          const clubMemberResults = transformClubMemberResults(
            clubMemberData.clubMembersByClubIdAndUserId.items,
            query
          );

          const venuesAndBrandsResults = transformVenuesAndBrands(
            venuesAndBrandsData.users.items,
            query
          );

          // Deduplicate: Remove venues/brands from global search if they're already in club members
          const clubMemberIds = new Set(clubMemberResults.map(r => r.id));
          const uniqueVenuesAndBrands = venuesAndBrandsResults.filter(
            result => !clubMemberIds.has(result.id)
          );

          return {
            results: [...clubMemberResults, ...uniqueVenuesAndBrands],
            nextToken: clubMemberData.clubMembersByClubIdAndUserId.nextToken,
          };
        } 
          // Subsequent pages: only fetch club members
          // Note: Venues and brands are only fetched on the first page because:
          // 1. They're filtered by search query, so results are typically small (<20)
          // 2. Club members are the primary browseable content when scrolling
          // 3. Venues/brands serve as secondary suggestions, not paginated browse content
          const clubMemberData = await amplify.request<ClubMemberSearchResponse>(
            SearchClubMembersForTag,
            {
              clubId,
              filter: {
                status: { eq: MemberStatus.ACTIVE },
              },
              limit: 20,
              nextToken: pageParam,
            }
          );

          const clubMemberResults = transformClubMemberResults(
            clubMemberData.clubMembersByClubIdAndUserId.items,
            query
          );

          return {
            results: clubMemberResults,
            nextToken: clubMemberData.clubMembersByClubIdAndUserId.nextToken,
          };
        
      } catch (error) {
        logger.error('Error in searchClubMembersForTag:', error as Error);
        throw error;
      }
    },
  });
