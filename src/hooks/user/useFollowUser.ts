import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { FollowUser } from './mutation/followUser';

const useFollowUser = () => {
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
      const { followUser } = await amplify.request<{ followUser: any }>(
        FollowUser,
        {
          ...data,
        }
      );

      return followUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user'] });
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useFollowUser };
