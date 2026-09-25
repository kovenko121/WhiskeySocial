import { useAuth } from '@contexts';
import { queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { createLogger } from '../../services/logger';
import { useUpdateClub } from './useUpdateClub';

const logger = createLogger('usePinClubPost');

interface PinClubPostInput {
  clubId: string;
  postId: string;
}

function usePinClubPost() {
  const {
    user: { sub },
  } = useAuth();
  const { mutateAsync: updateClub } = useUpdateClub();

  return useMutation({
    mutationFn: async ({ clubId, postId }: PinClubPostInput) => updateClub({
        id: clubId,
        pinnedPostId: postId,
        pinnedBy: sub,
      }),
    onSuccess: (_data, variables) => {
      // Refetch club posts to update pinned post display
      queryClient.invalidateQueries({ queryKey: ['club-posts', variables.clubId] });
      // Refetch club data to get updated pinnedPostId
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      Alert.alert('Success', 'Post pinned successfully');
    },
    onError: (error: any) => {
      logger.error('Error pinning post:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to pin post. Only club admins can pin posts.'
      );
    },
  });
}

export { usePinClubPost };
