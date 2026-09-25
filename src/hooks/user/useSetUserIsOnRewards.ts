import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { SetUserIsOnRewards } from './mutation/setUserIsOnRewards';

const useSetUserIsOnRewards = (onSuccess: () => void) => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<boolean, unknown>({
    mutationFn: async () => {
      const { setUserIsOnRewards } = await amplify.request<{
        setUserIsOnRewards: boolean;
      }>(SetUserIsOnRewards);

      return setUserIsOnRewards;
    },
    async onSuccess() {
      onSuccess();
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useSetUserIsOnRewards };
