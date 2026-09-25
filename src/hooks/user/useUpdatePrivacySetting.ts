import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdatePrivacySetting } from './mutation/updatePrivacySetting';

const useUpdatePrivacySetting = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    User,
    unknown,
    {
      dmPrivacySetting: string;
    }
  >({
    mutationFn: async (data) => {
      const { updateUser } = await amplify.request<{
        updateUser: User;
      }>(UpdatePrivacySetting, {
        id: sub,
        ...data,
      });

      return updateUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUpdatePrivacySetting };
