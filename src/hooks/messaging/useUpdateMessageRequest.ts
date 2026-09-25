import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { UpdateMessageRequest } from './mutation/updateMessageRequest';

type UpdateMessageRequestInput = {
  participantId: string;
  action: 'ACCEPTED' | 'DECLINED';
};

type UpdateMessageRequestOutput = {
  success: boolean;
  participantId: string;
  conversationId: string;
  requestStatus: string;
};

function useUpdateMessageRequest() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<UpdateMessageRequestOutput, Error, UpdateMessageRequestInput>({
    mutationFn: async (input) => {
      const { updateMessageRequest } = await amplify.request<{
        updateMessageRequest: UpdateMessageRequestOutput;
      }>(UpdateMessageRequest, { input });
      return updateMessageRequest;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['get-conversations', sub] });
      queryClient.refetchQueries({ queryKey: ['get-message-requests', sub] });
    },
  });
}

export { useUpdateMessageRequest };
export type { UpdateMessageRequestOutput };
