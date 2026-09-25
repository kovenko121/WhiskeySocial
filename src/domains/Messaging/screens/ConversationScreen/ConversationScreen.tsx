import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon, ProfilePicture, Text } from '@components';
import { useAuth } from '@contexts';
import { Routes } from '@types';
import type { NavigationProps, RootStackParams
} from '@types';
import { createLogger } from '../../../../services/logger';
import { useMessages } from '../../../../hooks/messaging/useMessages';
import { useSendMessage } from '../../../../hooks/messaging/useSendMessage';
import { useDeleteMessage } from '../../../../hooks/messaging/useDeleteMessage';
import { useUpdateMessageRequest } from '../../../../hooks/messaging/useUpdateMessageRequest';
import { useMarkMessagesAsRead } from '../../../../hooks/messaging/useMarkMessagesAsRead';
import { useMessageSubscription } from '../../../../hooks/messaging/useMessageSubscription';
import { useReadReceiptSubscription } from '../../../../hooks/messaging/useReadReceiptSubscription';
import { useDeleteMessageSubscription } from '../../../../hooks/messaging/useDeleteMessageSubscription';
import { useBlockUnblockUser } from '../../../../hooks/user/useBlockUnblockUser';
import { useUpdateConversationParticipant } from '../../../../hooks/messaging/useUpdateConversationParticipant';
import { findExistingConversation } from '../../../../hooks/messaging/useFindConversation';
import type { MessageItem } from '../../../../hooks/messaging/useMessages';
import ConversationSettingsSheet from '../../components/ConversationSettingsSheet/ConversationSettingsSheet';
import MessageActionSheet from '../../components/MessageActionSheet/MessageActionSheet';
import MessageBubble from '../../components/MessageBubble/MessageBubble';
import DateSeparator from '../../components/DateSeparator/DateSeparator';
import MessageInputBar from '../../components/MessageInputBar/MessageInputBar';
import MessageRequestBanner from '../../components/MessageRequestBanner/MessageRequestBanner';
import MessageSkeleton from '../../components/MessageSkeleton/MessageSkeleton';
import {
  ScreenContainer,
  HeaderContainer,
  BackButton,
  HeaderUserInfo,
  SettingsButton,
  EmptyStateContainer,
  ErrorContainer,
  RetryButton,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Conversation'>;

const logger = createLogger('ConversationScreen');

type ReadReceiptType = 'sent' | 'read' | undefined;

type ListItem =
  | { type: 'message'; data: MessageItem; readReceiptType?: ReadReceiptType }
  | { type: 'separator'; date: string };

const getDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const ConversationScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUserId = user?.sub;

  const {
    conversationId: initialConversationId,
    recipientId,
    recipientName,
    recipientImage,
    requestStatus: initialRequestStatus,
    participantId: initialParticipantId,
    isMuted: initialIsMuted,
  } = route.params;

  // Track active conversationId — may be empty for new conversations,
  // then gets set after the first message creates one
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [activeParticipantId, setActiveParticipantId] = useState(initialParticipantId);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [currentRequestStatus, setCurrentRequestStatus] = useState(initialRequestStatus);
  const [isMuted, setIsMuted] = useState(initialIsMuted ?? false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const isPendingRequest = currentRequestStatus === 'PENDING';

  // When navigated from profile without participant data, look it up in the background
  useEffect(() => {
    if (activeParticipantId || !currentUserId || !recipientId) return;

    findExistingConversation(currentUserId, recipientId).then((result) => {
      if (!result) return;
      if (result.conversationId && !activeConversationId) {
        setActiveConversationId(result.conversationId);
      }
      if (result.participantId) {
        setActiveParticipantId(result.participantId);
      }
      if (result.requestStatus) {
        setCurrentRequestStatus(result.requestStatus);
      }
      if (result.isMuted !== undefined) {
        setIsMuted(result.isMuted);
      }
    }).catch(() => {
      // Lookup failed — settings will be unavailable but messaging still works
    });
  }, [activeParticipantId, currentUserId, recipientId, activeConversationId]);

  // Delay skeleton by 300ms to avoid flash on fast loads
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeConversationId);

  const sendMessageMutation = useSendMessage(activeConversationId || null);
  const updateRequestMutation = useUpdateMessageRequest();
  const markAsReadMutation = useMarkMessagesAsRead();
  const markAsReadRef = useRef(markAsReadMutation.mutate);
  markAsReadRef.current = markAsReadMutation.mutate;
  const markAsReadFiredRef = useRef<string | null>(null);
  const blockMutation = useBlockUnblockUser();
  const updateParticipantMutation = useUpdateConversationParticipant();

  // Subscribe to new messages in real-time
  useMessageSubscription(activeConversationId, currentUserId || '');

  // Subscribe to read receipts so sender sees "Read" in real-time
  useReadReceiptSubscription(activeConversationId, currentUserId || '');

  // Delete message mutation and subscription
  const deleteMessageMutation = useDeleteMessage(activeConversationId);
  useDeleteMessageSubscription(activeConversationId, currentUserId || '');

  // Refetch messages when app returns to foreground (subscription may have dropped)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && activeConversationId) {
        refetch();
      }
    });
    return () => subscription.remove();
  }, [activeConversationId, refetch]);

  // Mark messages as read when conversation is opened or new messages arrive.
  // markAsReadFiredRef prevents the mutation from looping: after firing once,
  // it won't fire again until a genuinely new unread message arrives.
  useEffect(() => {
    if (!activeConversationId || isPendingRequest) return;
    if (AppState.currentState !== 'active') return;
    if (!data?.pages) return;

    const allMessages = data.pages.flatMap((page) => page.items);
    const unreadFromOthers = allMessages.filter(
      (msg) => msg.senderId !== currentUserId && !msg.readAt,
    );

    if (unreadFromOthers.length === 0) {
      // All caught up — reset so we fire again if new messages arrive
      markAsReadFiredRef.current = null;
      return;
    }

    // Build a key from the unread message ids so we only fire once per unique set
    const unreadKey = unreadFromOthers.map((m) => m.id).join(',');
    if (markAsReadFiredRef.current === unreadKey) return;

    markAsReadFiredRef.current = unreadKey;
    markAsReadRef.current({ conversationId: activeConversationId });
  }, [activeConversationId, data, currentUserId, isPendingRequest]);

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // For new conversations, show optimistic message from mutation state
  const pendingOptimistic = useMemo((): MessageItem | null => {
    if (activeConversationId || !sendMessageMutation.isPending || !sendMessageMutation.variables) {
      return null;
    }
    return {
      id: `optimistic-${Date.now()}`,
      conversationId: '',
      senderId: currentUserId || '',
      text: sendMessageMutation.variables.text,
      readAt: null,
      deletedBySender: false,
      deletedForEveryone: false,
      senderDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [activeConversationId, sendMessageMutation.isPending, sendMessageMutation.variables, currentUserId]);

  // Filter out messages deleted by sender (if current user is sender)
  const filteredMessages = useMemo(() => {
    const filtered = messages.filter((msg) => !(msg.deletedBySender && msg.senderId === currentUserId));
    if (pendingOptimistic) {
      return [pendingOptimistic, ...filtered];
    }
    return filtered;
  }, [messages, currentUserId, pendingOptimistic]);

  // Only the most recent own message gets an indicator:
  // - 'sent': not yet read by recipient
  // - 'read': recipient has read it
  // All other messages show no indicator to avoid layout shifts.
  const readReceiptMap = useMemo(() => {
    const map = new Map<string, ReadReceiptType>();

    // filteredMessages is newest-first — find the first own message
    for (let i = 0; i < filteredMessages.length; i += 1) {
      const msg = filteredMessages[i];
      if (msg.senderId === currentUserId) {
        map.set(msg.id, msg.readAt ? 'read' : 'sent');
        break;
      }
    }

    return map;
  }, [filteredMessages, currentUserId]);

  // Build list items with date separators
  // Since data is DESC (newest first) and FlatList is inverted,
  // the list renders bottom-to-top, so newest appears at bottom
  const listItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];

    // Iterate newest-first (as returned from API)
    for (let i = 0; i < filteredMessages.length; i += 1) {
      const msg = filteredMessages[i];
      const dateKey = getDateKey(msg.createdAt);

      items.push({ type: 'message', data: msg, readReceiptType: readReceiptMap.get(msg.id) });

      // Check if next message (older) is a different date
      const nextMsg = filteredMessages[i + 1];
      if (nextMsg) {
        const nextDateKey = getDateKey(nextMsg.createdAt);
        if (dateKey !== nextDateKey) {
          items.push({ type: 'separator', date: msg.createdAt });
        }
      } else {
        // Last (oldest) message — always show separator
        items.push({ type: 'separator', date: msg.createdAt });
      }
    }

    return items;
  }, [filteredMessages, readReceiptMap]);

  const handleSend = useCallback(
    (text: string) => {
      setSendError(null);
      sendMessageMutation.mutate(
        { recipientId, text },
        {
          onSuccess: (result) => {
            if (!activeConversationId) {
              setActiveConversationId(result.conversationId);
            }
          },
          onError: (error: Error) => {
            const msg = error.message || '';
            if (msg.includes('RATE_LIMIT')) {
              setSendError('Slow down — too many messages. Wait a moment.');
            } else if (msg.includes('USER_BLOCKED')) {
              setSendError('Unable to send message to this user.');
            } else if (msg.includes('PRIVACY_RESTRICTED')) {
              setSendError('This user has restricted who can message them.');
            } else {
              setSendError('Failed to send message. Please try again.');
            }
          },
        },
      );
    },
    [recipientId, sendMessageMutation, activeConversationId],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const navigateToProfile = useCallback(() => {
    if (recipientId) {
      navigation.navigate(Routes.UserProfile, { id: recipientId });
    }
  }, [recipientId, navigation]);

  const handleAcceptRequest = useCallback(() => {
    if (!activeParticipantId) {
      logger.warn('handleAcceptRequest: no participantId');
      return;
    }
    updateRequestMutation.mutate(
      { participantId: activeParticipantId, action: 'ACCEPTED' },
      {
        onSuccess: () => {
          setCurrentRequestStatus('ACCEPTED');
        },
        onError: (error) => {
          logger.error('Accept failed', error as Error);
          Alert.alert('Error', 'Failed to accept request. Please try again.');
        },
      },
    );
  }, [activeParticipantId, updateRequestMutation]);

  const handleDeclineRequest = useCallback(() => {
    if (!activeParticipantId) {
      logger.warn('handleDeclineRequest: no participantId');
      return;
    }
    updateRequestMutation.mutate(
      { participantId: activeParticipantId, action: 'DECLINED' },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (error) => {
          logger.error('Decline failed', error as Error);
          Alert.alert('Error', 'Failed to decline request. Please try again.');
        },
      },
    );
  }, [activeParticipantId, updateRequestMutation, navigation]);

  const handleBlockRequest = useCallback(() => {
    if (!recipientId || !activeParticipantId) return;
    blockMutation.mutate(
      { id: recipientId },
      {
        onSuccess: () => {
          updateRequestMutation.mutate(
            { participantId: activeParticipantId, action: 'DECLINED' },
            {
              onSuccess: () => {
                navigation.goBack();
              },
            },
          );
        },
      },
    );
  }, [recipientId, activeParticipantId, blockMutation, updateRequestMutation, navigation]);

  const handleToggleMute = useCallback(() => {
    if (!activeParticipantId) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    updateParticipantMutation.mutate(
      { id: activeParticipantId, isMuted: newMuted },
      {
        onError: () => {
          setIsMuted(!newMuted);
          Alert.alert('Error', 'Failed to update mute setting. Please try again.');
        },
      },
    );
  }, [activeParticipantId, isMuted, updateParticipantMutation]);

  const handleDeleteConversation = useCallback(() => {
    if (!activeParticipantId) return;
    updateParticipantMutation.mutate(
      { id: activeParticipantId, isDeleted: true },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to delete conversation. Please try again.');
        },
      },
    );
  }, [activeParticipantId, updateParticipantMutation, navigation]);

  const handleBlockFromSettings = useCallback(() => {
    if (!recipientId || !activeParticipantId) return;
    blockMutation.mutate(
      { id: recipientId },
      {
        onSuccess: () => {
          updateParticipantMutation.mutate(
            { id: activeParticipantId, isDeleted: true },
            {
              onSuccess: () => {
                navigation.goBack();
              },
            },
          );
        },
        onError: () => {
          Alert.alert('Error', 'Failed to block user. Please try again.');
        },
      },
    );
  }, [recipientId, activeParticipantId, blockMutation, updateParticipantMutation, navigation]);

  const handleMessageLongPress = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setShowDeleteSheet(true);
  }, []);

  const handleDeleteForMe = useCallback(() => {
    if (!selectedMessageId) return;
    deleteMessageMutation.mutate({ messageId: selectedMessageId, deleteForEveryone: false });
    setSelectedMessageId(null);
  }, [selectedMessageId, deleteMessageMutation]);

  const handleDeleteForEveryone = useCallback(() => {
    if (!selectedMessageId) return;
    deleteMessageMutation.mutate({ messageId: selectedMessageId, deleteForEveryone: true });
    setSelectedMessageId(null);
  }, [selectedMessageId, deleteMessageMutation]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'separator') {
        return <DateSeparator date={item.date} />;
      }
      const isOwn = item.data.senderId === currentUserId;
      const isDeleted = item.data.deletedForEveryone || item.data.deletedBySender;
      return (
        <MessageBubble
          message={item.data}
          isOwnMessage={isOwn}
          readReceiptType={item.readReceiptType}
          onLongPress={isOwn && !isDeleted ? () => handleMessageLongPress(item.data.id) : undefined}
        />
      );
    },
    [currentUserId, handleMessageLongPress],
  );

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === 'separator') return `sep-${item.date}-${index}`;
    return item.data.id;
  }, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator style={{ paddingVertical: 16 }} />;
  }, [isFetchingNextPage]);

  const renderContent = () => {
    // Only show skeleton after 300ms delay to avoid flash on fast loads
    if (isPending && activeConversationId) {
      return showSkeleton ? <MessageSkeleton /> : null;
    }

    if (isError) {
      return (
        <ErrorContainer>
          <Text size={14} color="grey300" align="center">
            Failed to load messages
          </Text>
          <RetryButton onPress={() => refetch()}>
            <Text size={14} color="white" align="center">
              Tap to retry
            </Text>
          </RetryButton>
        </ErrorContainer>
      );
    }

    if (filteredMessages.length === 0) {
      return (
        <EmptyStateContainer>
          <Text size={14} color="grey300" align="center">
            Say hello to start the conversation!
          </Text>
        </EmptyStateContainer>
      );
    }

    return (
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
        keyboardDismissMode="on-drag"
      />
    );
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top }}>
      <HeaderContainer>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="left" size={16} color="primary600" />
        </BackButton>
        <HeaderUserInfo onPress={navigateToProfile}>
          <ProfilePicture
            size="xx-small"
            image={recipientImage || null}
            border={false}
            disabled
          />
          <Text size={16} color="white" bold>
            {recipientName || 'User'}
          </Text>
        </HeaderUserInfo>
        <SettingsButton onPress={() => setShowSettingsSheet(true)}>
          <Icon name="dot-menu-vertical" size={16} color="primary600" />
        </SettingsButton>
      </HeaderContainer>

      {isPendingRequest && (
        <MessageRequestBanner
          recipientName={recipientName || 'User'}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onBlock={handleBlockRequest}
          isUpdating={updateRequestMutation.isPending || blockMutation.isPending}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderContent()}
        {!isPendingRequest && (
          <MessageInputBar
            onSend={handleSend}
            errorMessage={sendError}
            isSending={sendMessageMutation.isPending}
          />
        )}
      </KeyboardAvoidingView>

      <ConversationSettingsSheet
        visible={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
        recipientName={recipientName || 'User'}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onDeleteConversation={handleDeleteConversation}
        onBlockUser={handleBlockFromSettings}
        isUpdating={updateParticipantMutation.isPending || blockMutation.isPending}
      />

      <MessageActionSheet
        visible={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
      />
    </ScreenContainer>
  );
};
