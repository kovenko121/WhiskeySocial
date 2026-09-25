import {
  Ad,
  BottomNavbar,
  CommentPostScreen,
  CreatePostModal,
  PostCard,
  Text,
} from '@components';
import { useAuth, useAuthGate } from '@contexts';
import { useGetUser, useGetUserClubs, usePosts, usePostModerationPolling } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdType, Post, RootStackParams,
  Routes
} from '@types';
import { ComponentType, useMemo, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { NUDGE_COPY } from '../../../copy/nudges';
import { createLogger } from '../../../services/logger';
import { CongratulationsDialog } from '../../Rewards';
import { Header } from '../components';
import { FindUserModalBottom } from '../components/FindUserModalBottom/FindUserModalBottom';
import { useFeedImpressions } from './useFeedImpressions';
import {
  ContentContainer,
  Divider,
  Empty,
  EmptyPostList,
  GuestInvite,
  HeaderWrapper,
  SafeAreaView,
  ScreenContainer,
} from './styles';

const logger = createLogger('Home');

type Props = NativeStackScreenProps<RootStackParams, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const {
    user: { sub } = {},
    isGuest,
  } = useAuth();
  const postListRef = useRef<FlatList<Post>>(null);
  const triggerAuthGate = useAuthGate();

  const { data: userData } = useGetUser();
  const { data: userClubs } = useGetUserClubs({ userId: sub });

  // Set up polling for post moderation notifications
  const { trackPost } = usePostModerationPolling();

  const [commentPostScreen, setCommentPostScreen] = useState(false);
  const [newPostWindowVisible, setNewPostWindowVisible] = useState(false);
  const [findUserVisible, setFindUserVisible] = useState(false);
  const [commentPostId, setPostId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const userClubIds = useMemo(() => userClubs?.map(club => club.id) ?? [], [userClubs]);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
    refetch,
  } = usePosts(userClubIds, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      logger.error('Failed to refresh activity feed:', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const openCommentPostScreen = useCallback((postId: string) => {
    setCommentPostScreen(true);
    setPostId(postId);
  }, []);

  const { viewabilityConfig, onViewableItemsChanged, onScrollSettled } =
    useFeedImpressions();

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <PostCard
        post={item}
        isFetching={isFetching}
        from={{ page: 'Home' }}
        onCommentPress={() => openCommentPostScreen(item.id)}
        padded={false}
        userActiveClubIds={userClubIds}
        feedPosition={index}
      />
    ),
    [isFetching, openCommentPostScreen, userClubIds]
  );

  const formattedData: Post[] = useMemo(() => {
    if (!data) return [];
    return data.pages
      .flatMap((page) => page.items)
      .filter(
        (post) =>
          post?.author != null &&
          !post.author.deleted &&
          !userData?.blockedUsers?.includes(post.author.id)
      ) as Post[];
  }, [data, userData]);

  const header = (
    <Header
      setFindUserVisible={setFindUserVisible}
      onCreatePostPress={() => setNewPostWindowVisible(true)}
      isGuest={isGuest}
    />
  );

  const feedReady = !isLoading && !!data;

  return (
    <ScreenContainer>
      <ContentContainer>
        <SafeAreaView>
          {isGuest && (
            <>
              <HeaderWrapper>{header}</HeaderWrapper>
              <GuestInvite>
                <Text size={20} mv={8} color="white" align="center" bold>
                  {NUDGE_COPY.default.headline}
                </Text>
                <Text size={15} color="neutral300" align="center">
                  {NUDGE_COPY.default.subhead}
                </Text>
                <Text
                  size={15}
                  mv={24}
                  color="white"
                  align="center"
                  bold
                  onPress={() => triggerAuthGate('default')}
                >
                  {NUDGE_COPY.default.cta} →
                </Text>
              </GuestInvite>
            </>
          )}
          {!isGuest && feedReady && (
            <FlatList
              style={{ height: '100%' }}
              ref={postListRef}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <HeaderWrapper>
                  {header}
                  <Ad type={AdType.ACTIVITY} bottomDivider />
                </HeaderWrapper>
              }
              data={formattedData}
              extraData={userClubIds}
              renderItem={renderItem}
              keyExtractor={(item) => item!.id}
              onEndReached={handleLoadMore}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              onMomentumScrollEnd={onScrollSettled}
              onScrollEndDrag={onScrollSettled}
              initialNumToRender={7}
              maxToRenderPerBatch={10}
              windowSize={10}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#f0f0f0"
                />
              }
              ItemSeparatorComponent={
                (<Divider />) as unknown as ComponentType<any>
              }
              ListEmptyComponent={<EmptyPostList />}
              ListFooterComponent={
                <>
                  {isFetchingNextPage && <ActivityIndicator />}
                  <Empty />
                </>
              }
            />
          )}
          {!isGuest && !feedReady && (
            <>
              {header}
              <ActivityIndicator />
            </>
          )}
        </SafeAreaView>
      </ContentContainer>
      <FindUserModalBottom
        onBackButtonPress={() => setFindUserVisible(false)}
        onUserSelected={(user) => {
          setFindUserVisible(false);
          navigation.navigate(Routes.UserProfile, { id: user.id });
        }}
        visible={findUserVisible}
        followButton
      />
      <CongratulationsDialog />

      <CommentPostScreen
        onBackButtonPress={() => setCommentPostScreen(!commentPostScreen)}
        visible={commentPostScreen}
        postId={commentPostId}
      />
      <CreatePostModal
        visible={newPostWindowVisible}
        onBackButtonPress={() => setNewPostWindowVisible(false)}
        onPostCreated={trackPost}
      />
      <BottomNavbar
        active="home"
        onActivePress={() =>
          postListRef &&
          (postListRef.current as any)?.scrollToOffset({
            animated: true,
            offset: 0,
          })
        }
      />
    </ScreenContainer>
  );
};

export { HomeScreen };
