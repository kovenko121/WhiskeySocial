import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { MarkMessagesAsRead } from './mutation/markMessagesAsRead';

type MarkMessagesAsReadInput = {
  conversationId: string;
};

type MarkMessagesAsReadOutput = {
  success: boolean;
  conversationId: string;
  readAt: string;
  updatedMessageCount: number;
};

function useMarkMessagesAsRead() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<MarkMessagesAsReadOutput, Error, MarkMessagesAsReadInput>({
    mutationFn: async (input) => {
      const { markMessagesAsRead } = await amplify.request<{
        markMessagesAsRead: MarkMessagesAsReadOutput;
      }>(MarkMessagesAsRead, { input });
      return markMessagesAsRead;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['get-conversations', sub] });
    },
  });
}

export { useMarkMessagesAsRead };
export type { MarkMessagesAsReadOutput };
