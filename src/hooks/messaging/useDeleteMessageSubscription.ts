import { useEffect, useRef } from 'react';
import { API } from 'aws-amplify';
import { queryClient } from '@services';
import { createLogger } from '../../services/logger';
import type { MessageItem } from './useMessages';

const log = createLogger('DeleteMessageSubscription');

const onSoftDeleteMessage = /* GraphQL */ `
  subscription OnSoftDeleteMessage($conversationId: ID!) {
    onSoftDeleteMessage(conversationId: $conversationId) {
      success
      messageId
      conversationId
      deleteForEveryone
    }
  }
`;

type DeleteMessageEvent = {
  success: boolean;
  messageId: string;
  conversationId: string;
  deleteForEveryone: boolean;
};

type MessagesPage = {
  nextToken: string | null;
  items: MessageItem[];
};

function useDeleteMessageSubscription(conversationId: string, currentUserId: string) {
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!conversationId || !conversationId.trim() || !currentUserId) return undefined;

    try {
      const observable = API.graphql({
        query: onSoftDeleteMessage,
        variables: {
          conversationId,
        },
        // @ts-ignore — authMode is valid but not in the TS overload
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      });

      // @ts-ignore — Amplify v5 observable typing
      const sub = observable.subscribe({
        next: ({ value }: { value: { data: { onSoftDeleteMessage: DeleteMessageEvent } } }) => {
          const event = value.data.onSoftDeleteMessage;
          if (!event || !event.success) return;

          // Only process deleteForEveryone events from the other user.
          // The sender's own "delete for me" is invisible to the recipient,
          // and the sender already has the optimistic update applied.
          if (!event.deleteForEveryone) return;

          const queryKey = ['get-messages', conversationId];

          queryClient.setQueryData<{
            pages: MessagesPage[];
            pageParams: unknown[];
          }>(queryKey, (old) => {
            if (!old) return old;

            const newPages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) => {
                if (msg.id === event.messageId) {
                  return { ...msg, deletedForEveryone: true };
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

export { useDeleteMessageSubscription };
