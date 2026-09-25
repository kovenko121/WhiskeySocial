import { amplify, queryClient } from '@services';
import { Post } from '@types';
import { useMutation } from '@tanstack/react-query';
import { DeletePost } from './mutation/deletePost';
import { createLogger } from '../../services/logger';

const logger = createLogger('useDeletePost');

const useDeletePost = () =>
  useMutation<
    Post,
    unknown,
    {
      postId: string;
      clubId?: string;
    }
  >({
    mutationFn: async (data) => {
      const { deletePost } = await amplify.request<{
        deletePost: Post;
      }>(DeletePost, {
        id: data.postId,
      });
      return deletePost;
    },
    onSuccess(_data, variables) {
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['get-posts'] });
        queryClient.refetchQueries({ queryKey: ['get-my-posts'] });

        // Refetch club posts if this was a club post
        if (variables.clubId) {
          queryClient.refetchQueries({ queryKey: ['club-posts', variables.clubId] });
        }
      }, 2000);
    },
    onError(error) {
      logger.error('Delete failed:', error as Error);
    },
  });

export { useDeletePost };
