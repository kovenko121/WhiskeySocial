import { amplify } from '@services';
import { FindConversation } from './query/findConversation';

type ParticipantResult = {
  id: string;
  userId: string;
  requestStatus: string;
  isMuted: boolean;
  isDeleted: boolean;
};

type ConversationResult = {
  id: string;
  participantIds: string[];
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  participants?: {
    items: ParticipantResult[];
  };
};

type FindConversationResponse = {
  items: ConversationResult[];
};

type FindConversationResult = {
  conversationId: string;
  participantId?: string;
  requestStatus?: string;
  isMuted?: boolean;
} | null;

const buildParticipantKey = (id1: string, id2: string): string =>
  [id1, id2].sort().join('#');

async function findExistingConversation(
  currentUserId: string,
  otherUserId: string,
): Promise<FindConversationResult> {
  const participantKey = buildParticipantKey(currentUserId, otherUserId);

  const { conversationByParticipants } = await amplify.request<{
    conversationByParticipants: FindConversationResponse;
  }>(FindConversation, {
    participantKey,
    limit: 1,
  });

  const conversation = conversationByParticipants?.items?.[0];
  if (!conversation) return null;

  const myParticipant = conversation.participants?.items?.find(
    (p) => p.userId === currentUserId,
  );

  // If the current user soft-deleted this conversation, treat it as non-existent
  if (myParticipant?.isDeleted) return null;

  return {
    conversationId: conversation.id,
    participantId: myParticipant?.id,
    requestStatus: myParticipant?.requestStatus,
    isMuted: myParticipant?.isMuted,
  };
}

export { findExistingConversation, buildParticipantKey };
export type { FindConversationResult };
