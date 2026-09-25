import { useAuth } from '@contexts';
import { amplify } from '@services';
import { Post } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListMyPosts } from './query/ListMyPosts';

/**
 * React hook to fetch and paginate posts for a given user profile.
 *
 * - When viewing your own profile, all your posts are shown (subject to moderation filtering).
 * - When viewing another user's profile, private club posts are only shown if the viewer is a member of those clubs.
 *
 * @param userId - The ID of the user whose posts to fetch.
 * @param viewerClubIds - List of club IDs the viewer is a member of. Used to determine visibility of private club posts when viewing other users' profiles.
 * @returns Infinite query result containing paginated posts.
 */
function useMyPosts(userId: string, viewerClubIds: string[] = []) {
  const { user, isGuest } = useAuth();
  const currentUserId = user?.sub;

  // Check if viewing own profile or someone else's
  const isOwnProfile = userId === currentUserId;

  return useInfiniteQuery<{ nextToken: string; items: Post[] }>({
    queryKey: ['get-my-posts', userId, viewerClubIds],
    enabled: !isGuest,
    queryFn: async ({ pageParam }) => {
      const { postsByAuthorIdAndCreatedAt } = await amplify.request<{
        postsByAuthorIdAndCreatedAt: {
          nextToken: string;
          items: Post[];
        };
      }>(ListMyPosts, {
        nextToken: pageParam || null,
        id: userId,
      });

      // Filter posts based on moderation status (profiles only show final content)
      let visiblePosts = postsByAuthorIdAndCreatedAt.items.filter(post => {
        // Show posts without images (text-only)
        if (!post.photo) return true;

        // Show only approved images or legacy posts (null status)
        // Hide pending, rejected, and error posts from profiles for cleaner UX
        return post.photoModerationStatus === 'APPROVED' ||
          post.photoModerationStatus === null;
      });

      // When viewing other users' profiles, hide private club posts
      // unless the viewer is also a member of that private club
      if (!isOwnProfile) {
        visiblePosts = visiblePosts.filter(post =>
          !post.clubIsPrivate ||
          (post.clubId && viewerClubIds.includes(post.clubId))
        );
      }

      return {
        ...postsByAuthorIdAndCreatedAt,
        items: visiblePosts
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    gcTime: 5 * 60 * 1000,
  });
}

export { useMyPosts };