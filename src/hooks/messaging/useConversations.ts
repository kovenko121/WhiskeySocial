import { amplify } from '@services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListConversations } from './query/listConversations';

type ProfilePictureS3 = {
  bucket: string;
  key: string;
  region: string;
};

type ParticipantUser = {
  id: string;
  username: string;
  profilePicture?: ProfilePictureS3 | null;
  deleted?: boolean | null;
};

type ConversationParticipantRaw = {
  userId: string;
  user: ParticipantUser;
};

type ConversationRaw = {
  id: string;
  participantIds: string[];
  lastMessageText?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  participants: {
    items: ConversationParticipantRaw[];
  };
};

type ConversationParticipantItem = {
  id: string;
  conversationId: string;
  userId: string;
  unreadCount: number;
  lastReadAt?: string | null;
  isMuted: boolean;
  isDeleted: boolean;
  requestStatus: string;
  conversation: ConversationRaw;
  createdAt: string;
  updatedAt: string;
};

type RawResponse = {
  nextToken: string | null;
  items: ConversationParticipantItem[];
};

type ConversationListItem = {
  conversationId: string;
  participantId: string;
  otherUser: {
    id: string;
    username: string;
    profilePicture?: ProfilePictureS3 | null;
  };
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  isMuted: boolean;
};

type ConversationsResponse = {
  nextToken: string | null;
  items: ConversationListItem[];
};

function transformConversations(
  raw: RawResponse,
  currentUserId: string,
): ConversationsResponse {
  const items: ConversationListItem[] = raw.items
    .filter((participant) => {
      const { conversation } = participant;
      if (!conversation) return false;
      const otherParticipant = conversation.participants?.items?.find(
        (p) => p.userId !== currentUserId,
      );
      return otherParticipant?.user && !otherParticipant.user.deleted;
    })
    .map((participant) => {
      const { conversation } = participant;
      const otherParticipant = conversation.participants.items.find(
        (p) => p.userId !== currentUserId,
      )!;
      return {
        conversationId: participant.conversationId,
        participantId: participant.id,
        otherUser: {
          id: otherParticipant.user.id,
          username: otherParticipant.user.username,
          profilePicture: otherParticipant.user.profilePicture,
        },
        lastMessageText: conversation.lastMessageText,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: participant.unreadCount,
        isMuted: participant.isMuted,
      };
    });

  // Sort by lastMessageAt descending
  items.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return { nextToken: raw.nextToken, items };
}

function useConversations(currentUserId: string) {
  const query = useInfiniteQuery<ConversationsResponse>({
    queryKey: ['get-conversations', currentUserId],
    queryFn: async ({ pageParam }) => {
      const { conversationParticipantsByUserIdAndConversationId } = await amplify.request<{
        conversationParticipantsByUserIdAndConversationId: RawResponse;
      }>(ListConversations, {
        userId: currentUserId,
        limit: 50,
        nextToken: pageParam || null,
        filter: {
          isDeleted: { eq: false },
          requestStatus: { eq: 'ACCEPTED' },
        },
      });
      return transformConversations(
        conversationParticipantsByUserIdAndConversationId,
        currentUserId,
      );
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!currentUserId,
    staleTime: 30 * 1000,
  });

  return query;
}

export { useConversations };
export type { ConversationListItem };
