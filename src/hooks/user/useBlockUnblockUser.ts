import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateBlockedUsers } from './mutation/updateBlockedUsers';
import { useGetUser } from './useGetUser';
import { useUnfollowUser } from './useUnfollowUser';

const useBlockUnblockUser = () => {
  const {
    user: { sub },
  } = useAuth();

  const { data: myUser } = useGetUser();

  const { mutate: mutateUnfollowUser } = useUnfollowUser();

  return useMutation<
    User,
    unknown,
    {
      id: string;
    }
  >({
    mutationFn: async (data) => {
      let updatedBlockedUsers = myUser?.blockedUsers || [];

      if (myUser?.blockedUsers?.includes(data.id)) {
        updatedBlockedUsers = myUser?.blockedUsers.filter(
          (itemId) => itemId !== data.id
        );
      } else if (data.id) {
        updatedBlockedUsers.push(data.id);
        mutateUnfollowUser({ id: data.id });
      }

      const { updateUser } = await amplify.request<{ updateUser: User }>(
        UpdateBlockedUsers,
        {
          id: sub,
          blockedUsers: updatedBlockedUsers,
        }
      );

      return updateUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useBlockUnblockUser };
