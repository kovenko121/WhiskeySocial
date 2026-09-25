import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { SoftDeleteMessage } from './mutation/deleteMessage';
import type { MessageItem } from './useMessages';

type DeleteMessageInput = {
  messageId: string;
  deleteForEveryone: boolean;
};

type DeleteMessageOutput = {
  success: boolean;
  messageId: string;
  conversationId: string;
  deleteForEveryone: boolean;
};

type MessagesPage = {
  nextToken: string | null;
  items: MessageItem[];
};

function useDeleteMessage(conversationId: string) {
  return useMutation<
    DeleteMessageOutput,
    Error,
    DeleteMessageInput,
    { previousMessages?: { pages: MessagesPage[]; pageParams: unknown[] } }
  >({
    mutationFn: async (input) => {
      const { softDeleteMessage } = await amplify.request<{
        softDeleteMessage: DeleteMessageOutput;
      }>(SoftDeleteMessage, { input });
      return softDeleteMessage;
    },

    onMutate: async (input) => {
      if (!conversationId) return {};

      const queryKey = ['get-messages', conversationId];

      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData<{
        pages: MessagesPage[];
        pageParams: unknown[];
      }>(queryKey);

      queryClient.setQueryData<{
        pages: MessagesPage[];
        pageParams: unknown[];
      }>(queryKey, (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((msg) => {
            if (msg.id !== input.messageId) return msg;

            if (!input.deleteForEveryone) {
              return { ...msg, deletedBySender: true };
            }
            return { ...msg, deletedForEveryone: true };
          }),
        }));

        return { ...old, pages: newPages };
      });

      return { previousMessages };
    },

    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['get-conversations'] });
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

export { useDeleteMessage };
