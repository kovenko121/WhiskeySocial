import { amplify, queryClient } from '@services';
import { Comment } from '@types';
import { useMutation } from '@tanstack/react-query';
import { DeleteComment } from './mutation/deleteComment';

const useDeleteComment = () =>
  useMutation<
    Comment,
    unknown,
    {
      commentId: string;
    }
  >({
    mutationFn: async (data) => {
      const { deleteComment } = await amplify.request<{
        deleteComment: Comment;
      }>(DeleteComment, {
        id: data.commentId,
      });

      return deleteComment;
    },
    onSuccess() {
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['get-comments'] });
      }, 2000);
    },
  });

export { useDeleteComment };
