import { amplify } from '@services';
import { Comment } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListPostComments } from './query/ListPostComments';

function usePostComments(postId: string) {
  return useInfiniteQuery<{ nextToken: string; items: Comment[] }>({
    queryKey: ['get-comments', postId],
    queryFn: async ({ pageParam }) => {
      const { commentsByPostId } = await amplify.request<{
        commentsByPostId: {
          nextToken: string;
          items: Comment[];
        };
      }>(ListPostComments, {
        nextToken: pageParam || null,
        postId,
      });
      return commentsByPostId;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!postId && postId.trim() !== '',
  });
}

export { usePostComments };
