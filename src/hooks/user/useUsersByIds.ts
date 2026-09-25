import { amplify } from '@services';
import { User } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchUsers } from './query/SearchUsers';

function useUsersByIds(userIds: string[]) {
  return useInfiniteQuery<{ nextToken: string; items: User[] }>({
    queryKey: ['get-followers', userIds],
    queryFn: async ({ pageParam }) => {
      const { searchUsers } = await amplify.request<{
        searchUsers: { nextToken: string; items: User[] };
      }>(SearchUsers, {
        nextToken: pageParam || null,
        filter: {
          or: [...userIds.map((id) => ({ id: { eq: id } }))],
        },
        limit: 10,
      });

      return searchUsers;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
}

export { useUsersByIds };
