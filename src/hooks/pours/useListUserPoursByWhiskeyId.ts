import { useAuth } from '@contexts';
import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListUserPours } from './query/listUserPours';

const useListUserPoursByWhiskeyId = (whiskeyId: string, userId?: string) => {
  const {
    user: { sub },
  } = useAuth();

  return useInfiniteQuery<{
    nextToken: string;
    items: any;
  }>({
    queryKey: ['list-user-pours-by-whiskey-id', whiskeyId || ''],
    queryFn: async ({ pageParam }) => {
      const { searchUserPours } = (await amplify.request(ListUserPours, {
        nextToken: pageParam,
        limit: 150,
        filter: {
          userId: { eq: userId ?? sub },
          whiskeyId: { eq: whiskeyId },
        },
      })) as {
        searchUserPours: { nextToken: string; items: any };
      };

      return searchUserPours;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
};

export { useListUserPoursByWhiskeyId };
