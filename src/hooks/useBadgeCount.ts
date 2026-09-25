import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@contexts';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { NotificationTypes } from '@types';
import { useNotificationByUserId } from './notification/useNotificationByUserId';
import { useConversations } from './messaging/useConversations';

const NOTIFICATIONS_VIEWED_KEY = '@whiskeysocial/notifications_viewed_at';

// DM-type notifications are tracked separately via conversation.unreadCount
// to avoid double-counting — exclude them from the activity badge.
const DM_NOTIFICATION_TYPES: readonly string[] = [
  NotificationTypes.DIRECT_MESSAGE,
  NotificationTypes.MESSAGE_REQUEST,
];

export async function markNotificationsAsViewed(queryClient: QueryClient): Promise<void> {
  const now = new Date().toISOString();
  await AsyncStorage.setItem(NOTIFICATIONS_VIEWED_KEY, now);
  queryClient.setQueryData(['notifications-viewed-at'], now);
}

function useBadgeCount() {
  const {
    user: { sub },
  } = useAuth();

  const { data: notificationsViewedAt = null } = useQuery<string | null>({
    queryKey: ['notifications-viewed-at'],
    queryFn: () => AsyncStorage.getItem(NOTIFICATIONS_VIEWED_KEY),
    staleTime: Infinity,
  });

  const { data: notificationsData } = useNotificationByUserId();
  const { data: conversationsData } = useConversations(sub);

  useEffect(() => {
    const allNotifications = notificationsData?.pages.flatMap((page) => page?.items ?? []) ?? [];
    const activityNotificationCount = allNotifications.filter((n) => {
      const item = n as { type: string; createdAt: string };
      if (DM_NOTIFICATION_TYPES.includes(item.type)) return false;
      if (notificationsViewedAt && item.createdAt <= notificationsViewedAt) return false;
      return true;
    }).length;

    const dmUnreadCount =
      conversationsData?.pages
        .flatMap((page) => page?.items ?? [])
        .reduce((sum, item) => sum + (item?.unreadCount ?? 0), 0) ?? 0;

    Notifications.setBadgeCountAsync(activityNotificationCount + dmUnreadCount);
  }, [notificationsData, conversationsData, notificationsViewedAt]);
}

export { useBadgeCount };
