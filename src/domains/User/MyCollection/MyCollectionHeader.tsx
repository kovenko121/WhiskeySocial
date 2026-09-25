import React from 'react';
import { ActivityIndicator } from 'react-native';

import {
  AbsoluteHeader,
  PopUpMenu,
  Title,
  FormattedTagFilter,
  Text,
} from '@components';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ImageUrl, NavigationProps, UserType,
  Routes
} from '@types';
import { useConversations } from '../../../hooks/messaging/useConversations';
import { ContentContainer, ResponsiveRow, CustomizeCollection } from './styles';

import {
  ProfileBackgroundPicture,
  ProfileSummary,
  UserTrendWhiskeys,
  UserCollection,
  UserWishList,
  BrandWhiskeysList,
} from '../components';

const MemoUserTrendWhiskeys = React.memo(UserTrendWhiskeys);
const MemoUserCollection = React.memo(UserCollection);
const MemoUserWishList = React.memo(UserWishList);
const MemoBrandWhiskeyList = React.memo(BrandWhiskeysList);

type Props = {
  userId: string;
  myUser: any;
  coverPicture: string | ImageUrl;
  isLoadingUpdateCover: boolean;
  showPopUpMenu: boolean;
  setShowPopUpMenu: (val: boolean) => void;
  setIsClosing: (val: boolean) => void;
  isClosing: boolean;
  options: any[];
  activitiesTags: string[];
  setActivitiesTags: (tags: string[]) => void;
  postsLength: number;
  refreshKey?: number;
};

// TODO: Using fragments here is bad, and WHY we have 2 different headers components is beyond me.
// We're going to need to refactor a ton of this code in the future.

const MyCollectionHeader = ({
  userId,
  myUser,
  coverPicture,
  isLoadingUpdateCover,
  showPopUpMenu,
  setShowPopUpMenu,
  setIsClosing,
  isClosing,
  options,
  activitiesTags,
  setActivitiesTags,
  postsLength,
  refreshKey,
}: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const { data: conversationsData, refetch: refetchConversations } = useConversations(userId);

  useFocusEffect(
    React.useCallback(() => {
      refetchConversations({ cancelRefetch: false });
    }, [refetchConversations])
  );

  const totalUnread = React.useMemo(() => {
    if (!conversationsData?.pages) return 0;
    return conversationsData.pages
      .flatMap((page) => page.items)
      .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }, [conversationsData]);

  return (
  <>
    <AbsoluteHeader
      actionIcon={options.length > 0 ? 'dot-menu-horizontal' : undefined}
      action={options.length > 0 ? () => {
        if (!isClosing) setShowPopUpMenu(!showPopUpMenu);
      } : undefined}
      secondaryActionIcon="message"
      secondaryAction={() => navigation.navigate(Routes.Messages)}
      secondaryActionBadgeCount={totalUnread}
    />

    {showPopUpMenu && options.length > 0 && (
      <PopUpMenu
        width={60}
        options={options}
        alignItems="bottom"
        paddingBottom={60}
        paddingLeft={95}
        setVisibleStatus={setShowPopUpMenu}
        setIsClosingStatus={setIsClosing}
        reverse
        showLoading={false}
      />
    )}

    <ProfileBackgroundPicture key={refreshKey} coverPicture={coverPicture}>
      {isLoadingUpdateCover ? (
        <ActivityIndicator />
      ) : (
        <CustomizeCollection>
          <Text>
            {!coverPicture
              ? 'Customize your collection by \n adding a picture of it.'
              : ''}
          </Text>
        </CustomizeCollection>
      )}
    </ProfileBackgroundPicture>

    <ContentContainer>
      <ProfileSummary userId={userId} />

      {myUser?.userType === UserType.BRAND && !myUser?.deleted && (
        <MemoBrandWhiskeyList userId={userId} />
      )}

      {myUser?.userType !== UserType.BRAND && (
        <>
          <MemoUserTrendWhiskeys userId={userId} />
          <MemoUserCollection userId={userId} />
          <MemoUserWishList userId={userId} />
        </>
      )}
    </ContentContainer>

    <ResponsiveRow>
      <Title size={18} mv={8}>
        {myUser?.userType === UserType.BRAND
          ? `${myUser?.brandName} Activities`
          : 'My Activities'}
      </Title>
    </ResponsiveRow>

    {myUser?.userType !== UserType.BRAND && postsLength > 0 && (
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
  );
};

export default React.memo(MyCollectionHeader);
