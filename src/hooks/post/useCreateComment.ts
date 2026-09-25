import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { Comment } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UnauthorizedClubActionError } from '@helpers';
import { CommentPost } from './mutation/commentPost';
import { validateClubMembership } from '../clubs/useValidateClubMembership';

const useCreateComment = (
  postId: string,
  clubId?: string | null,
  onError?: (error: Error) => void
) => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    Comment,
    unknown,
    {
      text: string;
    }
  >({
    mutationFn: async (data) => {
      // Validate club membership before creating comment on club posts
      if (clubId) {
        const { isValid } = await validateClubMembership(clubId, sub);
        if (!isValid) {
          throw new UnauthorizedClubActionError(
            'You are not a member of this club'
          );
        }
      }

      const { commentPost } = await amplify.request<{ commentPost: Comment }>(
        CommentPost,
        {
          authorId: sub,
          text: data.text.trim().replaceAll('\n', ''),
          postId,
        }
      );

      return commentPost;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-comments', postId] });
      queryClient.refetchQueries({ queryKey: ['get-posts'] });
      if (clubId) {
        queryClient.refetchQueries({ queryKey: ['club-posts', clubId] });
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error as Error);
      }
    },
  });
};

export { useCreateComment };
