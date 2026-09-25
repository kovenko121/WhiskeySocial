import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { BottomNavbar, Text, CommentPostScreen, PostCard } from '@components';
import { useGetUser, useGetUserClubs, useMyPosts, useUpdateCover, useUserModerationPolling } from '@hooks';
import { useAuth } from '@contexts';
import { Storage } from 'aws-amplify';
import { getBlob, takePicture, uploadPicture } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModerationStatus, Post, UserType } from '@types';
import { createLogger } from '../../../services/logger';
import {
  ScreenContainer,
  StatusBar,
  Divider,
  EmptyPostList,
  FooterLoaderWrapper,
  SafeAreaView,
} from './styles';
import MyCollectionHeader from './MyCollectionHeader';
// TODO: further modularize by moving FlatList back into a UserActivites component now that refactor done

const logger = createLogger('MyCollection');

const FooterLoader = ({ isLoading }: { isLoading: boolean }) => {
  const insets = useSafeAreaInsets();

  return (
    <FooterLoaderWrapper bottomInset={Math.max(insets.bottom, 24)}>
      {isLoading && <ActivityIndicator size="small" color="#fff" />}
    </FooterLoaderWrapper>
  );
};

const ItemSeparator = () => <Divider />;

const MyCollectionScreen = () => {
  const { data: myUser, refetch: refetchUser } = useGetUser();
  const {
    user: { sub },
  } = useAuth();
  const { mutate: mutateUpdateCover, isPending: isLoadingUpdateCover } =
    useUpdateCover();

  const [refreshKey, setRefreshKey] = useState(0);

  const { trackImageUpload } = useUserModerationPolling((imageType, status) => {
    if (status === ModerationStatus.REJECTED) {
      if (imageType === 'cover') {
        setCoverPicture(undefined);
        setRefreshKey(prev => prev + 1);
      }
    } else if (status === ModerationStatus.APPROVED) {
      // Nothing to do: the approved image is already displayed optimistically.
    }
  });

  const {
    data: myPosts,
    isLoading: isFetchingPosts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchPosts,
  } = useMyPosts(sub);
  const { data: userClubs, refetch: refetchUserClubs } = useGetUserClubs({ userId: sub });
  const userClubIds = useMemo(() => userClubs?.map(club => club.id) ?? [], [userClubs]);

  const [coverPicture, setCoverPicture] = useState(
    myUser?.coverPictureLoaded || undefined
  );

  const [isClosing, setIsClosing] = useState(false);
  const [showPopUpMenu, setShowPopUpMenu] = useState(false);

  // Sync local coverPicture state when cache data changes (for moderation updates)
  useEffect(() => {
    setCoverPicture(myUser?.coverPictureLoaded || undefined);
  }, [myUser?.coverPictureLoaded]);
  const profileRef = useRef<FlatList<Post>>(null);
  const [commentPostScreen, setCommentPostScreen] = useState(false);
  const [commentPostId, setCommentPostId] = useState('');
  const [activitiesTags, setActivitiesTags] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const submitCoverPicture = async (uri: string) => {
    const originalKey = uri.split('/').pop() as string;
    const prefixedKey = createImageKey('cover', originalKey);
    const blob = await getBlob(uri);

    // Save the key to DB first so it's there when Lambda runs
    mutateUpdateCover(prefixedKey);

    // Then upload to S3 (which triggers the Lambda)
    Storage.put(prefixedKey, blob, { level: 'public' });

    // Track the uploaded image for moderation polling
    trackImageUpload('cover');
  };

  // Recreated each render by design; wrapping these in useCallback would change
  // when the options useMemo below rebuilds.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uploadPictureCallback = async () => {
    const uploadedPicture = await uploadPicture();
    if (uploadedPicture) {
      setCoverPicture(uploadedPicture);
      await submitCoverPicture(uploadedPicture.uri);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const takePictureCallback = async () => {
    const uploadedPicture = await takePicture();
    if (uploadedPicture) {
      setCoverPicture(uploadedPicture);
      await submitCoverPicture(uploadedPicture.uri);
    }
  };

  const options = useMemo(
    () => {
      // Don't show cover photo options for BRAND users
      if (myUser?.userType === UserType.BRAND) {
        return [];
      }
      return [
        {
          id: 'upload-cover-pic',
          title: 'Upload Cover Picture',
          icon: 'upload',
          action: uploadPictureCallback,
        },
        {
          id: 'take-cover-photo',
          title: 'Take Cover Photo',
          icon: 'take-picture',
          action: takePictureCallback,
        },
      ];
    },
    [myUser?.userType, uploadPictureCallback, takePictureCallback]
  );

  const filteredPosts = useMemo(() => {
    if (!myPosts) return [];
    const seen = new Set<string>();
    return myPosts.pages
      .flatMap((page) => page.items)
      .filter((post) => {
        if (seen.has(post.id)) return false;
        seen.add(post.id);
        return (
          !activitiesTags.length ||
          activitiesTags.some((tag) =>
            post.title?.includes(tag.substring(0, 4))
          )
        );
      });
  }, [myPosts, activitiesTags]);

  const openCommentPostScreen = useCallback((postId: string) => {
    setCommentPostId(postId);
    setCommentPostScreen(true);
  }, []);

  const closeCommentPostScreen = useCallback(() => {
    setCommentPostScreen(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch all queries related to this user profile using their refetch functions
      await Promise.all([
        refetchUser(),
        refetchPosts(),
        refetchUserClubs(),
      ]);
    } catch (error) {
      logger.error('Failed to refresh user profile data:', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const from = useMemo(() => ({ page: 'MyCollection' as const, id: undefined }), []);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        from={from}
        onCommentPress={() => openCommentPostScreen(item.id)}
        isFetching={false}
        padded
        userActiveClubIds={userClubIds}
      />
    ),
    [openCommentPostScreen, from, userClubIds]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const listHeaderComponent = React.useMemo(
    () => (
      <MyCollectionHeader
        userId={sub}
        myUser={myUser}
        coverPicture={coverPicture || ''}
        isLoadingUpdateCover={isLoadingUpdateCover}
        showPopUpMenu={showPopUpMenu}
        setShowPopUpMenu={setShowPopUpMenu}
        setIsClosing={setIsClosing}
        isClosing={isClosing}
        options={options}
        activitiesTags={activitiesTags}
        setActivitiesTags={setActivitiesTags}
        postsLength={filteredPosts.length}
        refreshKey={refreshKey}
      />
    ),
    [
      refreshKey,
      sub,
      myUser,
      coverPicture,
      isLoadingUpdateCover,
      showPopUpMenu,
      isClosing,
      options,
      activitiesTags,
      filteredPosts.length,
    ]
  );

  return (
    <ScreenContainer>
      <StatusBar insets={{ top: 0, bottom: 0, left: 0, right: 0 }} />
      <SafeAreaView>
        <FlatList
          ref={profileRef}
          data={filteredPosts}
          extraData={userClubIds}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeaderComponent}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={
            <EmptyPostList>
              <Text size={13} mv={155} color="white" align="center">
                You don't have any posts yet.{'\n'}Start now by adding a new
                content in the Activity tab.
              </Text>
            </EmptyPostList>
          }
          ListFooterComponent={
            <FooterLoader isLoading={isFetchingNextPage || isFetchingPosts} />
          }
          onEndReached={onEndReached}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.2}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          windowSize={21}
          scrollEventThrottle={35}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
        />
      </SafeAreaView>

      <BottomNavbar
        active="my-collection"
        onActivePress={() =>
          profileRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
      />

      {commentPostScreen && (
        <CommentPostScreen
          visible={commentPostScreen}
          postId={commentPostId}
          onBackButtonPress={closeCommentPostScreen}
        />
      )}
    </ScreenContainer>
  );
};

export { MyCollectionScreen };
