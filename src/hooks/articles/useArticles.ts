import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createRegexpSearchString } from '../../helpers/search';
import { SearchArticles } from './query/searchArticles';

function useArticles(search?: string) {
  return useInfiniteQuery<{ nextToken: string; items: any[] }>({
    queryKey: ['search-guides', search],
    queryFn: async ({ pageParam }) => {
      const regexpSearch = `${createRegexpSearchString(search ?? '')}.*`;

      const { searchGuides } = (await amplify.request(SearchArticles, {
        nextToken: pageParam || null,
        limit: 10,
        filter: {
          and: [
            ...regexpSearch
              .split(' ')
              .map((item) => ({ title: { regexp: item } })),
          ],
        },
      })) as { searchGuides: { nextToken: string; items: any[] } };

      return searchGuides;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
}

export { useArticles };
