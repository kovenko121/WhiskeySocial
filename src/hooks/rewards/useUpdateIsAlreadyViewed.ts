import { amplify } from '@services';
import { UserReward } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateIsAlreadyViewed } from './mutation/updateIsAlreadyViewed';

const useUpdateIsAlreadyViewed = () =>
  useMutation<UserReward, unknown, { rewardId: string }>({
    mutationFn: async (data) => {
      const { updateUserReward } = await amplify.request<{
        updateUserReward: UserReward;
      }>(UpdateIsAlreadyViewed, {
        id: data.rewardId,
        isAlreadyViewed: true,
      });

      return updateUserReward;
    },
  });

export { useUpdateIsAlreadyViewed };
