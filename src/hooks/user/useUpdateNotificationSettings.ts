import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { SettingsInput, User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateNotificationSettings } from './mutation/updateNotificationSettings';

const useUpdateNotificationSettings = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    User,
    unknown,
    {
      notificationSettings: SettingsInput[];
    }
  >({
    mutationFn: async (data) => {
      const { updateNotificationSettings } = await amplify.request<{
        updateNotificationSettings: User;
      }>(UpdateNotificationSettings, {
        id: sub,
        ...data,
      });

      return updateNotificationSettings;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUpdateNotificationSettings };
