import {
  AbsoluteHeader,
  Button,
  CreatePostModal,
  CrownIcon,
  HorizontalUserCard,
  Icon,
  Link,
  MaskedImage,
  ReviewCard,
  Skeleton,
  Tag,
  Text,
  Title,
  useAdminQRCode,
} from '@components';
import { useAuth, useLocation } from '@contexts';
import {
  capitalizeAll,
  createShareLink,
  getFullWhiskeyName,
  navigateUserProfile,
} from '@helpers';
import {
  useAddWhiskeyToMyCollection,
  useAddWhiskeyToWishlist,
  useArchiveVenueBottle,
  useGetUser,
  useGuestGuard,
  useHadPouredThisWhiskey,
  useIsAppAdmin,
  useListUserWhiskeys,
  useRemoveWhiskeyFromMyCollection,
  useRemoveWhiskeyFromWishlist,
  useWhiskey,
  useWhiskeysByGeoPoint,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams, User, Whiskey } from '@types';
import { UserType, getProofDisplay, Routes } from '@types';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Share, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Awards } from './components';
import { capturePostHogEvent, groupPostHogBrand } from '../../../config/posthog';
import {
  ButtonContainer,
  ButtonsContainer,
  CharacteristicsDescription,
  CharacteristicsRow,
  CharacteristicsTitle,
  ContentContainer,
  Divider,
  Empty,
  LinkContainer,
  PourLogo,
  RatingContainer,
  ReviewContainer,
  ScreenContainer,
  ScreenFlatList,
  StatusBar,
  TagsContainer,
  TitleContainer,
  TitleSection,
  WhereToFindContainer,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'WhiskeyInfo'>;

const WhiskeyInfoScreen = ({ navigation, route }: Props) => {
  const {
    user: { sub },
  } = useAuth();
  const { location, error } = useLocation();
  const { data: myUser } = useGetUser();
  const {
    data: userWhiskey,
    isLoading: isLoadingUserWhiskey,
    refetch: refetchUserWhiskey,
  } = useListUserWhiskeys(route.params.id);
  const bottle = userWhiskey?.items?.[0];

  // Shown when the collection buttons are tapped but the per-bottle query
  // hasn't produced a record (fetch error, or it diverged from `myUser`).
  // Gives the user a reason + a retry instead of a dead disabled button.
  const alertBottleUnavailable = () => {
    Alert.alert(
      "Couldn't load this bottle",
      'We had trouble loading this bottle from your collection. Please try again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => refetchUserWhiskey() },
      ]
    );
  };
  const { mutate: removeUserWhiskey, isPending: isRemoving } =
    useRemoveWhiskeyFromMyCollection(
      myUser?.userType === UserType.VENUE ? 'MyCollection' : undefined
    );
  const { mutate: archiveBottle, isPending: isArchiving } = useArchiveVenueBottle();
  const { mutate: addWhiskey, isPending: isAdding } =
    useAddWhiskeyToMyCollection();
  const { data: whiskey, isFetching: isFetchingWhiskey } = useWhiskey(
    route.params.id
  );
  const { data: venuesToFind, isLoading: isLoadingVenuesToFind } =
    useWhiskeysByGeoPoint(route.params.id, location);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<User | undefined>();
  const [pourWhiskey, setPourWhiskey] = useState<Whiskey | undefined>();
  const isAppAdmin = useIsAppAdmin();
  const guardedCheckin = useGuestGuard('pour_log');

  // QR title — computed before the hook that consumes it
  let whiskeyQrTitle = 'Whiskey QR Code';
  if (whiskey?.name) {
    let brandPrefix = '';
    if (whiskey.brandUser?.brandName) {
      brandPrefix = `${whiskey.brandUser.brandName} - `;
    }
    whiskeyQrTitle = `${brandPrefix}${whiskey.name}`;
  }

  const { showQRCode, QRModal } = useAdminQRCode({
    type: 'whiskey',
    id: route.params.id,
    title: whiskeyQrTitle,
  });

  useEffect(() => {
    if (whiskey && !isFetchingWhiskey) {
      const brandName = whiskey.brandUser?.brandName ?? '';
      if (whiskey.brandUser?.id) {
        groupPostHogBrand(whiskey.brandUser.id, brandName);
      }
      capturePostHogEvent('bottle_view', {
        bottle_id: whiskey.id,
        brand_id: whiskey.brandUser?.id,
        bottle_name: whiskey.name,
        brand_name: brandName,
      }, { brand: whiskey.brandUser?.id });
    }
  }, [whiskey, isFetchingWhiskey]);

  const scrollRef = useAnimatedRef<FlatList>();
  const reviewRef = useRef<View | null>(null);

  const removeWhiskeyFromMyCollection = async () => {
    if (!bottle) {
      alertBottleUnavailable();
      return;
    }
    removeUserWhiskey(bottle);
  };

  const goToBottleDetailsForm = async () => {
    navigation.navigate(Routes.BottleDetailsForm, { whiskey });
  };

  const handleShare = async () => {
    const url = createShareLink({
      type: 'whiskey',
      id: whiskey!.id,
    });
    Share.share({
      message: `Look at ${whiskey!.name!} on Whiskey Social\n${url}`,
    });
  };

  const { mutate: addToWishlist, isPending: addingToWishlist } =
    useAddWhiskeyToWishlist();

  const { mutate: removeFromWishlist, isPending: removingFromWishlist } =
    useRemoveWhiskeyFromWishlist();

  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const deleteWhiskeyFromWishlist = async () => {
    removeFromWishlist({ whiskeyId: route.params.id });
  };

  const handleCheckin = (item: User) => {
    guardedCheckin(() => {
      setSelectedVenue(item);
      setCreatePostVisible(true);
    });
  };

  const handleLogPour = () => {
    setPourWhiskey(
      whiskey ? { ...whiskey, fullName: getFullWhiskeyName(whiskey) } : undefined
    );
    setCreatePostVisible(true);
  };

  const closeCreatePost = () => {
    setCreatePostVisible(false);
    setSelectedVenue(undefined);
    setPourWhiskey(undefined);
  };

  const openLocationSettings = () => {
    Linking.openSettings();
  };

  const insets = useSafeAreaInsets();

  // --- Computed state ---
  const isPersonUser = myUser?.userType === UserType.PERSON;
  const isVenueUser = myUser?.userType === UserType.VENUE;
  const isArchived = !!bottle?.archived;
  const whiskeyProofDisplay = getProofDisplay(whiskey);
  const isInWishlist = myUser?.wishList?.items?.some(
    (item) => item?.whiskey?.id === route.params.id
  ) ?? false;
  const isInCollection = myUser?.whiskeys?.items?.some(
    (item) => item?.whiskey?.id === route.params.id
  ) ?? false;
  const nearbyVenues =
    venuesToFind?.pages
      ?.flatMap((page) => page.items)
      .filter(
        (item): item is { user: User } =>
          !!item.user?.id && item.user.id !== sub
      ) ?? [];
  const hasNearbyVenues =
    !!location && !isLoadingVenuesToFind && nearbyVenues.length > 0;
  // With location on, a settled search with no venues hides the whole section
  // rather than leaving a header over an empty state.
  const showWhereToFind = hasNearbyVenues || !location || !!error;

  // --- JSX variables ---

  let buttonWidth = 49;
  if (isInCollection) {
    buttonWidth = 83;
  }

  let secondaryActionIcon: 'qr-code' | undefined;
  let secondaryAction: (() => void) | undefined;
  if (isAppAdmin) {
    secondaryActionIcon = 'qr-code';
    secondaryAction = showQRCode;
  }

  let whiskeyImageSource = whiskey?.picture;
  if (isFetchingWhiskey) {
    whiskeyImageSource = undefined;
  }

  let wishlistButton = (
    <Button
      label="+ Wishlist"
      iconSize={18}
      icon="wishlist"
      variant="outlineDefault"
      center
      onPress={() => addToWishlist({ whiskeyId: route.params.id })}
      mv={4}
      ph={0}
      loading={addingToWishlist}
    />
  );
  if (isInWishlist) {
    wishlistButton = (
      <Button
        label="- Wishlist"
        iconSize={18}
        icon="trash"
        variant="outlineRedTextWhite"
        center
        onPress={deleteWhiskeyFromWishlist}
        mv={4}
        loading={removingFromWishlist}
      />
    );
  }

  let collectionButton = (
    <ButtonContainer>
      <Button
        label="+ My Collection"
        ph={6}
        icon="wine"
        iconSize={18}
        variant="outlineDefault"
        onPress={goToBottleDetailsForm}
      />
    </ButtonContainer>
  );
  if (isInCollection) {
    collectionButton = (
      <ButtonContainer width={15}>
        <Button
          label=" +"
          icon="wine"
          iconSize={20}
          ph={0}
          iconSpacing={false}
          variant="outlineDefault"
          onPress={goToBottleDetailsForm}
          loading={isRemoving}
        />
      </ButtonContainer>
    );
  }

  let venueMenuButton = (
    <Button
      label="Add to Menu"
      icon="table"
      iconSize={18}
      variant="outlineDefault"
      loading={isAdding}
      onPress={() => addWhiskey({ whiskeyId: route.params.id })}
    />
  );
  if (isInCollection) {
    venueMenuButton = (
      <ButtonsContainer>
        <ButtonContainer width={49}>
          <Button
            label="Remove from Menu"
            icon="trash"
            iconSize={18}
            variant="outlineRedTextWhite"
            onPress={removeWhiskeyFromMyCollection}
            loading={isRemoving || isLoadingUserWhiskey}
          />
        </ButtonContainer>
        <ButtonContainer width={49}>
          <Button
            label={isArchived ? 'Unarchive' : 'Archive'}
            icon={isArchived ? 'eye-on' : 'eye-off'}
            iconSize={18}
            variant={isArchived ? 'outlineDefault' : 'outlineDefault'}
            onPress={() => {
              if (!bottle) {
                alertBottleUnavailable();
                return;
              }
              archiveBottle({
                bottleId: bottle.id,
                archived: !isArchived,
              });
            }}
            loading={isArchiving || isLoadingUserWhiskey}
          />
        </ButtonContainer>
      </ButtonsContainer>
    );
  }

  let brandDisplay = <Text size={14}>{whiskey?.brandUser?.brandName}</Text>;
  if (whiskey?.brandUser && whiskey.brandUser.userType === UserType.BRAND) {
    brandDisplay = (
      <TouchableOpacity
        onPress={() => navigateUserProfile(whiskey.brandUser!.id, sub, navigation)}
      >
        <Text size={14} color="primary500">{whiskey.brandUser.brandName}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScreenFlatList
        ref={scrollRef}
        scrollEventThrottle={60}
        ListHeaderComponent={
          <>
            <WhiskeyImageContainer>
              <AbsoluteHeader
                actionIcon="share"
                action={handleShare}
                secondaryActionIcon={secondaryActionIcon}
                secondaryAction={secondaryAction}
              />
              <WhiskeyImage source={whiskeyImageSource} />
              {checkIfUserPoured(whiskey?.id) && (
                <PourLogo>
                  <Icon name="pour" size={20} color="white" />
                </PourLogo>
              )}
            </WhiskeyImageContainer>
            <ContentContainer>
              {isFetchingWhiskey && (
                <>
                  <TagsContainer>
                    <Skeleton width={100} height={40} radius={40} />
                    <Empty />
                  </TagsContainer>
                  <TitleSection>
                    <Skeleton width="100%" height={80} />
                  </TitleSection>
                  <RatingContainer>
                    <CrownIcon size={16} color="grey300" />
                    <Skeleton width={30} height={20} />
                    <CrownIcon size={16} color="grey300" />
                    <Skeleton width={30} height={20} />
                  </RatingContainer>
                  <ButtonsContainer>
                    <ButtonContainer width={49}>
                      <Skeleton width="100%" height={50} radius={40} />
                    </ButtonContainer>
                    <ButtonContainer width={49}>
                      <Skeleton width="100%" height={50} radius={40} />
                    </ButtonContainer>
                  </ButtonsContainer>
                  <Skeleton width={80} height={30} />
                  <ButtonsContainer />
                  <Skeleton width="100%" height={120} />
                  <ButtonsContainer />
                  <Skeleton width={80} height={30} />
                  <ButtonsContainer />
                  <Skeleton width="100%" height={120} />
                </>
              )}
              {!isFetchingWhiskey && (
                <>
                  <TagsContainer>
                    {whiskey?.starterPick && (
                      <Tag
                        selected
                        backgroundColor="primary500"
                        text="Starter Pick Selection"
                      />
                    )}
                    {whiskey?.specialistChoice && (
                      <TouchableOpacity
                        disabled={!whiskey?.specialistReview}
                        onPress={() =>
                          reviewRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
                            scrollRef.current?.scrollToOffset({
                              offset: pageY + 1100,
                              animated: true,
                            });
                          })
                        }
                      >
                        <Tag
                          icon="specialist"
                          selected
                          backgroundColor="primary500"
                          text="Specialist's Choice"
                        />
                      </TouchableOpacity>
                    )}
                  </TagsContainer>

                  <TitleSection>
                    <Title
                      style={{ lineHeight: 40 }}
                      align="center"
                      color="primary500"
                      size={27}
                    >
                      {getFullWhiskeyName(whiskey!)}
                    </Title>
                  </TitleSection>

                  {!!whiskey?.calculatedRating && (
                    <RatingContainer>
                      <CrownIcon size={16} color="primary500" />
                      <Text size={15} mr={6}>
                        {whiskey?.calculatedRating}
                      </Text>
                      {!!whiskey?.myReview?.rating && (
                        <>
                          <MaskedImage img={myUser?.profilePictureLoaded} />
                          <Text size={14}>{whiskey.myReview.rating}</Text>
                        </>
                      )}
                    </RatingContainer>
                  )}

                  {isPersonUser && (
                    <>
                      <ButtonsContainer>
                        <ButtonContainer width={100}>
                          <Button
                            label="Log a Pour"
                            icon="pour"
                            iconSize={18}
                            variant="default"
                            onPress={handleLogPour}
                            testID="log-a-pour"
                          />
                        </ButtonContainer>
                      </ButtonsContainer>
                      <ButtonsContainer>
                        <ButtonContainer width={buttonWidth}>
                          {wishlistButton}
                        </ButtonContainer>
                        {collectionButton}
                      </ButtonsContainer>
                    </>
                  )}
                  {isVenueUser && (
                    isInCollection ? venueMenuButton : (
                      <ButtonsContainer>
                        <ButtonContainer width={100}>
                          {venueMenuButton}
                        </ButtonContainer>
                      </ButtonsContainer>
                    )
                  )}

                  <Title size={18} align="left">
                    About
                  </Title>

                  <Text size={14} align="justify" mv={16}>
                    {whiskey?.description}
                  </Text>

                  {whiskey?.distilleryTastingNotes && (
                    <>
                      <Title size={18} align="left" mt={16}>
                        Distillery Tasting Notes
                      </Title>
                      <Text size={14} align="justify" mv={16}>
                        {whiskey.distilleryTastingNotes}
                      </Text>
                    </>
                  )}

                  {whiskey && (
                    <>
                      <Title mb={12} mt={24} size={18} align="left">
                        Characteristics
                      </Title>
                      <CharacteristicsRow>
                        <CharacteristicsTitle>
                          <Text size={14} bold>
                            Name
                          </Text>
                        </CharacteristicsTitle>
                        <CharacteristicsDescription>
                          <Text size={14}>{whiskey.name}</Text>
                        </CharacteristicsDescription>
                      </CharacteristicsRow>
                      <Divider />
                      {whiskey.brandUser?.brandName && (
                        <CharacteristicsRow>
                          <CharacteristicsTitle>
                            <Text size={14} bold>
                              Brand
                            </Text>
                          </CharacteristicsTitle>
                          <CharacteristicsDescription>
                            {brandDisplay}
                          </CharacteristicsDescription>
                        </CharacteristicsRow>
                      )}
                      <Divider />
                      {!!whiskeyProofDisplay && (
                        <>
                          <CharacteristicsRow>
                            <CharacteristicsTitle>
                              <Text size={14} bold>
                                Proof
                              </Text>
                            </CharacteristicsTitle>
                            <CharacteristicsDescription>
                              <Text size={14}>{whiskeyProofDisplay} </Text>
                            </CharacteristicsDescription>
                          </CharacteristicsRow>
                          <Divider />
                        </>
                      )}
                      {whiskey.age && (
                        <>
                          <CharacteristicsRow>
                            <CharacteristicsTitle>
                              <Text size={14} bold>
                                Years
                              </Text>
                            </CharacteristicsTitle>
                            <CharacteristicsDescription>
                              <Text size={14}>{whiskey.age} </Text>
                            </CharacteristicsDescription>
                          </CharacteristicsRow>
                          <Divider />
                        </>
                      )}
                      {!!whiskey.type?.[0] && (
                        <>
                          <CharacteristicsRow>
                            <CharacteristicsTitle>
                              <Text size={14} bold>
                                Type
                              </Text>
                            </CharacteristicsTitle>
                            <CharacteristicsDescription>
                              <Text size={14}>
                                {capitalizeAll(
                                  whiskey.type[0].split('_').join(' ')
                                )}{' '}
                              </Text>
                            </CharacteristicsDescription>
                          </CharacteristicsRow>
                          <Divider />
                        </>
                      )}
                    </>
                  )}
                  {showWhereToFind && (
                    <>
                      <WhereToFindContainer>
                        <Title size={18}>Where to find?</Title>
                        {!!error && (
                          <LinkContainer onPress={openLocationSettings}>
                            <Icon name="gear" size={16} color="primary500" />
                            <Link color="primary500">Location settings</Link>
                          </LinkContainer>
                        )}
                      </WhereToFindContainer>
                      {hasNearbyVenues && (
                        <FlatList
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          data={nearbyVenues}
                          renderItem={({ item }: { item: { user: User } }) => (
                            <HorizontalUserCard
                              user={item.user}
                              followButton={false}
                              onPress={() =>
                                navigateUserProfile(
                                  item.user?.id,
                                  sub,
                                  navigation
                                )
                              }
                              checkinOnPress={() => handleCheckin(item.user)}
                              checkinButton
                            />
                          )}
                        />
                      )}
                      {!hasNearbyVenues && (
                        <Text size={12} mv={50} align="center">
                          Turn on your location to see nearby venues.
                        </Text>
                      )}
                    </>
                  )}
                  {whiskey?.awards && whiskey?.awards.length > 0 && (
                    <Awards data={whiskey.awards} />
                  )}
                  {whiskey?.specialistReview && (
                    <View ref={reviewRef}>
                      <TitleContainer>
                        <Icon
                          name="specialist"
                          size={28}
                          color="primary500"
                        />
                        <Title size={18} mb={6} align="left">
                          Specialist's Review
                        </Title>
                      </TitleContainer>

                      <ReviewCard
                        backgroundColor="primary700"
                        footerColor="white"
                        tagColor="grey400"
                        descriptionColor="white"
                        key={whiskey.specialistReview?.id}
                        data={whiskey.specialistReview}
                      />

                      {whiskey.reviews?.items &&
                        whiskey.reviews?.items.length > 0 && (
                          <Divider style={{ marginBottom: 20 }} />
                        )}
                    </View>
                  )}
                  {whiskey?.reviews?.items &&
                    whiskey?.reviews?.items.length > 0 && (
                      <Title mb={18} mt={24} size={18} align="left">
                        Reviews
                      </Title>
                    )}
                  {whiskey?.myReview && (
                    <>
                      <ReviewCard
                        key={whiskey?.myReview?.id}
                        data={whiskey.myReview}
                      />
                      <Button
                        label="Edit My Review"
                        variant="outlineDefault"
                        mv={8}
                        onPress={() =>
                          navigation.navigate(Routes.ReviewWhiskey, {
                            whiskey: {
                              id: whiskey.id,
                              name: whiskey.name ?? '',
                            },
                            fromPost: true,
                            existingReview: {
                              id: whiskey.myReview!.id,
                              rating: whiskey.myReview!.rating,
                              title: whiskey.myReview!.title,
                              description: whiskey.myReview!.description,
                              recommendationTags: whiskey.myReview!.recommendationTags as string[] | null,
                              specialistReview: whiskey.myReview!.specialistReview,
                            },
                          })
                        }
                      />
                    </>
                  )}
                </>
              )}
            </ContentContainer>
          </>
        }
        data={
          whiskey?.reviews?.items?.filter(
            (item) => !myUser?.blockedUsers?.includes(item!.userId)
          ) ?? []
        }
        renderItem={({ item }: any) => (
          <ReviewContainer>
            {item.userId !== myUser?.id && (
              <ReviewCard
                key={item.name}
                data={item}
                from={{ page: 'WhiskeyInfo', id: route.params.id }}
              />
            )}
          </ReviewContainer>
        )}
        ListFooterComponent={<Empty />}
      />
      <CreatePostModal
        venueCheckin={selectedVenue}
        whiskeyTag={pourWhiskey}
        visible={createPostVisible}
        onBackButtonPress={closeCreatePost}
      />
      <QRModal />
    </ScreenContainer>
  );
};

export { WhiskeyInfoScreen };
