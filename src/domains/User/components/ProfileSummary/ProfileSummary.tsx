import {
  FollowButton,
  Icon,
  Link,
  ProfilePicture,
  Text,
  Title,
} from '@components';
import { useAuth } from '@contexts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  capitalizeAll,
  formatNumber,
  getBlob,
  getTestId,
  openMap,
  openPhone,
  uploadFile,
} from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import {
  useFeatureFlags,
  useGetUser,
  useMyPosts,
  useNotificationByUserId,
  useUpdateVenueMenu,
  useUserRewards,
} from '@hooks';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigationProps, User, UserType,
  Routes
} from '@types';
import { Storage } from 'aws-amplify';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import OutsidePressHandler from 'react-native-outside-press';
import RewardIconMarker from '../../../../../assets/images/reward-icon-marker.png';
import RewardIcon from '../../../../../assets/images/reward-icon.png';
import { RewardsWelcomeDialog } from '../../../Rewards/RewardsWelcome/RewardsWelcomeDialog';
import { ThankYouDialog } from '../../../Rewards/ThankYouDialog/ThankYouDialog';
import { FollowInfoAndCheckin } from '../FollowInfoAndCheckin/FollowInfoAndCheckin';
import {
  ActionButtonsContainer,
  Column,
  HandleBar,
  HandleContainer,
  MenuModal,
  ResponsiveRow,
  RewardIconContainer,
  RewardsContainer,
  Row,
  RowContainer,
  TitleWrapper,
  VenueInfo,
  VenueMenu,
  VenueMenuView,
} from './styles';
import { capturePostHogEvent, groupPostHogVenue } from '../../../../config/posthog';
import { createLogger } from '../../../../services/logger';

const logger = createLogger('ProfileSummary');

const ProfileSummary = ({ userId }: { userId: string }) => {
  const navigation = useNavigation<NavigationProps>();
  const [rewardsThankYouVisible, setRewardsThankYouVisible] = useState(false);
  const { data: featureFlags, refetch: refetchFeatureFlags } =
    useFeatureFlags();
  const { user: currentAuthUser, isGuest } = useAuth();
  const sub = currentAuthUser?.sub;
  const { data: user, isLoading } = useGetUser(userId);
  const { data: myPosts } = useMyPosts(userId);
  const { refetch } = useNotificationByUserId();
  const [rewardsWelcomeVisible, setRewardsWelcomeVisible] = useState(false);
  const [rewardsMarker, setRewardsMarker] = useState<boolean>(false);
  const { data: userRewards, refetch: refetchUserRewards } = useUserRewards();

  const [deleteVenueMenu, setDeleteVenueMenu] = useState<boolean>(false);
  const { mutate: mutateVenueMenu, isPending: isLoadingUpdateMenu } =
    useUpdateVenueMenu();
  const [venueMenuUrl, setVenueMenuUrl] = useState('');

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['85%', '85%'], []);

  // Android's stock WebView can't render PDFs inline, so route the S3 url
  // through the Google Docs Viewer there. iOS renders PDFs natively.
  const menuViewerUrl = useMemo(() => {
    if (!venueMenuUrl) return '';
    return Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
          venueMenuUrl
        )}`
      : venueMenuUrl;
  }, [venueMenuUrl]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchFeatureFlags();
      refetchUserRewards();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const downloadMenu = async () => {
    try {
      const url = await Storage.get(user?.venueMenu!.key as string, {
        contentType: 'application/pdf',
        // HEAD the object first so a missing/inaccessible menu rejects here
        // (default get() only signs a url and never surfaces a bad key).
        validateObjectExistence: true,
      });
      setVenueMenuUrl(url);
      handlePresentModalPress();

      // Register venue group before event association
      if (user?.id) groupPostHogVenue(user.id, user?.venueName);

      capturePostHogEvent('venue_menu_view', {
        venue_id: user?.id,
        venue_name: user?.venueName,
      }, { venue: user?.id });
    } catch (error) {
      logger.error('Failed to open venue menu', error as Error);
      Alert.alert(
        'Menu Unavailable',
        "We couldn't open this menu right now. Please try again later."
      );
    }
  };
  const removeVenueMenu = async () => {
    mutateVenueMenu('');
    setDeleteVenueMenu(false);
  };
  const uploadMenuCallback = async () => {
    const uploadedMenu = await uploadFile();
    if (uploadedMenu) {
      const blob = await getBlob(uploadedMenu.uri);
      const venueMenuKey = createImageKey('menu', `${user?.venueName}.pdf`);

      Storage.put(venueMenuKey, blob, {
        contentType: 'application/pdf',
      });
      mutateVenueMenu(venueMenuKey);
    }
  };

  const goToFollowingFollowers = async (
    username?: string,
    openWith?: string
  ) => {
    if (username && openWith && userId) {
      navigation.navigate(Routes.FollowingFollowersList, {
        username,
        openWith,
        userId,
      });
    }
  };
  const goToNextScreen = async (route: any) => {
    navigation.navigate(route);
  };

  const goToEditProfile = () =>
    user?.userType === UserType.VENUE
      ? goToNextScreen('VenueProfileEdit')
      : goToNextScreen('PersonProfileEdit');

  useMemo(() => {
    const rewardsCompletedAndNotReedemed =
      userRewards?.items?.filter(
        (item: { isCompleted?: boolean; isRedeemed?: boolean }) => item?.isCompleted && !item?.isRedeemed
      ) ?? [];

    if (rewardsCompletedAndNotReedemed?.length || !user?.isOnRewards) {
      setRewardsMarker(true);
    } else {
      setRewardsMarker(false);
    }
  }, [userRewards, user?.isOnRewards]);

  return (
    <>
      <ResponsiveRow>
        <ProfilePicture
          image={user?.userType === UserType.BRAND ? (user?.brandLogoLoaded || user?.profilePictureLoaded) : user?.profilePictureLoaded}
          border
          disabled
        />
        <Column>
          <TitleWrapper>
            <Title size={18} mt={0} align="left" numberOfLines={2}>
              {user?.userType === UserType.BRAND ? user?.brandName :
                user?.venueName || `${user?.personFirstName} ${user?.personLastName}`}
            </Title>
          </TitleWrapper>
          <RowContainer>
            <Text>@{user?.username}</Text>
            {userId === sub && user?.userType !== UserType.BRAND && (
              <Link
                onPress={goToEditProfile}
                color="primary500"
                testID={getTestId('edit-profile')}
              >
                Edit Profile
              </Link>
            )}
          </RowContainer>
        </Column>

        {!!featureFlags?.rewards &&
          user?.userType === UserType.PERSON &&
          userId === sub ? (
          <RewardsContainer
            onPress={() => {
              if (featureFlags) {
                if (featureFlags?.rewardsFinished) {
                  setRewardsThankYouVisible(true);
                } else if (user?.isOnRewards) {
                  navigation.navigate(Routes.ActiveRewards);
                } else if (!user?.isOnRewards) {
                  setRewardsWelcomeVisible(true);
                }
              }
            }}
            testID={getTestId('reward')}
          >
            <RewardIconContainer
              source={rewardsMarker ? RewardIconMarker : RewardIcon}
            />
          </RewardsContainer>
        ) : (
          user && userId !== sub && (
            <ActionButtonsContainer>
              <FollowButton data={user} isFetching={isLoading} />
            </ActionButtonsContainer>
          )
        )}
        <RewardsWelcomeDialog
          visible={rewardsWelcomeVisible}
          onBackButtonPress={() => setRewardsWelcomeVisible(false)}
          isWelcomeBack={false}
        />
        <ThankYouDialog
          visible={rewardsThankYouVisible}
          onBackButtonPress={() => setRewardsThankYouVisible(false)}
        />
      </ResponsiveRow>

      {!user?.deleted && (
        (user?.userType === UserType.BRAND && user?.brandStory) || user?.bio
      ) && (
          <Text mh={24}>
            {user?.userType === UserType.BRAND ? (user?.brandStory || user?.bio) : user?.bio}
          </Text>
        )}
      {!isGuest && (
        <FollowInfoAndCheckin
          user={user as unknown as User}
          goToFollowingFollowers={(username, tab) =>
            goToFollowingFollowers(username, tab)
          }
          checkins={formatNumber(
            (user?.userType === UserType.VENUE
              ? user.venueCheckinsCount
              : myPosts &&
              myPosts.pages
                .flatMap((page) => page.items)
                .filter((post) => post.locationId).length) as number
          )}
          showRewards={
            userId === sub &&
            user?.userType === UserType.PERSON &&
            user?.isOnRewards!
          }
          goToRewards={() => navigation.navigate(Routes.ActiveRewards)}
        />
      )}
      {user?.userType === UserType.VENUE && !user?.deleted && (
        <VenueInfo>
          <Row>
            <Icon name="gps" color="primary" size={18} />
            <Text
              mh={6}
              onPress={() => openMap(user?.venueAddressGeo!, user?.venueName!)}
            >
              {capitalizeAll(
                `${user?.venueAddressStreet} - ${user?.venueAddressNumber}, ${user?.venueAddressCity}, ${user?.venueAddressState}`
              )}
            </Text>
          </Row>
          {user?.venuePhone && (
            <Row>
              <Icon name="phone" color="primary" size={18} />
              <Text
                mh={4}
                mv={6}
                onPress={() => {
                  openPhone(user?.venuePhone!.replace(' ', ''));
                }}
              >
                {user?.venuePhone}
              </Text>
              {user?.venueWebsite && (
                <Row style={{ marginLeft: 12 }}>
                  <Icon name="earth" color="primary" size={18} />
                  <Link
                    mh={6}
                    color="white"
                    onPress={() => Linking.openURL(user.venueWebsite!)}
                  >
                    {user.venueWebsite.replace(/^https?:\/\//, '')}
                  </Link>
                </Row>
              )}
            </Row>
          )}
          {user?.venueHours && (
            <Row>
              <Icon name="list" color="primary" size={12} />
              <Text mh={6}>{user.venueHours}</Text>
            </Row>
          )}
          {isLoadingUpdateMenu ? (
            <VenueMenu>
              <Row>
                <Icon name="download" color="primary" size={18} />
                <ActivityIndicator />
              </Row>
            </VenueMenu>
          ) : (
            <VenueMenu>
              {user?.venueMenu && user?.venueMenu.key ? (
                <>
                  <Row>
                    <Icon name="download" color="primary" size={18} />
                    <Link mh={6} color="white" onPress={downloadMenu}>
                      Full Menu
                    </Link>
                  </Row>
                  {!deleteVenueMenu ? (
                    userId === sub && (
                      <Row>
                        <Link
                          mh={4}
                          color="primary"
                          onPress={() => setDeleteVenueMenu(true)}
                          bold
                        >
                          Delete Menu
                        </Link>
                      </Row>
                    )
                  ) : (
                    <Row>
                      <Icon name="close" color="red" size={18} />
                      <Link mh={4} color="red" onPress={removeVenueMenu} bold>
                        Confirm Delete?
                      </Link>
                    </Row>
                  )}
                </>
              ) : (
                userId === sub && (
                  <Row>
                    <Icon name="download" color="primary" size={18} />
                    <Link
                      mh={4}
                      color="primary"
                      onPress={uploadMenuCallback}
                      bold
                    >
                      Upload Full Menu PDF
                    </Link>
                  </Row>
                )
              )}
            </VenueMenu>
          )}
        </VenueInfo>
      )}

      <OutsidePressHandler
        onOutsidePress={() => bottomSheetModalRef.current?.close()}
      >
        <MenuModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          // eslint-disable-next-line react/no-unstable-nested-components
          handleComponent={() => (
            <HandleContainer>
              <HandleBar />
            </HandleContainer>
          )}
        >
          <VenueMenuView source={{ uri: menuViewerUrl }} />
        </MenuModal>
      </OutsidePressHandler>
    </>
  );
};

export { ProfileSummary };
