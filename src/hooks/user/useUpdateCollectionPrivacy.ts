import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateUserCollectionPrivacy } from './mutation/updateUserCollectionPrivacy';

const useUpdateCollectionPrivacy = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<User, unknown, boolean>({
    mutationFn: async (data) => {
      const { updateUser } = await amplify.request<{ updateUser: User }>(
        UpdateUserCollectionPrivacy,
        {
          id: sub,
          isMyCollectionPublic: data,
        }
      );

      return updateUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUpdateCollectionPrivacy };
