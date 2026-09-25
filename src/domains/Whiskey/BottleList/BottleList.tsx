import {
  AbsoluteHeader,
  CrownIcon,
  HorizontalBottleCard,
  MaskedImage,
  Skeleton,
  Tag,
  Text,
  Title,
} from '@components';
import { getFullWhiskeyName } from '@helpers';
import {
  useGetUser,
  useRemoveWhiskeyFromMyCollection,
  useWhiskey,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AddWrapper,
  BottleContainer,
  ContentContainer,
  Empty,
  Link,
  RatingContainer,
  ScreenContainer,
  ScreenFlatList,
  SkeletonCardsContainer,
  StatusBar,
  TagsContainer,
  TitleSection,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'BottleList'>;

const BottleListScreen = ({ navigation, route }: Props) => {
  const { data: myUser } = useGetUser();
  const { mutateAsync: removeUserWhiskey } = useRemoveWhiskeyFromMyCollection();
  const { data: whiskey, isFetching: isFetchingWhiskey } = useWhiskey(
    route.params.id
  );

  const goToBottleDetailsForm = async () => {
    navigation.navigate(Routes.BottleDetailsForm, {
      whiskey,
      from: { name: Routes.BottleList, params: { id: whiskey!.id } },
    });
  };

  const goToBottleDetails = async (bottleId: string) => {
    navigation.navigate(Routes.BottleDetails, {
      bottleId,
      myUser,
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScreenFlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={
            <>
              <WhiskeyImageContainer>
                <AbsoluteHeader action={() => {}} />
                <WhiskeyImage source={isFetchingWhiskey ? undefined : whiskey?.picture} />
              </WhiskeyImageContainer>
              <ContentContainer>
                {isFetchingWhiskey ? (
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
                    <AddWrapper>
                      <Skeleton width={100} height={30} />
                      <Skeleton width={90} height={30} />
                    </AddWrapper>
                  </>
                ) : (
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
                        <Tag
                          icon="specialist"
                          selected
                          backgroundColor="primary500"
                          text="Specialist's Choice"
                        />
                      )}
                      {whiskey?.type && whiskey.type.length > 0 && whiskey.type[0] && (
                        <Tag selected text={whiskey.type[0]} />
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
                        {whiskey?.myReview?.rating && myUser && (
                          <>
                            <MaskedImage img={myUser.profilePictureLoaded} />
                            <Text size={14}>{whiskey.myReview.rating}</Text>
                          </>
                        )}
                      </RatingContainer>
                    )}
                    <AddWrapper>
                      <Title size={18} align="left" mb={20}>
                        Bottles
                        {myUser?.whiskeys?.items && myUser.whiskeys.items.length > 0 && (
                          <Text size={13}>{`  (${
                            myUser.whiskeys.items.filter(
                              (item) => item?.whiskey?.id === whiskey?.id
                            ).length
                          })`}</Text>
                        )}
                      </Title>
                      <TouchableOpacity onPress={goToBottleDetailsForm}>
                        <Link color="primary500" bold>
                          + Add bottle
                        </Link>
                      </TouchableOpacity>
                    </AddWrapper>
                  </>
                )}
              </ContentContainer>
            </>
          }
          data={myUser?.whiskeys?.items.filter(
            (item) => item?.whiskey?.id === whiskey?.id
          )}
          renderItem={({ item }: any) => (
            <BottleContainer>
              {item.userId !== myUser?.id && !isFetchingWhiskey ? (
                <HorizontalBottleCard
                  shadow
                  bottle={item}
                  backgroundColor="primary"
                  onPress={() => goToBottleDetails(item.id)}
                  onDeleteButtonPress={() => removeUserWhiskey({ id: item.id })}
                  showTypeTag={false}
                />
              ) : (
                <SkeletonCardsContainer>
                  <Skeleton width="100%" height={125} />
                </SkeletonCardsContainer>
              )}
            </BottleContainer>
          )}
        ListFooterComponent={<Empty />}
      />
    </ScreenContainer>
  );
};

export { BottleListScreen };
