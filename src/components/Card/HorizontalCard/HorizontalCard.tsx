import React, { useEffect, useState } from 'react';
import {
  capitalize,
  capitalizeAll,
  formatNumber,
  getFullDate,
  getFullWhiskeyName,
  getS3Image,
  getTestId,
  isIos,
} from '@helpers';
import { theme } from '@theme';
import type { ImageUrl, User, UserWhiskeys, Whiskey } from '@types';
import { S3Object, UserType, getProofDisplay } from '@types';
import type { ImageSourcePropType } from 'react-native';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { CalloutSubview } from 'react-native-maps';
import { DefaultTheme } from 'styled-components/native';
import { CrownIcon } from '../../CrownIcon/CrownIcon';
import { FavoriteButton } from '../../FavoriteButton/FavoriteButton';
import { FollowButton } from '../../FollowButton/FollowButton';
import { Icon } from '../../Icon/Icon';
import { Skeleton } from '../../Skeleton/Skeleton';
import { Tag } from '../../Tags/Tags';
import { SectionTitle, Text } from '../../Text/Text';
import {
  BrandBadge,
  PlaceholderPicture,
  CardBody,
  CardMenu,
  CardStack,
  CardStackAnchor,
  CheckinContainer,
  ChildrenSection,
  CrownContainer,
  CupWrapper,
  DeleteButton,
  DeleteButtonContainer,
  IconWrapper,
  MiniPicture,
  Picture,
  PourLogo,
  ProofWrapper,
  RatingContainer,
  Row,
  TextContainer,
  TitleContainer,
  TitleWrapper,
  VerifyContainer,
} from './styles';

export const HorizontalCard = ({
  testID,
  shadow = false,
  image,
  brand,
  children,
  mv = 4,
  textPV = 16,
  textPH = 18,
  picWidth = 120,
  onPress,
  menu = false,
  deleteButton = false,
  onDeleteButtonPress = () => {},
  small = false,
  border = false,
  backgroundColor,
  miniPicture = false,
  disabled = false,
  pour = false,
  stack = false,
  fixedHeight,
}: {
  shadow?: boolean;
  image?: S3Object | ImageSourcePropType | any;
  brand?: S3Object | ImageSourcePropType | any;
  children: React.JSX.Element;
  mv?: number;
  picWidth?: number;
  textPV?: number;
  textPH?: number;
  onPress?: () => void;
  menu?: boolean;
  deleteButton?: boolean;
  onDeleteButtonPress?: () => void;
  small?: boolean;
  border?: boolean;
  backgroundColor?: keyof DefaultTheme['colors'];
  miniPicture?: boolean;
  testID?: string;
  disabled?: boolean;
  pour?: boolean;
  stack?: boolean;
  callout?: boolean;
  fixedHeight?: number;
}) => {
  const [logo, setLogo] = useState<ImageUrl | ImageSourcePropType>();
  const [brandImage, setBrandImage] = useState<
    ImageUrl | ImageSourcePropType
  >();

  useEffect(() => {
    const setWhiskeyImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setLogo(img);
    };

    if (image?.bucket) {
      setWhiskeyImg(image);
    } else if (image?.uri || typeof image === 'number') {
      setLogo(image);
    }
  }, [image]);

  useEffect(() => {
    const setBrandImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setBrandImage(img);
    };

    if (brand?.bucket) {
      setBrandImg(brand);
    }
  }, [brand]);
  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : onPress}
      activeOpacity={disabled ? 1 : 0}
      testID={testID}
    >
      <CardBody
        mv={mv}
        shadow={shadow}
        picWidth={picWidth}
        small={small}
        border={border}
        backgroundColor={backgroundColor}
        fixedHeight={fixedHeight}
      >
        {(() => {
          if (logo) {
            return (
              <>
                {miniPicture && <MiniPicture source={logo} width={picWidth} />}
                {!miniPicture && <Picture source={logo} width={picWidth} />}
              </>
            );
          }
          if (image != null) {
            return (
              <Skeleton
                width={theme.metrics.px(picWidth)}
                height={theme.metrics.px(picWidth)}
                radius={10}
              />
            );
          }
          return <PlaceholderPicture width={picWidth} />;
        })()}
        {brand && brandImage && <BrandBadge source={brandImage} />}
        {pour && (
          <PourLogo>
            <Icon name="pour" size={20} color="white" />
          </PourLogo>
        )}
        <TextContainer pv={textPV} ph={textPH}>
          {children}
        </TextContainer>
        {menu && (
          <CardMenu pv={textPV} ph={textPH}>
            <TouchableOpacity>
              <Icon name="dot-menu-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </CardMenu>
        )}
        {deleteButton && (
          <DeleteButtonContainer>
            <DeleteButton onPress={onDeleteButtonPress}>
              <Icon color="white" size={16} name="close" />
            </DeleteButton>
          </DeleteButtonContainer>
        )}
      </CardBody>
      {stack && (
        <CardStackAnchor mv={mv}>
          <CardStack
            shadow={shadow}
            small={small}
            border={border}
            backgroundColor={backgroundColor}
          />
        </CardStackAnchor>
      )}
    </TouchableOpacity>
  );
};

export const HorizontalWhiskeyCard = React.memo(({
  whiskey,
  onPress = () => {},
  shadow = false,
  mv = 4,
  menu = false,
  deleteButton,
  onDeleteButtonPress = () => {},
  selected = false,
  children,
  pour = false,
}: {
  whiskey?: Whiskey;
  onPress?: (item: Whiskey) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  deleteButton?: boolean;
  onDeleteButtonPress?: () => void;
  selected?: boolean;
  children?: React.JSX.Element;
  pour?: boolean;
}) => {
  if (!whiskey) {
    return (
      <HorizontalCard
        shadow={shadow}
        mv={mv}
        menu={menu}
        deleteButton={deleteButton}
        onDeleteButtonPress={onDeleteButtonPress}
        textPH={12}
      >
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      image={whiskey.picture}
      brand={whiskey.brandUser?.brandLogo}
      onPress={() => onPress(whiskey)}
      shadow={shadow}
      mv={mv}
      menu={menu}
      deleteButton={deleteButton}
      onDeleteButtonPress={onDeleteButtonPress}
      border={selected}
      textPH={12}
      textPV={8}
      testID={getTestId(getFullWhiskeyName(whiskey))}
      pour={pour}
    >
      <>
        <SectionTitle bold size={15} lineHeight={22} numberOfLines={5} mb={6}>
          {getFullWhiskeyName(whiskey)}
        </SectionTitle>

        <ChildrenSection>
          {!!whiskey?.type?.[0] && (
            <Tag text={capitalize(whiskey.type[0])} ellipsis />
          )}
          {children}
          {!children && !!whiskey.calculatedRating && (
            <RatingContainer>
              <CrownIcon size={12} color="warning" />
              <Text size={14}>{whiskey.calculatedRating}</Text>
            </RatingContainer>
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
});

export const HorizontalUserCard = ({
  user,
  distance,
  shadow = false,
  onPress = () => {},
  mv = 4,
  menu = false,
  deleteButton = false,
  followButton = true,
  unfollowButton = false,
  checkinButton = false,
  small = false,
  onDeleteButtonPress = () => {},
  checkinOnPress = () => {},
  disabled = false,
  callout = false,
  fixedHeight,
}: {
  user?: User;
  onPress?: (item: User) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  deleteButton?: boolean;
  followButton?: boolean;
  unfollowButton?: boolean;
  checkinButton?: boolean;
  small?: boolean;
  distance?: string;
  onDeleteButtonPress?: () => void;
  checkinOnPress?: () => void;
  disabled?: boolean;
  callout?: boolean;
  fixedHeight?: number;
}) => {
  const [followersCount, setFollowersCount] = useState<number>(
    user && user.followers ? user.followers?.length : 0
  );

  const venueAddress = () => {
    if (user?.userType === UserType.VENUE) {
      if (user?.username) {
        return capitalizeAll(
          `${user.venueAddressStreet}, ${user.venueAddressCity}, ${user.venueAddressState}`
        );
      }
      return capitalizeAll(`${user.venueAddressStreet}`);
    }
    return `@${user?.username}`;
  };

  if (!user) {
    return (
      <HorizontalCard
        picWidth={120}
        shadow={shadow}
        mv={mv}
        menu={menu}
        deleteButton={deleteButton}
        onDeleteButtonPress={onDeleteButtonPress}
        textPH={8}
        small={small}
        disabled={disabled}
        fixedHeight={fixedHeight}
      >
        <>
          <Skeleton width={small ? 70 : 175} height={small ? 10 : 32} />
          <ChildrenSection>
            <Skeleton width={small ? 30 : 60} height={small ? 10 : 28} />
            <Skeleton width={small ? 30 : 60} height={small ? 10 : 28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      picWidth={small ? 110 : 120}
      textPV={8}
      image={user.userType === UserType.BRAND ? user.brandLogo : user.profilePicture}
      onPress={() => {
        if (!user?.deleted) onPress(user);
      }}
      shadow={shadow}
      mv={mv}
      menu={menu}
      deleteButton={deleteButton}
      onDeleteButtonPress={onDeleteButtonPress}
      textPH={12}
      small={small}
      disabled={disabled}
      callout={callout}
      fixedHeight={fixedHeight}
      testID={`${user.username}`}
    >
      <>
        <TitleContainer>
          <SectionTitle
            bold
            size={small ? 12 : 15}
            numberOfLines={2}
            lineHeight={small ? 18 : undefined}
          >
            {(() => {
              if (user.userType === UserType.PERSON) {
                return `${user.personFirstName} ${user.personLastName}`;
              }
              if (user.userType === UserType.BRAND) {
                return `${user.brandName}`;
              }
              return `${user.venueName}`;
            })()}
          </SectionTitle>
          <ChildrenSection>
            <Text size={11} numberOfLines={fixedHeight ? 1 : undefined}>
              {venueAddress()}
            </Text>
          </ChildrenSection>
        </TitleContainer>
        <ChildrenSection>
          {(() => {
            if (distance)
              return (
                <CrownContainer>
                  {!!user.username && (
                    <Icon name="ws-venue" size={20} color="primary" />
                  )}
                  {!user.username && (
                    <Icon name="google" size={16} color="grey70" />
                  )}
                  <Text>{distance}</Text>
                </CrownContainer>
              );
            if (user.userType === UserType.PERSON) {
              return (
                <Text size={14}>
                  {formatNumber(followersCount)}{' '}
                  {followersCount === 1 ? 'Follower' : 'Followers'}
                </Text>
              );
            }
            return <RatingContainer />;
          })()}
          {followButton && (
            <FollowButton
              data={user}
              isFetching={false}
              icon
              onFollowStatusChange={(isFollowing) => {
                setFollowersCount(
                  isFollowing ? followersCount + 1 : followersCount - 1
                );
              }}
            />
          )}
          {unfollowButton && (
            <FollowButton
              data={user}
              isFetching={false}
              icon
              onFollowStatusChange={(isFollowing) => {
                setFollowersCount(
                  isFollowing ? followersCount + 1 : followersCount - 1
                );
              }}
              unfollowOnly
            />
          )}

          {checkinButton && (
            <CheckinContainer>
              {user.username && !distance && (
                <VerifyContainer>
                  <Icon name="ws-venue" size={24} color="primary" />
                </VerifyContainer>
              )}
              {!user.username && !distance && (
                <VerifyContainer>
                  <Icon name="google" size={18} color="grey70" />
                </VerifyContainer>
              )}
              {(() => {
                const checkinTag = <Tag text="Check-in" icon={small ? '' : 'gps'} />;

                // callout subview is ios only
                if (callout && isIos) {
                  return (
                    <CalloutSubview
                      onPress={checkinOnPress}
                      testID={getTestId('check-in-button')}
                    >
                      <TouchableOpacity>{checkinTag}</TouchableOpacity>
                    </CalloutSubview>
                  );
                }

                return (
                  <TouchableOpacity
                    onPress={checkinOnPress}
                    testID={getTestId('check-in-button')}
                  >
                    {checkinTag}
                  </TouchableOpacity>
                );
              })()}
            </CheckinContainer>
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
};

export const HorizontalGuideCard = React.memo(({
  article,
  onPress = () => {},
  shadow = false,
  mv = 4,
  menu = false,
  deleteButton,
  onDeleteButtonPress = () => {},
  selected = false,
}: {
  article?: any;
  onPress?: (id: string) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  deleteButton?: boolean;
  onDeleteButtonPress?: () => void;
  selected?: boolean;
}) => {
  if (!article) {
    return (
      <HorizontalCard
        shadow={shadow}
        mv={mv}
        menu={menu}
        deleteButton={deleteButton}
        onDeleteButtonPress={onDeleteButtonPress}
        textPH={12}
      >
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      image={article.coverPhoto}
      onPress={() => onPress(article.id)}
      shadow={shadow}
      mv={mv}
      menu={menu}
      deleteButton={deleteButton}
      onDeleteButtonPress={onDeleteButtonPress}
      border={selected}
      textPH={12}
    >
      <>
        <SectionTitle bold size={15} numberOfLines={2}>
          {article.title}
        </SectionTitle>
        <ChildrenSection>
          <FavoriteButton guideId={article.id} />

          {article.tag && <Tag text={capitalize(article.tag)} />}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
});

export const HorizontalBottleCard = ({
  bottle,
  onPress = () => {},
  shadow = false,
  mv = 4,
  menu = false,
  onDeleteButtonPress = () => {},
  selected = false,
  backgroundColor,
  showTypeTag = true,
}: {
  bottle?: any;
  onPress?: (item: Whiskey) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  onDeleteButtonPress?: () => void | Promise<void>;
  selected?: boolean;
  backgroundColor?: keyof DefaultTheme['colors'];
  showTypeTag?: boolean;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePress = async () => {
    setIsDeleting(true);
    try {
      await onDeleteButtonPress();
    } catch {
      // caller handles errors (e.g. mutation onError shows an alert)
    } finally {
      setIsDeleting(false);
    }
  };

  if (!bottle) {
    return (
      <HorizontalCard
        shadow={shadow}
        mv={mv}
        menu={menu}
        onDeleteButtonPress={onDeleteButtonPress}
        textPH={12}
      >
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      image={bottle.whiskey.picture}
      onPress={() => onPress(bottle.whiskey)}
      shadow={shadow}
      mv={mv}
      menu={menu}
      border={selected}
      textPH={12}
      backgroundColor={backgroundColor}
    >
      <>
        <Row>
          <TitleWrapper>
            <SectionTitle bold size={15} numberOfLines={2}>
              {getFullWhiskeyName(bottle.whiskey)}
            </SectionTitle>
          </TitleWrapper>
          <IconWrapper onPress={handleDeletePress}>
            {isDeleting && <ActivityIndicator />}
            {!isDeleting && <Icon name="trash" size={20} color="white" />}
          </IconWrapper>
        </Row>
        <ChildrenSection>
          <ProofWrapper>
            {(() => {
              const proofDisplay = getProofDisplay(bottle);
              return proofDisplay && <Text size={14}>{proofDisplay}</Text>;
            })()}
          </ProofWrapper>
          {showTypeTag && !!bottle?.whiskey?.type?.[0] && (
            <Tag
              text={capitalize(bottle.whiskey.type[0])}
              borderColor="white"
              ellipsis
            />
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
};

export const HorizontalCollectionWhiskeyCard = React.memo(({
  whiskey,
  onPress = () => {},
  shadow = false,
  mv = 4,
  selected = false,
  backgroundColor,
  pour = false,
}: {
  whiskey?: UserWhiskeys;
  onPress?: (item: UserWhiskeys) => any;
  shadow?: boolean;
  mv?: number;
  selected?: boolean;
  backgroundColor?: keyof DefaultTheme['colors'];
  pour?: boolean;
}) => {
  if (!whiskey?.whiskey) {
    return (
      <HorizontalCard shadow={shadow} mv={mv} picWidth={88}>
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      image={whiskey.whiskey.picture}
      brand={whiskey.whiskey.brandUser?.brandLogo}
      onPress={() => onPress(whiskey)}
      shadow={shadow}
      mv={mv}
      border={selected}
      backgroundColor={backgroundColor}
      picWidth={88}
      textPH={8}
      textPV={4}
      miniPicture
      pour={pour}
    >
      <>
        <Row>
          <TitleWrapper width={200}>
            <SectionTitle bold size={14} numberOfLines={2}>
              {getFullWhiskeyName(whiskey.whiskey)}
            </SectionTitle>
          </TitleWrapper>
        </Row>
        <ChildrenSection>
          <RatingContainer>
            {(() => {
              const proofDisplay = getProofDisplay(whiskey.whiskey!);
              return proofDisplay && <Text size={14}>{proofDisplay}</Text>;
            })()}
          </RatingContainer>
          {!!whiskey.whiskey?.type?.[0] && (
            <Tag
              text={capitalize(whiskey.whiskey.type[0])}
              borderColor="white"
            />
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
});

export const HorizontalPoursCard = ({
  pour,
  onPress = () => {},
  shadow = false,
  mv = 4,
  menu = false,
  selected = false,
  stack = false,
  counter = 0,
}: {
  pour?: any;
  onPress?: (item: Whiskey) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  selected?: boolean;
  stack?: boolean;
  counter?: number;
}) => {
  if (!pour) {
    return (
      <HorizontalCard shadow={shadow} mv={mv} menu={menu} textPH={12}>
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  return (
    <HorizontalCard
      image={pour?.whiskey?.picture}
      onPress={() => onPress(pour?.whiskey)}
      shadow={shadow}
      mv={mv}
      menu={menu}
      border={selected}
      textPH={12}
      backgroundColor="grey400"
      stack={stack}
      testID={getTestId(getFullWhiskeyName(pour?.whiskey))}
    >
      <>
        <Row>
          <TitleWrapper width={180}>
            <SectionTitle bold size={15} numberOfLines={1}>
              {getFullWhiskeyName(pour?.whiskey)}
            </SectionTitle>
            {!stack && (
              <Text size={12}>Poured on {getFullDate(pour.createdAt)}</Text>
            )}
          </TitleWrapper>
        </Row>
        <ChildrenSection>
          <CupWrapper>
            {stack && (
              <>
                <Icon name="pour" size={24} color="primary" />
                <Text size={14}>{counter}</Text>
              </>
            )}
          </CupWrapper>
          {!!pour?.whiskey?.type?.[0] && (
            <Tag
              text={capitalize(pour?.whiskey?.type[0])}
              borderColor="white"
            />
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
};
