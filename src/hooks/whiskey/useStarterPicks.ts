import { useAuth } from '@contexts';
import { amplify } from '@services';
import { Whiskey } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { StarterPicks } from './query/getStarterPicks';

function useStarterPick() {
  const {
    user: { sub },
  } = useAuth();

  return useInfiniteQuery({
    queryKey: ['get-starter-pick', sub],
    queryFn: async ({ pageParam = undefined }) => {
      const { searchWhiskeys } = await amplify.request<{
        searchWhiskeys: {
          items: Whiskey[];
          nextToken?: string | null;
        };
      }>(StarterPicks, { id: sub, nextToken: pageParam });
      return searchWhiskeys;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    enabled: !!sub,
  });
}

export { useStarterPick };
