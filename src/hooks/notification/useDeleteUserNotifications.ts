import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { DeleteUserNotifications } from './mutation/deleteUserNotifications';

const useDeleteUserNotifications = () =>
  useMutation<Boolean, unknown, null>({
    mutationFn: async () => {
      const { deleteUserNotifications } = await amplify.request<{
        deleteUserNotifications: Boolean;
      }>(DeleteUserNotifications);
      return deleteUserNotifications;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['notifications-by-user-id'] });
    },
  });

export { useDeleteUserNotifications };
