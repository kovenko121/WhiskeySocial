import { Header, TagFilter, Text, Title } from '@components';
import { getTimeAgo } from '@helpers';
import {
  useDeleteNotification,
  useDeleteUserNotifications,
  useNotificationByUserId,
  markNotificationsAsViewed,
} from '@hooks';
import type { Notification } from '@types';
import { useEffect, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, LayoutAnimation } from 'react-native';
import { NotificationCard } from './components/NotificationCard';
import {
  ContentContainer,
  Empty,
  ListContainer,
  ScreenContainer,
  ScreenPadding,
} from './styles';

export const NotificationsScreen = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const queryClient = useQueryClient();
  const [notificationsTag, setNotificationsTag] = useState([]);
  const {
    mutate: deleteUserNotifications,
    isPending: deleteUserNotificationsIsLoading,
  } = useDeleteUserNotifications();
  const { mutate: deleteNotificationMutate } = useDeleteNotification();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotificationByUserId();
  const [flattedData, setFlattedData] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      markNotificationsAsViewed(queryClient);
    }, [queryClient])
  );

  useEffect(() => {
    if (data && data.pages) {
      setFlattedData(data?.pages.flatMap((page) => page.items));
    }
  }, [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    setFlattedData(
      flattedData.filter((item: Notification) => item.id !== notification.id)
    );
    deleteNotificationMutate({ id: notification.id });
  };
  return (
    <ScreenContainer>
      <ScreenPadding>
        <Header
          title="Notifications"
          action={deleteUserNotifications}
          actionText={flattedData.length > 0 ? 'Clear all' : ''}
          loading={deleteUserNotificationsIsLoading || isLoading}
        />
        <ContentContainer>
          {flattedData.length > 0 && (
            <TagFilter
              tags={['ACTIVITY', 'DISCOVERY', 'CLUBS']}
              selectedTags={notificationsTag}
              setSelectedTags={setNotificationsTag}
              ml={0}
            />
          )}
          <ListContainer>
            {!isLoading && data ? (
              <FlatList
                data={
                  flattedData.filter((notification: Notification) => {
                    if (!notificationsTag.length) return true;
                    if (
                      notificationsTag.includes('CLUBS') &&
                      notification.type?.startsWith('CLUB_')
                    ) {
                      return true;
                    }
                    return notificationsTag.includes(notification.type);
                  }) as Notification[]
                }
                renderItem={({ item, index }) => (
                  <>
                    {index === 0 &&
                      !getTimeAgo(item.createdAt).includes('days') && (
                        <Title size={18} align="left" mb={6}>
                          Today
                        </Title>
                      )}
                    {getTimeAgo(item.createdAt).includes('days') &&
                      !getTimeAgo(flattedData[index - 1]?.createdAt).includes(
                        'days'
                      ) && (
                        <Title size={18} align="left" mb={6}>
                          Old
                        </Title>
                      )}
                    <NotificationCard
                      divider={
                        !(
                          (index === 0 &&
                            !getTimeAgo(item.createdAt).includes('days')) ||
                          (getTimeAgo(item.createdAt).includes('days') &&
                            !getTimeAgo(
                              flattedData[index - 1]?.createdAt
                            ).includes('days'))
                        )
                      }
                      notification={item}
                      handleDelete={handleDeleteNotification}
                    />
                  </>
                )}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                ListEmptyComponent={
                  <Text size={14} mv={20} color="grey300" align="center">
                    No notifications found
                  </Text>
                }
                ListFooterComponent={
                  <>
                    {isFetchingNextPage && <ActivityIndicator />}
                    <Empty />
                  </>
                }
              />
            ) : (
              <FlatList
                data={[{}, {}]}
                renderItem={() => <NotificationCard />}
              />
            )}
          </ListContainer>
        </ContentContainer>
      </ScreenPadding>
    </ScreenContainer>
  );
};
