import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text } from '@components';
import { useAuth } from '@contexts';
import { useMessageRequests } from '../../../../hooks/messaging/useMessageRequests';
import type { ConversationListItem as ConversationListItemType } from '../../../../hooks/messaging/useConversations';
import ConversationListItem from '../ConversationListItem/ConversationListItem';
import ConversationListSkeleton from '../ConversationListSkeleton/ConversationListSkeleton';
import {
  EmptyContainer,
  ErrorContainer,
  RetryButton,
} from '../ConversationList/styles';

const MessageRequestList = () => {
  const { user } = useAuth();
  const currentUserId = user?.sub;

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessageRequests(currentUserId || '');

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isUserRefreshing, setIsUserRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const requests = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const handleRefresh = useCallback(async () => {
    setIsUserRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsUserRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ConversationListItemType }) => (
      <ConversationListItem conversation={item} requestStatus="PENDING" />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: ConversationListItemType) => item.conversationId,
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator style={{ paddingVertical: 16 }} />;
  }, [isFetchingNextPage]);

  if (isPending) {
    return showSkeleton ? <ConversationListSkeleton /> : null;
  }

  if (isError) {
    return (
      <ErrorContainer>
        <Text size={14} color="grey300" align="center">
          Couldn't load message requests
        </Text>
        <RetryButton onPress={() => refetch()}>
          <Text size={14} color="white" align="center">
            Tap to retry
          </Text>
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyContainer>
        <Text size={16} color="grey300" align="center" bold>
          No message requests
        </Text>
        <View style={{ marginTop: 8 }}>
          <Text size={13} color="grey300" align="center">
            When someone new messages you, it'll appear here
          </Text>
        </View>
      </EmptyContainer>
    );
  }

  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      onRefresh={handleRefresh}
      refreshing={isUserRefreshing}
      style={{ flex: 1 }}
      keyboardDismissMode="on-drag"
    />
  );
};

export default memo(MessageRequestList);
