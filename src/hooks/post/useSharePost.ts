import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { Post } from '@types';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { UnauthorizedClubActionError, isUnauthorizedClubActionError } from '@helpers';
import { SharePost } from './mutation/sharePost';
import { createLogger } from '../../services/logger';
import { validateClubMembership } from '../clubs/useValidateClubMembership';

const logger = createLogger('useSharePost');

const useSharePost = (onSuccess: () => void) => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    Post,
    unknown,
    {
      sharedPostId: string;
      shareComment?: string;
      clubId?: string;
      clubIsPrivate?: boolean;
    }
  >({
    mutationFn: async (data) => {
      // Validate club membership before sharing club posts
      if (data.clubId) {
        const { isValid } = await validateClubMembership(data.clubId, sub);
        if (!isValid) {
          throw new UnauthorizedClubActionError(
            'You are not a member of this club'
          );
        }
      }

      const requestData = {
        sharedPostId: data.sharedPostId,
        authorId: sub,
        shareComment: data.shareComment?.trim() || null,
        clubId: data.clubId || null,
        clubIsPrivate: data.clubId ? (data.clubIsPrivate ?? false) : null,
      };

      const { createPost } = await amplify.request<{ createPost: Post }>(
        SharePost,
        requestData
      );

      return createPost;
    },
    onSuccess(_, variables) {
      setTimeout(() => {
        // Always refetch get-posts for both Trending and Following feeds
        // Using partial key match to invalidate all variants
        queryClient.refetchQueries({ queryKey: ['get-posts'] });

        // Also refetch club-specific posts if this is a club post
        if (variables.clubId) {
          queryClient.refetchQueries({ queryKey: ['club-posts', variables.clubId] });
        }

        // Always refetch user's posts so MyCollection updates immediately
        queryClient.refetchQueries({ queryKey: ['get-my-posts'] });
        queryClient.refetchQueries({ queryKey: ['list-user-rewards'] });
        onSuccess();
      }, 2000);
    },
    onError(error) {
      logger.error('Share post failed:', error as Error);

      if (isUnauthorizedClubActionError(error)) {
        Alert.alert(
          'Cannot Share',
          'You are not a member of this club.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Share Failed',
          'Unable to share this post. Please try again.',
          [{ text: 'OK' }]
        );
      }
    },
  });
};

export { useSharePost };
