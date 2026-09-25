import { useEffect, useRef } from 'react';
import { API } from 'aws-amplify';
import { queryClient } from '@services';
import { createLogger } from '../../services/logger';
import type { MessageItem } from './useMessages';

const log = createLogger('Subscription');

// Custom subscription that listens to the sendMessage mutation
// (auto-generated onCreateMessage won't fire because the Lambda writes directly to DynamoDB)
const onSendMessage = /* GraphQL */ `
  subscription OnSendMessage($conversationId: ID!) {
    onSendMessage(conversationId: $conversationId) {
      messageId
      conversationId
      text
      senderId
      createdAt
      isNewConversation
    }
  }
`;

type SendMessageEvent = {
  messageId: string;
  conversationId: string;
  text: string;
  senderId: string;
  createdAt: string;
  isNewConversation: boolean;
};

type MessagesPage = {
  nextToken: string | null;
  items: MessageItem[];
};

function useMessageSubscription(conversationId: string, currentUserId: string) {
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!conversationId || !conversationId.trim() || !currentUserId) return undefined;

    try {
      const observable = API.graphql({
        query: onSendMessage,
        variables: {
          conversationId,
        },
        // @ts-ignore — authMode is valid but not in the TS overload
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      });

      // @ts-ignore — Amplify v5 observable typing
      const sub = observable.subscribe({
        next: ({ value }: { value: { data: { onSendMessage: SendMessageEvent } } }) => {
          const event = value.data.onSendMessage;
          if (!event) return;

          // Skip our own messages — already handled by optimistic update
          if (event.senderId === currentUserId) return;

          const queryKey = ['get-messages', conversationId];

          // Convert SendMessageOutput to MessageItem shape
          const newMessage: MessageItem = {
            id: event.messageId,
            conversationId: event.conversationId,
            senderId: event.senderId,
            text: event.text,
            readAt: null,
            deletedBySender: false,
            deletedForEveryone: false,
            senderDeleted: false,
            createdAt: event.createdAt,
            updatedAt: event.createdAt,
          };

          queryClient.setQueryData<{
            pages: MessagesPage[];
            pageParams: unknown[];
          }>(queryKey, (old) => {
            if (!old) return old;

            // Check for duplicates
            const exists = old.pages.some((page) =>
              page.items.some((msg) => msg.id === newMessage.id),
            );
            if (exists) return old;

            // Insert at beginning of first page (newest first)
            const newPages = [...old.pages];
            if (newPages.length > 0) {
              newPages[0] = {
                ...newPages[0],
                items: [newMessage, ...newPages[0].items],
              };
            }
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

export { useMessageSubscription };
