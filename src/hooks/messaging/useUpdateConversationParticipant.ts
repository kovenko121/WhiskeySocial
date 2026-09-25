import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { UpdateConversationParticipant } from './mutation/updateConversationParticipant';

type UpdateConversationParticipantInput = {
  id: string;
  isMuted?: boolean;
  isDeleted?: boolean;
};

type UpdateConversationParticipantOutput = {
  id: string;
  conversationId: string;
  userId: string;
  isMuted: boolean;
  isDeleted: boolean;
  updatedAt: string;
};

function useUpdateConversationParticipant() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<UpdateConversationParticipantOutput, Error, UpdateConversationParticipantInput>({
    mutationFn: async (input) => {
      const { updateConversationParticipant } = await amplify.request<{
        updateConversationParticipant: UpdateConversationParticipantOutput;
      }>(UpdateConversationParticipant, { input });
      return updateConversationParticipant;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['get-conversations', sub] });
    },
  });
}

export { useUpdateConversationParticipant };
export type { UpdateConversationParticipantInput };
