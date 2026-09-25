import { amplify } from '@services';
import { useQuery } from '@tanstack/react-query';
import { ListUserRewards } from './query/listUserRewards';

function useUserRewards() {
  return useQuery({
    queryKey: ['list-user-rewards'],
    queryFn: async () => {
      const { listUserRewards } = await amplify.request<{ listUserRewards: any }>(
        ListUserRewards
      );

      return listUserRewards;
    },
  });
}

export { useUserRewards };
