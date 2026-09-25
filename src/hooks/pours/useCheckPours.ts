import { useAuth } from '@contexts';
import { amplify } from '@services';
import {
  SearchableAggregateBucketResultItem,
  SearchUserPoursQuery,
} from '@types';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { GetAggregateItems } from './query/getAggegateItems';

const useCheckPours = () => {
  const {
    user: { sub },
  } = useAuth();

  return useQuery<SearchableAggregateBucketResultItem[]>({
    queryKey: ['check-user-pours', sub],
    queryFn: async () => {
      const { searchUserPours } = await amplify.request<SearchUserPoursQuery>(
        GetAggregateItems,
        {
          filter: {
            userId: { eq: sub },
          },
        }
      );

      const aggregateItem = searchUserPours!.aggregateItems[0]?.result;

      if (aggregateItem && 'buckets' in aggregateItem) {
        return aggregateItem.buckets as SearchableAggregateBucketResultItem[];
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
    notifyOnChangeProps: ['data'],
    enabled: Boolean(sub),
  });
};

const useHadPouredThisWhiskey = () => {
  const { data } = useCheckPours();

  const pouredSet = useMemo(
    () => new Set<string>((data ?? []).map((item) => item.key)),
    [data]
  );

  const checkIfUserPoured = useCallback(
    (whiskeyId?: string) => !!whiskeyId && pouredSet.has(whiskeyId),
    [pouredSet]
  );

  return { checkIfUserPoured };
};

export { useCheckPours, useHadPouredThisWhiskey };
