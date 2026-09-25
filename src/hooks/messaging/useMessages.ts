import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListMessages } from './query/listMessages';

type MessageItem = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  readAt?: string | null;
  deletedBySender?: boolean | null;
  deletedForEveryone?: boolean | null;
  senderDeleted?: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type MessagesResponse = {
  nextToken: string | null;
  items: MessageItem[];
};

function useMessages(conversationId: string) {
  return useInfiniteQuery<MessagesResponse>({
    queryKey: ['get-messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const { messagesByConversationIdAndCreatedAt } = await amplify.request<{
        messagesByConversationIdAndCreatedAt: MessagesResponse;
      }>(ListMessages, {
        conversationId,
        sortDirection: 'DESC',
        limit: 50,
        nextToken: pageParam || null,
      });
      return messagesByConversationIdAndCreatedAt;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!conversationId && conversationId.trim() !== '',
    staleTime: 0,
  });
}

export { useMessages };
export type { MessageItem };
