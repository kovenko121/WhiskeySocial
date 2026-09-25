import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from '@components';
import { useAuth } from '@contexts';
import { useConversations } from '../../../../hooks/messaging/useConversations';
import type { ConversationListItem as ConversationListItemType } from '../../../../hooks/messaging/useConversations';
import ConversationListItem from '../ConversationListItem/ConversationListItem';
import ConversationListSkeleton from '../ConversationListSkeleton/ConversationListSkeleton';
import {
  EmptyContainer,
  ErrorContainer,
  RetryButton,
} from './styles';

const ConversationList = () => {
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
  } = useConversations(currentUserId || '');

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isUserRefreshing, setIsUserRefreshing] = useState(false);

  // Delay skeleton by 300ms to avoid flash on fast loads
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Refetch conversations when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        refetch();
      }
    }, [currentUserId, refetch]),
  );

  const conversations = useMemo(() => {
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
      <ConversationListItem conversation={item} />
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
          Couldn't load messages
        </Text>
        <RetryButton onPress={() => refetch()}>
          <Text size={14} color="white" align="center">
            Tap to retry
          </Text>
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyContainer>
        <Text size={16} color="grey300" align="center" bold>
          No chats yet
        </Text>
        <View style={{ marginTop: 8 }}>
          <Text size={13} color="grey300" align="center">
            Start a conversation from someone's profile!
          </Text>
        </View>
      </EmptyContainer>
    );
  }

  return (
    <FlatList
      data={conversations}
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

export default memo(ConversationList);
