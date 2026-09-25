import { useAuth } from '@contexts';
import { amplify } from '@services';
import { Notification } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { NotificationsByUserId } from './query/notificationsByUserId';

type NotificationFetched = Notification & {
  pictureLoaded: {
    uri: string;
  };
};

function useNotificationByUserId() {
  const {
    user: { sub },
  } = useAuth();

  const query = useInfiniteQuery({
    queryKey: ['notifications-by-user-id'],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const { notificationsByUserIdAndCreatedAt } = await amplify.request<{
        notificationsByUserIdAndCreatedAt: {
          items: NotificationFetched[];
          nextToken: string;
        };
      }>(NotificationsByUserId, { id: sub, nextToken: pageParam });

      return notificationsByUserIdAndCreatedAt;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });

  return query;
}

export { useNotificationByUserId };
