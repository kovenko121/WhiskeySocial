import React, { useState } from 'react';
import {
  AbsoluteHeader,
  Button,
  CrownIcon,
  Divider,
  Link,
  MaskedImage,
  PopUpMenu,
  ReviewCard,
  Skeleton,
  Tag,
  Text,
  Title,
} from '@components';
import { getFullWhiskeyName } from '@helpers';
import { useGetUserBottle, useRemoveWhiskeyFromMyCollection } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ProofType,
  type RootStackParams,
  type UserWhiskeys,
  getProofDisplay,
  Routes
} from '@types';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ContentContainer,
  Empty,
  InfoContainer,
  KeyWrapper,
  LinkContainer,
  RatingContainer,
  ScreenContainer,
  ScrollContainer,
  SectionTitleContainer,
  SectionTitleSkeletonWrapper,
  StatusBar,
  TagsContainer,
  TextWrapper,
  TitleSection,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'BottleDetails'>;

// Extend UserWhiskeys to include proofType field (not yet in generated types)
type BottleWithProofType = UserWhiskeys & {
  proofType?: ProofType | null;
};

const prepareWhiskeyInfo = (bottle: BottleWithProofType | null) => {
  if (!bottle) {
    return [];
  }

  const info = [
    { key: 'Bottle', value: bottle?.whiskey?.name },
    // Fall back to the scalar `brand` when the CMS `brandUser` relation is
    // absent — e.g. thin whiskey records minted by the CSV importer, which set
    // `brand` but never link a Brand CMS record (WHI-114).
    {
      key: 'Brand',
      value: bottle?.whiskey?.brandUser?.brandName ?? bottle?.whiskey?.brand,
    },
    { key: 'Distillery', value: bottle?.whiskey?.distillery },
    { key: 'Origin', value: bottle?.whiskey?.origin },
    { key: 'Age', value: bottle?.whiskey?.age },
  ];

  // Get proof display for the base whiskey
  const whiskeyProofDisplay = getProofDisplay(bottle?.whiskey);

  if (whiskeyProofDisplay) {
    info.splice(4, 0, { key: 'Proof', value: whiskeyProofDisplay });
  }

  // Add distillery tasting notes if available
  if (bottle?.whiskey?.distilleryTastingNotes) {
    info.push({ key: 'Distillery Tasting Notes', value: bottle.whiskey.distilleryTastingNotes });
  }

  return info;
};

const prepareBottleInfo = (bottle: BottleWithProofType | null) => {
  if (!bottle) {
    return [];
  }

  const bottleProofDisplay = getProofDisplay(bottle);

  let singleBarrelValue;
  if (bottle?.singleBarrel !== null && bottle?.singleBarrel !== undefined) {
    singleBarrelValue = bottle.singleBarrel ? 'Yes' : 'No';
  }

  const info = [
    { key: 'Age', value: bottle?.age },
    { key: 'Batch #', value: bottle?.batch },
    { key: 'Bottle #', value: bottle?.bottle },
    { key: 'Single Barrel', value: singleBarrelValue },
    { key: 'Barrel #', value: bottle?.barrel },
    { key: 'Rick #', value: bottle?.rick },
    { key: 'Ware-house #', value: bottle?.warehouse },
    { key: 'Purchase Year', value: bottle?.purchaseYear },
    { key: 'Store', value: bottle?.storePick },
    { key: 'Style', value: bottle?.style },
    { key: 'Notes', value: bottle?.notes },
  ];

  if (bottleProofDisplay) {
    info.splice(3, 0, { key: 'Bottle Proof', value: bottleProofDisplay });
  }

  return info;
};

const BottleDetailsScreen = ({ navigation, route }: Props) => {
  const { bottleId, myUser } = route.params;
  const { data: bottle, isFetching: isFetchingBottle } =
    useGetUserBottle(bottleId);
  const [showPopUpMenu, setShowPopUpMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { mutate: removeUserWhiskey } = useRemoveWhiskeyFromMyCollection({
    name: Routes.BottleList,
    params: { id: bottle?.whiskey?.id },
  });
  const whiskeyInfo = prepareWhiskeyInfo(bottle);
  const bottleInfo = prepareBottleInfo(bottle);
  const whiskeyProofDisplay = getProofDisplay(bottle?.whiskey);
  const addBottle = async () => {
    if (!bottle?.whiskey) return;
    navigation.navigate(Routes.BottleDetailsForm, {
      whiskey: bottle.whiskey,
      bottle,
      from: { name: Routes.BottleList, params: { id: bottle.whiskey.id } },
    });
  };

  const editBottle = async () => {
    if (!bottle?.whiskey) return;
    navigation.navigate(Routes.BottleDetailsForm, {
      whiskey: bottle.whiskey,
      bottle,
      from: { name: Routes.BottleDetails, params: { id: bottle.whiskey.id } },
    });
  };

  const scrollRef = useAnimatedRef();

  const insets = useSafeAreaInsets();

  const options = [
    {
      id: '1',
      title: 'Add New Bottle',
      icon: 'plus',
      action: addBottle,
    },
    {
      id: '2',
      title: 'Delete this Bottle',
      icon: 'trash',
      action: () => removeUserWhiskey({ id: bottleId }),
    },
  ];

  const review = bottle?.whiskey?.reviews?.items.sort(
    (a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScrollContainer
        scrollEventThrottle={60}
        ref={scrollRef}
        scrollToOverflowEnabled
      >
        <WhiskeyImageContainer>
          <AbsoluteHeader
            actionIcon="dot-menu-horizontal"
            action={() => {
              if (!isClosing) setShowPopUpMenu(!showPopUpMenu);
            }}
          />
          {showPopUpMenu && (
            <PopUpMenu
              width={55}
              options={options}
              alignItems="bottom"
              paddingBottom={60}
              paddingLeft={100}
              setVisibleStatus={setShowPopUpMenu}
              setIsClosingStatus={setIsClosing}
              reverse
              showLoading={false}
            />
          )}
          <WhiskeyImage
            source={isFetchingBottle ? undefined : bottle?.whiskey?.picture}
          />
        </WhiskeyImageContainer>
        <ContentContainer>
          {isFetchingBottle ? (
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
              <SectionTitleSkeletonWrapper>
                <Skeleton width={150} height={30} />
              </SectionTitleSkeletonWrapper>
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <React.Fragment key={index}>
                    <InfoContainer>
                      <KeyWrapper>
                        <Skeleton width={70} height={30} />
                      </KeyWrapper>
                      <TextWrapper>
                        <Skeleton width={150} height={30} />
                      </TextWrapper>
                    </InfoContainer>
                    <Divider />
                  </React.Fragment>
                ))}
            </>
          ) : (
            <>
              <TagsContainer>
                {!!bottle.whiskey?.type?.[0] && (
                  <Tag selected text={bottle.whiskey.type[0]} />
                )}
              </TagsContainer>

              <TitleSection>
                <Title
                  style={{ lineHeight: 40 }}
                  align="center"
                  color="primary500"
                  size={27}
                >
                  {getFullWhiskeyName(bottle.whiskey!)}
                </Title>
              </TitleSection>
              {!!bottle.whiskey?.calculatedRating && (
                <RatingContainer>
                  <CrownIcon size={16} color="primary500" />
                  <Text size={15} mr={6}>
                    {bottle.whiskey?.calculatedRating}
                  </Text>
                  {!!review?.rating && (
                    <>
                      <MaskedImage img={myUser.profilePictureLoaded} />
                      <Text size={14}>{review?.rating}</Text>
                    </>
                  )}
                </RatingContainer>
              )}

              <Title size={18} align="left" mb={20} mt={30}>
                Characteristics
              </Title>
              {whiskeyInfo.map((item, index) => (
                <React.Fragment key={item.key || index}>
                  <InfoContainer>
                    <KeyWrapper>
                      <Text size={15} mb={10} bold>
                        {item.key}
                      </Text>
                    </KeyWrapper>
                    <TextWrapper>
                      <Text
                        size={15}
                        mb={10}
                        numberOfLines={item.key === 'Distillery Tasting Notes' ? undefined : 2}
                      >
                        {item.value}
                      </Text>
                      {item.key === 'Bottle' && (
                        <LinkContainer
                          onPress={() =>
                            navigation.navigate(Routes.WhiskeyInfo, {
                              id: bottle.whiskey?.id,
                            })
                          }
                        >
                          <Link align="left" color="primary500" bold>
                            See Product
                          </Link>
                        </LinkContainer>
                      )}
                    </TextWrapper>
                  </InfoContainer>
                  {index < whiskeyInfo.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              <Empty />
              <SectionTitleContainer>
                <Title size={18} align="left" mb={10}>
                  Bottle Details
                </Title>
                <TouchableOpacity onPress={editBottle}>
                  <Tag icon="edit" text="Edit" />
                </TouchableOpacity>
              </SectionTitleContainer>
              {bottleInfo.map((item, index) => {
                // Hide the bottle proof when it says nothing the whiskey's own
                // proof row above has not already said. A designation changes the
                // rendered value, so those keep showing.
                const shouldHideProof =
                  item.key === 'Bottle Proof' &&
                  item.value === whiskeyProofDisplay;

                if (shouldHideProof) return null;

                return (
                  <React.Fragment key={item.key || index}>
                    <InfoContainer>
                      <KeyWrapper>
                        <Text size={15} mb={10} bold>
                          {item.key}
                        </Text>
                      </KeyWrapper>
                      <TextWrapper>
                        <Text size={15} mb={10} numberOfLines={2}>
                          {item.value}
                        </Text>
                      </TextWrapper>
                    </InfoContainer>
                    <Divider />
                  </React.Fragment>
                );
              })}
              {review && (
                <>
                  <Title size={18} align="left" mb={20} mt={20}>
                    My Review
                  </Title>

                  <ReviewCard
                    backgroundColor="grey400"
                    footerColor="white"
                    tagColor="grey400"
                    descriptionColor="white"
                    key={review?.id}
                    data={review}
                  />
                  <Button
                    label="Edit My Review"
                    variant="outlineDefault"
                    mv={8}
                    onPress={() =>
                      navigation.navigate(Routes.ReviewWhiskey, {
                        whiskey: {
                          id: bottle!.whiskey!.id,
                          name: bottle!.whiskey!.name ?? '',
                        },
                        fromPost: true,
                        existingReview: {
                          id: review.id,
                          rating: review.rating,
                          title: review.title,
                          description: review.description,
                          recommendationTags: review.recommendationTags as string[] | null,
                          specialistReview: review.specialistReview,
                        },
                      })
                    }
                  />
                </>
              )}
            </>
          )}
        </ContentContainer>
      </ScrollContainer>
    </ScreenContainer>
  );
};

export { BottleDetailsScreen };
