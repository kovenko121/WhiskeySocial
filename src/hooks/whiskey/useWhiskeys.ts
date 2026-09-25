import { amplify } from '@services';
import { Whiskey } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createRegexpSearchString } from '../../helpers/search';
import { SearchWhiskeys } from './query/SearchWhiskeys';

function useWhiskeys(search?: string, ids: string[] = [], type?: string) {
  return useInfiniteQuery<{ nextToken: string; items: Whiskey[] }>({
    queryKey: ['get-whiskeys', search, type],
    queryFn: async ({ pageParam }) => {
      const regexpSearch = `${createRegexpSearchString(search ?? '')}.*`;

      const { searchWhiskeys } = (await amplify.request(SearchWhiskeys, {
        nextToken: pageParam || null,
        limit: 10,
        filter: {
          and: [
            ...regexpSearch
              .split(' ')
              .map((item) => ({ fullName: { regexp: item } })),

            ...ids.map((id) => ({ id: { ne: id } })),

            { type: { wildcard: type || '*' } },
          ],
        },
      })) as { searchWhiskeys: { nextToken: string; items: Whiskey[] } };

      return searchWhiskeys;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
}

export { useWhiskeys };
