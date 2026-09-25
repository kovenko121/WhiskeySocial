import { useAuth } from '@contexts';
import { amplify } from '@services';
import { Post } from '@types';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ListPosts } from './query/ListPosts';

/**
 * Custom React hook to fetch the activity feed using infinite scrolling.
 *
 * Utilizes `useInfiniteQuery` to retrieve paginated posts from the backend,
 * supporting optional automatic refetching at a specified interval.
 * Filters posts on the server side based on moderation status.
 *
 * @param userClubIds - Club IDs the viewer is an active member of.
 * @param refetchInterval - Optional interval (in minutes) to refetch posts automatically.
 * @returns The result of `useInfiniteQuery`, including data, loading state, and pagination helpers.
 */
const usePosts = (userClubIds: string[] = [], refetchInterval?: number) => {
  const { user: { sub: currentUserId } = {}, isGuest } = useAuth();

  return useInfiniteQuery<{ nextToken: string; items: Post[] }>({
    queryKey: ['get-posts', userClubIds],
    queryFn: async ({ pageParam }) => {
      // Build moderation status filters
      // We want to show:
      // 1. All APPROVED posts
      // 2. Posts with null/undefined moderation status
      // 3. PENDING posts only if they belong to the current user
      // We never show REJECTED or ERROR posts

      const moderationFilters = [
        // Show approved posts
        { photoModerationStatus: { eq: 'APPROVED' } },
        // Show posts with no moderation status
        { photoModerationStatus: { exists: false } },
        // Show pending posts only for the current user
        ...(currentUserId ? [{
          and: [
            { photoModerationStatus: { eq: 'PENDING' } },
            { authorId: { eq: currentUserId } }
          ]
        }] : [])
      ];

      const validClubIds = userClubIds?.filter(Boolean) ?? [];

      const queryFilters = {
        and: [
          { or: moderationFilters },
          {
            or: [
              { clubId: { exists: false } },
              ...validClubIds.map((clubId) => ({ clubId: { eq: clubId } }))
            ]
          }
        ]
      };

      const { searchPosts } = await amplify.request<{
        searchPosts: { nextToken: string; items: Post[] };
      }>(ListPosts, {
        nextToken: pageParam || null,
        ...queryFilters
      });

      return searchPosts;
    },
    initialPageParam: null,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    refetchInterval: refetchInterval ? refetchInterval * 60 * 1000 : false,
    gcTime: 5 * 60 * 1000,
    enabled: !isGuest,
  });
};

export { usePosts };
