import { useMutation, useQueryClient } from '@tanstack/react-query';
import { amplify } from '@services';
import { PostLikeAction } from '@types';
import { updatePostLikes } from '../../graphql/mutations';
import { createLogger } from '../../services/logger';

const logger = createLogger('useUpdatePostLikes');

export interface UpdatePostLikesInput {
  userId: string;
  postId: string;
  action: PostLikeAction.like | PostLikeAction.unlike;
}

export interface UpdatePostLikesResult {
  success: boolean;
  message: string;
  postId: string;
  userId: string;
  likeId?: string;
  likesCount: number;
}

const useUpdatePostLikes = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdatePostLikesResult, Error, UpdatePostLikesInput>({
    mutationFn: async (input) => {
      const response = await amplify.request<{ updatePostLikes: UpdatePostLikesResult }>(
        updatePostLikes,
        { input }
      );

      return response.updatePostLikes;
    },
    onSuccess: (data) => {
      // Invalidate and refetch post-related queries
      queryClient.invalidateQueries({ queryKey: ['get-post', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['get-posts'] });
      queryClient.invalidateQueries({ queryKey: ['get-post-likes-count', data.postId] });

      // Update the cached post data with the new likes count
      queryClient.setQueryData(['get-post', data.postId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            likesCount: data.likesCount,
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      logger.error('Error updating post likes:', error);
    },
  });
};

export { useUpdatePostLikes };
