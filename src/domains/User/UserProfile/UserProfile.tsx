import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, findNodeHandle, RefreshControl, Share, View, FlatList, InteractionManager} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomNavbar, CommentPostScreen, PostCard, Text, useAdminQRCode } from '@components';
import { useGetUser, useGetUserClubs, useIsAppAdmin, useMyPosts, useBlockUnblockUser } from '@hooks';
import { useAuth, useAuthGate } from '@contexts';
import { createShareLink } from '@helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Post, type RootStackParams, UserType } from '@types';
import OutsidePressHandler from 'react-native-outside-press';
import { createLogger } from '../../../services/logger';
import { screenNameFor } from '../../../services/screenNames';
import { capturePostHogEvent, groupPostHogBrand, groupPostHogVenue } from '../../../config/posthog';
import {
  HandleBar,
  HandleContainer,
  MenuModal,
  ScreenContainer,
  StatusBar,
  VenueMenuView,
  EmptyPostList,
  Divider,
  SafeAreaView,
  FooterLoaderWrapper,
} from './styles';
import MemoizedHeader from './UserProfileHeader';
// TODO: further modularize by moving FlatList back into a UserActivites component now that refactor done

const FooterLoader = ({ isLoading }: { isLoading: boolean }) => {
  const insets = useSafeAreaInsets();

  return (
    <FooterLoaderWrapper bottomInset={Math.max(insets.bottom, 24)}>
      {isLoading && <ActivityIndicator size="small" color="#fff" />}
    </FooterLoaderWrapper>
  );
};

type Props = NativeStackScreenProps<RootStackParams, 'UserProfile'>;

const logger = createLogger('UserProfile');

const ItemSeparator = () => <Divider />;

const SheetHandle = () => (
  <HandleContainer>
    <HandleBar />
  </HandleContainer>
);

const UserProfileScreen = ({ route, navigation }: Props) => {
  const { data: myUser } = useGetUser();
  const userId = route.params.id;
  const { data: user, isLoading, refetch: refetchUser } = useGetUser(userId);
  const rollTo = route.params.roll;
  const [refreshing, setRefreshing] = useState(false);
  const [venueMenuUrl] = useState('');
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%', '85%'], []);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<FlatList<any> | null>(null);
  const wishlistRef = useRef<View>(null);
  const [showPopUpMenu, setShowPopUpMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isUserBlocked = myUser?.blockedUsers?.includes(user?.id || '');
  const { mutate: blockUnblockUser } = useBlockUnblockUser();
  const [activitiesTags, setActivitiesTags] = useState<string[]>([]);
  const [commentPostScreen, setCommentPostScreen] = useState(false);
  const [commentPostId, setCommentPostId] = useState('');

  // Get current user's clubs for share button validation and profile filtering
  const { user: currentAuthUser, isGuest } = useAuth();
  const sub = currentAuthUser?.sub;
  const triggerAuthGate = useAuthGate();
  const isAppAdmin = useIsAppAdmin();
  const qrTitle = user?.personFirstName
    ? `${user.personFirstName}'s Profile`
    : user?.venueName ?? 'Profile QR Code';
  const { showQRCode, QRModal } = useAdminQRCode({
    type: 'user',
    id: userId,
    title: qrTitle,
  });
  const { data: userClubs, refetch: refetchUserClubs } = useGetUserClubs({ userId: sub });
  const userClubIds = useMemo(() => userClubs?.map(club => club.id) ?? [], [userClubs]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchPosts } =
    useMyPosts(userId, userClubIds);

  // PostHog Tracking
  useEffect(() => {
    if (user && !isLoading) {
      const routes = navigation.getState()?.routes;
      const sourceScreen =
        routes && routes.length > 1
          ? screenNameFor(routes[routes.length - 2].name)
          : 'direct';
      // toBeRedeemed === true means the profile has NOT been claimed yet
      const isClaimed = !user.toBeRedeemed;

      if (user.userType === UserType.BRAND) {
        groupPostHogBrand(user.id, user.brandName || user.venueName);
        capturePostHogEvent('brand_page_view', {
          brand_id: user.id,
          brand_name: user.brandName || user.venueName,
          source_screen: sourceScreen,
          claimed: isClaimed,
          // @todo [WHI-8]: session_id — PostHog auto-attaches $session_id; add explicit session_id here if custom session tracking is needed.
        }, { brand: user.id });
      } else if (user.userType === UserType.VENUE) {
        groupPostHogVenue(user.id, user.venueName);
        capturePostHogEvent('venue_page_view', {
          venue_id: user.id,
          venue_name: user.venueName,
          source_screen: sourceScreen,
          claimed: isClaimed,
          // @todo [WHI-8]: session_id — PostHog auto-attaches $session_id; add explicit session_id here if custom session tracking is needed.
        }, { venue: user.id });
      }
    }
  }, [user, isLoading, navigation]);

  const openCommentPostScreen = useCallback((postId: string) => {
    setCommentPostId(postId);
    setCommentPostScreen(true);
  }, []);

  const closeCommentPostScreen = () => setCommentPostScreen(false);

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

  const handleShare = useCallback(async () => {
    const url = createShareLink({
      type: 'user',
      id: user?.id ?? userId,
    });
    Share.share({
      message: `Look at this profile on Whiskey Social\n${url}`,
    });
  }, [user?.id, userId]);

  const options = useMemo(
    () => [
      {
        title: 'Share',
        icon: 'share',
        action: handleShare,
      },
      ...(isAppAdmin && !isGuest
        ? [
          {
            title: 'QR Code',
            icon: 'qr-code',
            action: () => {
              setShowPopUpMenu(false);
              showQRCode();
            },
          },
        ]
        : []),
      ...(!isGuest
        ? [
          {
            title: isUserBlocked ? 'Unblock User' : 'Block User',
            icon: isUserBlocked ? 'unlock' : 'lock',
            action: () => {
              blockUnblockUser({ id: user?.id || '' });
              setShowPopUpMenu(false);
            },
          },
        ]
        : []),
    ],
    [handleShare, isAppAdmin, isGuest, showQRCode, isUserBlocked, blockUnblockUser, user?.id]
  );

  const posts = useMemo(() => {
    const seen = new Set();
    return (data?.pages ?? [])
      .flatMap((page) => page.items)
      .filter((post) => {
        if (seen.has(post.id)) return false;
        seen.add(post.id);
        return (
          !activitiesTags.length ||
          activitiesTags.some((tag) =>
            post?.title?.includes(tag.substring(0, 4))
          )
        );
      });
  }, [data, activitiesTags]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const from = useMemo(
    () => ({
      page: userId === myUser?.id ? 'MyCollection' : 'UserProfile',
      id: userId === myUser?.id ? undefined : userId,
    }),
    [userId, myUser?.id]
  );

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        isFetching={false}
        onCommentPress={() => openCommentPostScreen(item.id)}
        from={from}
        padded
        userActiveClubIds={userClubIds}
      />
    ),
    [openCommentPostScreen, from, userClubIds]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const listHeaderComponent = React.useMemo(
    () => (
      <MemoizedHeader
        user={user}
        myUser={myUser}
        userId={userId}
        isLoading={isLoading}
        isUserBlocked={isUserBlocked}
        createPostVisible={createPostVisible}
        setCreatePostVisible={setCreatePostVisible}
        showPopUpMenu={showPopUpMenu}
        setShowPopUpMenu={setShowPopUpMenu}
        setIsClosing={setIsClosing}
        isClosing={isClosing}
        options={options}
        wishlistRef={wishlistRef}
        postsLength={posts.length}
        activitiesTags={activitiesTags}
        setActivitiesTags={setActivitiesTags}
      />
    ),
    [
      user,
      myUser,
      userId,
      isLoading,
      isUserBlocked,
      createPostVisible,
      setCreatePostVisible,
      showPopUpMenu,
      setShowPopUpMenu,
      setIsClosing,
      isClosing,
      options,
      wishlistRef,
      posts.length,
      activitiesTags,
      setActivitiesTags,
    ]
  );

  const listEmptyComponent = React.useMemo(() => {
    if (isGuest) {
      return (
        <EmptyPostList>
          <Text size={15} mv={24} color="white" align="center" bold>
            Sign up to see {user?.personFirstName || user?.venueName || 'this person'}'s activity.
          </Text>
          <Text size={13} color="neutral300" align="center" onPress={() => triggerAuthGate('default')}>
            Create free account →
          </Text>
        </EmptyPostList>
      );
    }

    if (user?.userType !== UserType.BRAND) {
      return (
        <EmptyPostList>
          <Text size={13} mv={155} color="white" align="center">
            {user?.personFirstName} doesn't have any posts yet.{'\n'}Start now by
            adding a new content in the Activity tab.
          </Text>
        </EmptyPostList>
      );
    }

    return null;
  }, [isGuest, user, triggerAuthGate]);

  useEffect(() => {
    if (rollTo === 'wishlist' && wishlistRef.current && scrollRef.current) {
      const timeout = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          const handle = findNodeHandle(wishlistRef.current);
          const scrollHandle = findNodeHandle(scrollRef.current);
          if (handle && scrollHandle) {
            wishlistRef.current!.measureLayout(
              scrollHandle,
              (x, y) => {
                scrollRef.current?.scrollToOffset({
                  offset: y,
                  animated: true,
                });
              },
              () => {
                logger.warn('measureLayout error');
              }
            );
          }
        });
      }, 150);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [rollTo]);

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <SafeAreaView>
        <FlatList
          style={{ flex: 1 }}
          ref={scrollRef}
          scrollEventThrottle={35}
          data={posts}
          extraData={userClubIds}
          keyExtractor={keyExtractor}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          renderItem={renderItem}
          onEndReached={onEndReached}
          windowSize={21}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
          ItemSeparatorComponent={ItemSeparator}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={<FooterLoader isLoading={isFetchingNextPage} />}
        />
      </SafeAreaView>
      {!isGuest && <BottomNavbar active="home" />}

      <OutsidePressHandler
        onOutsidePress={() => bottomSheetModalRef.current?.close()}
      >
        <MenuModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          handleComponent={SheetHandle}
        >
          <VenueMenuView source={{ uri: venueMenuUrl }} />
        </MenuModal>
      </OutsidePressHandler>

      <CommentPostScreen
        onBackButtonPress={closeCommentPostScreen}
        visible={commentPostScreen}
        postId={commentPostId}
      />
      <QRModal />
    </ScreenContainer>
  );
};

export { UserProfileScreen };
