import { queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { createLogger } from '../../services/logger';
import { useUpdateClub } from './useUpdateClub';

const logger = createLogger('useUnpinClubPost');

interface UnpinClubPostInput {
  clubId: string;
}

function useUnpinClubPost() {
  const { mutateAsync: updateClub } = useUpdateClub();

  return useMutation({
    mutationFn: async ({ clubId }: UnpinClubPostInput) => updateClub({
        id: clubId,
        pinnedPostId: null,
      }),
    onSuccess: (_data, variables) => {
      // Refetch club posts to update pinned post display
      queryClient.invalidateQueries({ queryKey: ['club-posts', variables.clubId] });
      // Refetch club data to get updated pinnedPostId
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      Alert.alert('Success', 'Post unpinned successfully');
    },
    onError: (error: any) => {
      logger.error('Error unpinning post:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to unpin post. Only club admins can unpin posts.'
      );
    },
  });
}

export { useUnpinClubPost };
