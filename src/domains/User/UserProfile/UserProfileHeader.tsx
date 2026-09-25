import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  AbsoluteHeader,
  Button,
  CreatePostModal,
  FormattedTagFilter,
  PopUpMenu,
  Text,
  Title,
} from '@components';
import { setApostrophe } from '@helpers';
import { useGuestGuard } from '@hooks';
import { DMPrivacySetting, UserType,
  Routes
} from '@types';
import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProps } from '@types';
import {
  ContentContainer,
  ResponsiveRow,
  BlockedUserMessageView,
} from './styles';
import { BrandVenuesList, BrandWhiskeysList, ClaimVenue, ProfileBackgroundPicture, ProfileSummary, UserCollection, UserTrendWhiskeys, UserWishList } from '../components';

const MemoUserTrendWhiskeys = React.memo(UserTrendWhiskeys);
const MemoUserCollection = React.memo(UserCollection);
const MemoUserWishList = React.memo(UserWishList);

type Props = {
  user: any;
  myUser: any;
  userId: string;
  isLoading: boolean;
  isUserBlocked?: boolean;
  createPostVisible: boolean;
  setCreatePostVisible: (val: boolean) => void;
  showPopUpMenu: boolean;
  setShowPopUpMenu: (val: boolean) => void;
  setIsClosing: (val: boolean) => void;
  isClosing: boolean;
  options: any[];
  wishlistRef: React.RefObject<View | null>;
  postsLength: number;
  activitiesTags: string[];
  setActivitiesTags: (tags: string[]) => void;
};

const UserProfileHeader = ({
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
  postsLength,
  activitiesTags,
  setActivitiesTags,
}: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const { user: authUser } = useAuth();
  const sub = authUser?.sub;
  const guardedCheckin = useGuestGuard('pour_log');

  const canSendMessage = useMemo(() => {
    if (!user || !sub || userId === sub) return false;
    if (myUser?.blockedUsers?.includes(userId)) return false;
    if (user?.blockedUsers?.includes(sub)) return false;
    const setting = user?.dmPrivacySetting;
    if (setting === DMPrivacySetting.NONE) return false;
    if (setting === DMPrivacySetting.FOLLOWING) {
      return !!user?.following?.find((id: string | null) => id === sub);
    }
    return !setting || setting === DMPrivacySetting.EVERYONE;
  }, [user, myUser, sub, userId]);

  const handleMessage = useCallback(() => {
    if (!sub) return;
    navigation.navigate(Routes.Conversation, {
      conversationId: '',
      recipientId: userId,
      recipientName: user?.username,
      recipientImage: user?.profilePictureLoaded,
    });
  }, [sub, userId, user, navigation]);

  const resolveOwnerName = () => {
    if (user?.userType === UserType.PERSON) return user?.personFirstName;
    if (user?.userType === UserType.BRAND) return user?.brandName;
    return user?.venueName;
  };

  return (
    <>
      <AbsoluteHeader
        actionIcon="dot-menu-horizontal"
        action={() => {
          if (!isClosing) setShowPopUpMenu(!showPopUpMenu);
        }}
        secondaryActionIcon={canSendMessage ? 'message' : undefined}
        secondaryAction={canSendMessage ? handleMessage : undefined}
      />

      <ProfileBackgroundPicture
        coverPicture={user?.deleted ? undefined : user?.coverPictureLoaded}
      >
        {isLoading ? <ActivityIndicator /> : <View />}
      </ProfileBackgroundPicture>

      {showPopUpMenu && (
        <PopUpMenu
          width={45}
          options={options}
          alignItems="bottom"
          paddingBottom={60}
          paddingLeft={125}
          setVisibleStatus={setShowPopUpMenu}
          setIsClosingStatus={setIsClosing}
          reverse
          showLoading={false}
        />
      )}

      <ContentContainer>
        <ProfileSummary userId={userId} />

        {!user?.deleted && !isUserBlocked && (
          <>
            {user?.userType === UserType.BRAND && (
              <>
                <BrandWhiskeysList userId={userId} />
                <BrandVenuesList user={user} />
              </>
            )}

            {user?.userType === UserType.VENUE && (
              <ResponsiveRow>
                <Button
                  label="Check-in"
                  variant="outlineDefault"
                  icon="gps"
                  onPress={() => guardedCheckin(() => setCreatePostVisible(true))}
                  full
                />
                <CreatePostModal
                  venueCheckin={user}
                  visible={createPostVisible}
                  onBackButtonPress={() => setCreatePostVisible(false)}
                />
              </ResponsiveRow>
            )}

            {user?.toBeRedeemed && user?.userType === UserType.VENUE ? (
              <ClaimVenue venueName={user.venueName!} userId={userId} />
            ) : (
              <>
                {user?.userType !== UserType.BRAND && (
                  <>
                    <MemoUserTrendWhiskeys userId={userId} />
                    <MemoUserCollection userId={userId} />
                    <View ref={wishlistRef}>
                      <MemoUserWishList userId={userId} />
                    </View>
                  </>
                )}

                <ResponsiveRow>
                  <Title size={18} mv={8}>
                    {userId === myUser?.sub
                      ? 'My Activities'
                      : `${setApostrophe(resolveOwnerName())} Activities`}
                  </Title>
                </ResponsiveRow>

                {user?.userType === UserType.PERSON && postsLength > 0 && (
                  <FormattedTagFilter
                    formattedTags={[
                      { value: 'check-in', name: 'venue' },
                      { value: 'drinking', name: 'drinking' },
                    ]}
                    selectedTags={activitiesTags}
                    setSelectedTags={setActivitiesTags}
                  />
                )}
              </>
            )}
          </>
        )}

        {isUserBlocked && (
          <BlockedUserMessageView>
            <Text align="center">
              You blocked this user.{'\n'}
              Revert the action to see their content again.
            </Text>
          </BlockedUserMessageView>
        )}
      </ContentContainer>
    </>
  );
};

export default React.memo(UserProfileHeader);
