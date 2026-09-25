import { useEffect, useRef } from 'react';
import { API } from 'aws-amplify';
import { queryClient } from '@services';
import { createLogger } from '../../services/logger';
import type { MessageItem } from './useMessages';

const log = createLogger('ReadReceiptSubscription');

// Custom subscription that listens to the markMessagesAsRead mutation
// so the sender sees "Read" appear in real-time when the recipient opens the conversation
const onMarkMessagesAsRead = /* GraphQL */ `
  subscription OnMarkMessagesAsRead($conversationId: ID!) {
    onMarkMessagesAsRead(conversationId: $conversationId) {
      success
      conversationId
      readAt
      updatedMessageCount
    }
  }
`;

type MarkMessagesAsReadEvent = {
  success: boolean;
  conversationId: string;
  readAt: string;
  updatedMessageCount: number;
};

type MessagesPage = {
  nextToken: string | null;
  items: MessageItem[];
};

function useReadReceiptSubscription(conversationId: string, currentUserId: string) {
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!conversationId || !conversationId.trim() || !currentUserId) return undefined;

    try {
      const observable = API.graphql({
        query: onMarkMessagesAsRead,
        variables: {
          conversationId,
        },
        // @ts-ignore — authMode is valid but not in the TS overload
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      });

      // @ts-ignore — Amplify v5 observable typing
      const sub = observable.subscribe({
        next: ({ value }: { value: { data: { onMarkMessagesAsRead: MarkMessagesAsReadEvent } } }) => {
          const event = value.data.onMarkMessagesAsRead;
          if (!event || !event.success) return;
          // Only show "Read" when the Lambda actually marked messages — prevents
          // false read receipts from no-op calls (e.g. backgrounded refetch)
          if (event.updatedMessageCount === 0) return;

          const queryKey = ['get-messages', conversationId];

          // Update local cache: set readAt on own messages that were unread
          queryClient.setQueryData<{
            pages: MessagesPage[];
            pageParams: unknown[];
          }>(queryKey, (old) => {
            if (!old) return old;

            const newPages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) => {
                // Only update own messages that don't have readAt yet
                if (msg.senderId === currentUserId && !msg.readAt) {
                  return { ...msg, readAt: event.readAt, updatedAt: event.readAt };
                }
                return msg;
              }),
            }));

            return { ...old, pages: newPages };
          });

          // Mark conversation list as stale — refreshes when user navigates back to list via useFocusEffect
          queryClient.invalidateQueries({ queryKey: ['get-conversations'], refetchType: 'none' });
        },
        error: (err: unknown) => {
          log.error('WebSocket error', err instanceof Error ? err : new Error(JSON.stringify(err)), {
            tags: { conversationId },
          });
        },
      });

      subscriptionRef.current = sub;
    } catch (err) {
      log.error('Setup failed', err instanceof Error ? err : new Error(String(err)), {
        tags: { conversationId },
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [conversationId, currentUserId]);
}

export { useReadReceiptSubscription };
