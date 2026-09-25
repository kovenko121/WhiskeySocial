import { CommentPostScreen, Icon, PostCard, Title } from '@components';
import { useAuth } from '@contexts';
import {
  useClubPosts,
  useGetUserClubs,
  usePinClubPost,
  usePostById,
  usePostModerationPolling,
  useUnpinClubPost,
} from '@hooks';
import { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { CreatePostButton } from '../CreatePostButton/CreatePostButton';
import { CreateClubPostModal } from '../CreateClubPostModal/CreateClubPostModal';
import { PinnedPostBanner } from '../PinnedPostBanner/PinnedPostBanner';
import {
  Divider,
  EmptyContainer,
  EmptyText,
  LoadingContainer,
  LoadMoreButton,
  LoadMoreText,
  LockContainer,
  LockText,
  PinnedPostWrapper,
  PostsContainer,
  PostWrapper,
  SectionContainer,
  SectionHeader,
} from './styles';

interface ClubPostsFeedProps {
  clubId: string;
  isPrivate: boolean;
  pinnedPostId?: string | null;
  isAdmin: boolean;
  canViewPosts: boolean;
  isMember: boolean;
}

export const ClubPostsFeed = ({
  clubId,
  isPrivate,
  pinnedPostId,
  isAdmin,
  canViewPosts,
  isMember,
}: ClubPostsFeedProps) => {
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [commentPostScreen, setCommentPostScreen] = useState(false);
  const [commentPostId, setCommentPostId] = useState('');

  // Set up polling for post moderation notifications
  const { trackPost } = usePostModerationPolling();

  // Pin/Unpin hooks
  const { mutate: pinPost } = usePinClubPost();
  const { mutate: unpinPost } = useUnpinClubPost();

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useClubPosts(clubId);

  // Get current user's clubs for share button validation
  const {
    user: { sub },
  } = useAuth();
  const { data: userClubs } = useGetUserClubs({ userId: sub });
  const userClubIds = useMemo(
    () => userClubs?.map((club) => club.id) ?? [],
    [userClubs]
  );

  // Fetch pinned post separately to ensure it's always available
  // (may not be in initially loaded pages if it's old)
  const { data: fetchedPinnedPost } = usePostById(pinnedPostId || '', {
    enabled: !!pinnedPostId,
  });

  // Flatten paginated data
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Find pinned post - prefer from paginated data (fresher), fallback to separate fetch
  const pinnedPost = useMemo(() => {
    if (!pinnedPostId) return null;
    // First check paginated data (has latest like counts, comments, etc.)
    const fromPaginated = allPosts.find((post) => post.id === pinnedPostId);
    if (fromPaginated) return fromPaginated;
    // Fallback to separately fetched post (ensures pinned post always shows)
    return fetchedPinnedPost || null;
  }, [allPosts, pinnedPostId, fetchedPinnedPost]);

  // Filter out pinned post from regular list
  const regularPosts = useMemo(() => {
    if (!pinnedPostId) return allPosts;
    return allPosts.filter((post) => post.id !== pinnedPostId);
  }, [allPosts, pinnedPostId]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const openCommentPostScreen = useCallback((postId: string) => {
    setCommentPostScreen(true);
    setCommentPostId(postId);
  }, []);

  const handlePostCreated = useCallback(
    (postId: string, hasPhoto: boolean) => {
      if (hasPhoto) {
        trackPost(postId);
      }
    },
    [trackPost]
  );

  const handlePinPost = useCallback(
    (postId: string) => {
      pinPost({ clubId, postId });
    },
    [clubId, pinPost]
  );

  const handleUnpinPost = useCallback(() => {
    unpinPost({ clubId });
  }, [clubId, unpinPost]);

  // Lock screen for non-members of private clubs
  if (!canViewPosts) {
    return (
      <SectionContainer>
        <SectionHeader>
          <Title size={18}>Club Posts</Title>
        </SectionHeader>
        <LockContainer>
          <Icon name="lock" size={32} color="grey300" />
          <LockText>Join this club to view posts</LockText>
        </LockContainer>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionHeader>
        <Title size={18}>Club Posts</Title>
      </SectionHeader>

      {/* Create Post Button - only for active members */}
      {isMember && (
        <CreatePostButton onPress={() => setCreatePostVisible(true)} />
      )}

      {isLoading ? (
        <LoadingContainer>
          <ActivityIndicator color="#fff" />
        </LoadingContainer>
      ) : (
        <PostsContainer>
          {/* Pinned Post */}
          {pinnedPost && (
            <>
              <PinnedPostWrapper>
                <PinnedPostBanner />
                <PostCard
                  post={pinnedPost}
                  isFetching={isFetching}
                  from={{ page: 'ClubProfile', id: clubId }}
                  onCommentPress={() => openCommentPostScreen(pinnedPost.id)}
                  padded={false}
                  isClubAdmin={isAdmin}
                  isPinned
                  onPinPost={() => handlePinPost(pinnedPost.id)}
                  onUnpinPost={handleUnpinPost}
                  userActiveClubIds={userClubIds}
                />
              </PinnedPostWrapper>
              {regularPosts.length > 0 && <Divider />}
            </>
          )}

          {/* Regular Posts */}
          {regularPosts.map((post, index) => (
            <PostWrapper key={post.id}>
              <PostCard
                post={post}
                isFetching={isFetching}
                from={{ page: 'ClubProfile', id: clubId }}
                onCommentPress={() => openCommentPostScreen(post.id)}
                padded={false}
                isClubAdmin={isAdmin}
                isPinned={false}
                onPinPost={() => handlePinPost(post.id)}
                onUnpinPost={handleUnpinPost}
                userActiveClubIds={userClubIds}
              />
              {index < regularPosts.length - 1 && <Divider />}
            </PostWrapper>
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <LoadMoreButton
              onPress={handleLoadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator color="#FF9500" size="small" />
              ) : (
                <LoadMoreText>Load more posts</LoadMoreText>
              )}
            </LoadMoreButton>
          )}

          {/* Empty State */}
          {allPosts.length === 0 && (
            <EmptyContainer>
              <Icon name="message" size={48} color="grey300" />
              <EmptyText>
                {isMember
                  ? 'No posts yet.\nBe the first to post in this club!'
                  : 'No posts yet.\nJoin to start posting!'}
              </EmptyText>
            </EmptyContainer>
          )}
        </PostsContainer>
      )}

      {/* Create Club Post Modal */}
      <CreateClubPostModal
        visible={createPostVisible}
        onBackButtonPress={() => setCreatePostVisible(false)}
        clubId={clubId}
        clubIsPrivate={isPrivate}
        onPostCreated={handlePostCreated}
      />

      {/* Comment Modal */}
      <CommentPostScreen
        onBackButtonPress={() => setCommentPostScreen(false)}
        visible={commentPostScreen}
        postId={commentPostId}
      />
    </SectionContainer>
  );
};
