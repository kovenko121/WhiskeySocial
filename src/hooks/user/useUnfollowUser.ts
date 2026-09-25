import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { UnfollowUser } from './mutation/unfollowUser';

const useUnfollowUser = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    any,
    unknown,
    {
      id: string;
    }
  >({
    mutationFn: async (data) => {
      const { unfollowUser } = await amplify.request<{
        unfollowUser: any;
      }>(UnfollowUser, {
        ...data,
      });

      return unfollowUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user'] });
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUnfollowUser };
