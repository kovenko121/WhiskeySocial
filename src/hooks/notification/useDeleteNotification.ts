import { amplify, queryClient } from '@services';
import { DeleteNotificationInput } from '@types';
import { useMutation } from '@tanstack/react-query';
import { DeleteNotification } from './mutation/deleteNotification';

const useDeleteNotification = () =>
  useMutation<Notification, unknown, DeleteNotificationInput>({
    mutationFn: async (data) => {
      const { deleteNotification } = await amplify.request<{
        deleteNotification: Notification;
      }>(DeleteNotification, {
        ...data,
      });

      return deleteNotification;
    },
    retry: 3,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['notifications-by-user-id'] });
    },
  });

export { useDeleteNotification };
