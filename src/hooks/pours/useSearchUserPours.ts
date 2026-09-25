import { useAuth } from '@contexts';
import { createRegexpSearchString } from '@helpers';
import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchUserPours } from './query/searchUserPours';

const useSearchUserPours = (
  userId?: string,
  search?: string,
  sortDirection?: string | undefined
) => {
  const {
    user: { sub },
  } = useAuth();

  return useInfiniteQuery<{
    nextToken: string;
    items: any;
  }>({
    queryKey: ['search-user-pours', userId || sub, search || ''],
    queryFn: async ({ pageParam }) => {
      const regexpSearch = `${createRegexpSearchString(search || '')}.*`;

      const { searchUserPours } = (await amplify.request(SearchUserPours, {
        nextToken: pageParam || null,
        limit: 1000,
        filter: {
          userId: { eq: userId || sub },
          and: [
            ...regexpSearch
              .split(' ')
              .map((item) => ({ whiskeyFullName: { regexp: item } })),
          ],
        },
        sort:
          sortDirection === 'alphabetical' && sortDirection
            ? { field: 'whiskeyFullName', direction: 'asc' }
            : undefined,
      })) as {
        searchUserPours: { nextToken: string; items: any };
      };

      return searchUserPours;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
};

export { useSearchUserPours };
