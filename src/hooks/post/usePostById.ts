import { amplify } from '@services';
import { Post } from '@types';
import { useQuery } from '@tanstack/react-query';
import { GetPostById } from './query/GetPostById';

interface UsePostByIdOptions {
  enabled?: boolean;
}

function usePostById(id: string, options?: UsePostByIdOptions) {
  return useQuery<Post | null>({
    queryKey: ['get-post', id],
    queryFn: async () => {
      const { getPost } = await amplify.request<{ getPost: Post }>(GetPostById, {
        id,
      });

      // Don't show rejected, error, or pending posts via deep links
      // Only approved content should be accessible via direct links
      if (getPost?.photo && getPost.photoModerationStatus) {
        if (getPost.photoModerationStatus === 'REJECTED' ||
            getPost.photoModerationStatus === 'PENDING' ||
            getPost.photoModerationStatus === 'ERROR') {
          return null; // Only approved posts accessible via deep links
        }
      }

      return getPost;
    },
    enabled: options?.enabled ?? true,
  });
}

export { usePostById };
