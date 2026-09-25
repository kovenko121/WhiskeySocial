import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { SendMessage } from './mutation/sendMessage';
import type { MessageItem } from './useMessages';

type SendMessageInput = {
  recipientId: string;
  text: string;
};

type SendMessageOutput = {
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

type MessageStatus = 'sending' | 'sent' | 'failed';

type OptimisticMessage = MessageItem & {
  _optimistic?: boolean;
  _status?: MessageStatus;
};

function useSendMessage(conversationId: string | null) {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    SendMessageOutput,
    Error,
    SendMessageInput,
    { previousMessages?: { pages: MessagesPage[]; pageParams: unknown[] }; optimisticId?: string }
  >({
    mutationFn: async (input) => {
      const { sendMessage } = await amplify.request<{
        sendMessage: SendMessageOutput;
      }>(SendMessage, { input });
      return sendMessage;
    },

    onMutate: async (input) => {
      // New conversations: the screen renders the optimistic message
      // from mutation state (isPending + variables), so no cache write needed
      if (!conversationId) return {};

      const queryKey = ['get-messages', conversationId];

      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData<{
        pages: MessagesPage[];
        pageParams: unknown[];
      }>(queryKey);

      const optimisticMessage: OptimisticMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        senderId: sub,
        text: input.text,
        readAt: null,
        deletedBySender: false,
        deletedForEveryone: false,
        senderDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _optimistic: true,
        _status: 'sending',
      };

      queryClient.setQueryData<{
        pages: MessagesPage[];
        pageParams: unknown[];
      }>(queryKey, (old) => {
        if (!old) return old;

        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            items: [optimisticMessage, ...newPages[0].items],
          };
        }
        return { ...old, pages: newPages };
      });

      return { previousMessages, optimisticId: optimisticMessage.id };
    },

    onSuccess: (data, _input, context) => {
      const targetConversationId = data.conversationId;
      const queryKey = ['get-messages', targetConversationId];

      const serverMessage: MessageItem = {
        id: data.messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.text,
        readAt: null,
        deletedBySender: false,
        deletedForEveryone: false,
        senderDeleted: false,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      };

      queryClient.setQueryData<{
        pages: MessagesPage[];
        pageParams: unknown[];
      }>(queryKey, (old) => {
        if (!old) {
          // New conversation — seed the cache so useMessages finds data immediately
          return {
            pages: [{ items: [serverMessage], nextToken: null }],
            pageParams: [null],
          };
        }

        const newPages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((msg) => {
            if (context?.optimisticId && msg.id === context.optimisticId) {
              return serverMessage;
            }
            return msg;
          }),
        }));

        return { ...old, pages: newPages };
      });

      queryClient.refetchQueries({ queryKey: ['get-conversations'] });

      if (data.isNewConversation) {
        queryClient.refetchQueries({ queryKey: ['get-conversations', sub] });
      }
    },

    onError: (_error, _input, context) => {
      if (conversationId && context?.previousMessages) {
        queryClient.setQueryData(
          ['get-messages', conversationId],
          context.previousMessages,
        );
      }
    },
  });
}

export { useSendMessage };
export type { SendMessageOutput, MessageStatus, OptimisticMessage };
