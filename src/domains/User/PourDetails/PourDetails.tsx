import {
  AbsoluteHeader,
  CrownIcon,
  HorizontalPoursCard,
  Skeleton,
  Tag,
  Text,
  Title,
} from '@components';
import { getFullWhiskeyName } from '@helpers';
import {
  useListUserPoursByWhiskeyId,
  useSearchUserPours,
  useWhiskey,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ButtonContainer,
  ButtonsContainer,
  ContentContainer,
  Empty,
  PourContainer,
  RatingContainer,
  ScreenContainer,
  ScreenFlatList,
  StatusBar,
  TagButton,
  TagsContainer,
  TitleSection,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'PourDetails'>;

const PourDetails = ({ route, navigation }: Props) => {
  const { id: whiskeyId, userId } = route.params;
  const { data: whiskey, isFetching: isFetchingWhiskey } =
    useWhiskey(whiskeyId);

  const {
    data: pour,
    isFetching: isFetchingPour,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchUserPours();

  const { data: poured } = useListUserPoursByWhiskeyId(whiskeyId, userId);

  const handleShare = () =>
    Share.share({
      message: `Look at ${whiskey!.name!} on Whiskey Social\nhttps://whiskeysocial.app/whiskey/${whiskey!.id}`,
    });

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const goToWhiskeyScreen = async (id: any) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScreenFlatList
        showsVerticalScrollIndicator={false}
        data={whiskey ? poured?.pages.flatMap((page) => page.items) : []}
        keyExtractor={(item: any) => item.id}
        onEndReached={handleLoadMore}
        renderItem={({ item }: any) => (
          <PourContainer>
            <HorizontalPoursCard
              shadow
              pour={item}
              counter={poured?.pages?.reduce((acc, page) => acc + (page?.items?.length || 0), 0) || 0}
              onPress={() => goToWhiskeyScreen(whiskeyId)}
            />
          </PourContainer>
        )}
        ListHeaderComponent={
          <>
            <WhiskeyImageContainer>
              <AbsoluteHeader actionIcon="share" action={handleShare} />
              <WhiskeyImage source={isFetchingWhiskey ? undefined : whiskey?.picture} />
            </WhiskeyImageContainer>
            <ContentContainer>
              {!pour && !whiskey && isFetchingWhiskey && isFetchingPour ? (
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
              ) : (
                <>
                  <TagButton>
                    <Tag text={whiskey?.type?.[0] || ''} selected />
                  </TagButton>

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
                    </RatingContainer>
                  )}

                  {whiskey && (
                    <Title mb={12} mt={24} size={18} align="left">
                      Pours{' '}
                      <Text size={14}>
                        ({poured?.pages?.[0]?.items.length ?? 0})
                      </Text>
                    </Title>
                  )}
                </>
              )}
            </ContentContainer>
          </>
        }
        ListFooterComponent={<Empty />}
      />
    </ScreenContainer>
  );
};

export { PourDetails };
