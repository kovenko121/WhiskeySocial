import { useQuery } from '@tanstack/react-query';
import { amplify } from '@services';
import { EntitySearchResult, InlineTagType, Whiskey } from '@types';
import { SearchWhiskeys } from '../whiskey/query/SearchWhiskeys';
import { createRegexpSearchString } from '../../helpers/search';
import { createLogger } from '../../services/logger';

const logger = createLogger('useSearchWhiskeysForTag');

interface SearchWhiskeysResponse {
  searchWhiskeys: {
    items: Whiskey[];
    nextToken?: string;
  };
}

const transformWhiskeyResults = (
  data: SearchWhiskeysResponse
): EntitySearchResult[] => data.searchWhiskeys.items.map((whiskey) => ({
    id: whiskey.id,
    type: InlineTagType.WHISKEY,
    name: whiskey.name || whiskey.fullName || '',
    displayName: whiskey.fullName || whiskey.name || '',
    whiskeyFullName: whiskey.fullName ?? undefined,
    whiskeyType: whiskey.type,
    whiskeyPicture: whiskey.picture,
    whiskeyBrandUser: whiskey.brandUser,
    whiskeyCalculatedRating: whiskey.calculatedRating ?? undefined,
    profilePicture: whiskey.picture,
  }));

export const useSearchWhiskeysForTag = (query: string, enabled: boolean = true) => useQuery({
    queryKey: ['searchWhiskeysForTag', query],
    enabled: enabled && query.length > 0,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      try {
        const cleanedSearch = query?.replace('#', '');
        const regexpSearch = `${createRegexpSearchString(cleanedSearch ?? '')}.*`;

        const filter: any = {
          and: regexpSearch
            .split(' ')
            .map((item) => ({ fullName: { regexp: item } })),
        };

        const data = await amplify.request<SearchWhiskeysResponse>(
          SearchWhiskeys,
          {
            filter,
            limit: 20,
          }
        );

        const results = transformWhiskeyResults(data);
        return results;
      } catch (error) {
        logger.error('Error in searchWhiskeysForTag:', error as Error);
        throw error;
      }
    },
  });
