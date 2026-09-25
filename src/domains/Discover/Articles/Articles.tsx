import {
  FavoriteButton,
  Header,
  HorizontalGuideCard,
  Icon,
  Skeleton,
  Tag,
  TagFilter,
  Text,
} from '@components';
import { getS3Image, getTestId } from '@helpers';
import { useGetArticlesTags, useGetUser, useListArticles } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { Guides, ImageUrl, RootStackParams, S3Object
} from '@types';
import { useEffect, useState } from 'react';
import { ImageSourcePropType, Share, TouchableOpacity } from 'react-native';
import {
  ContentContainer,
  FilterSection,
  GuidesFlatlist,
  HeaderContainer,
  HeaderSpacing,
  Picture,
  ScreenContainer,
  ShareButtonContainer,
  SkeletonContainer,
  TagsContainer,
  TitleSection,
  TitleWrapper,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Articles'>;

export const ArticlesScreen = ({ navigation }: Props) => {
  const [articlesTags, setArticlesTags] = useState<string[]>([]);
  const { data, isLoading: isLoadingArticles } = useListArticles(
    articlesTags[0]
  );
  const { data: tags, isLoading: isLoadingTags } = useGetArticlesTags();
  const { data: user } = useGetUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const sortedData = isFavorite
    ? user?.favoriteGuides?.items
        .flatMap((guide) => guide.guides)
        ?.filter(
          (guide) => !articlesTags.length || articlesTags.includes(guide.tag)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
    : data?.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const firstElement = sortedData
    ? sortedData
        .slice(0, 1)
        .filter(
          (guide) => !articlesTags.length || articlesTags.includes(guide.tag)
        )
    : [];

  const restOfArray = sortedData ? sortedData.slice(1) : [];

  const [coverPhoto, setCoverPhoto] = useState<
    ImageUrl | ImageSourcePropType
  >();

  useEffect(() => {
    const setWhiskeyImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setCoverPhoto(img);
    };

    if (firstElement.length > 0 && firstElement[0].coverPhoto?.bucket) {
      setWhiskeyImg(firstElement[0].coverPhoto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const goToArticle = async (id: string) => {
    navigation.navigate(Routes.Article, { id });
  };

  const handleShare = () => {
    if (!firstElement[0]) return;
    Share.share({
      message: `Look at ${firstElement[0].title ?? ''} on Whiskey Social\nhttps://whiskeysocial.app/article/${firstElement[0].id}`,
    });
  };

  return (
    <ScreenContainer>
      <HeaderContainer>
        <Header title="Articles" action={() => {}} />
      </HeaderContainer>
      <ContentContainer showsVerticalScrollIndicator={false}>
        <HeaderSpacing />
        {isLoadingArticles || isLoadingTags || !data || !tags ? (
          <SkeletonContainer>
            <Skeleton width="100%" height={60} />
            <FilterSection
              isFavorite={isFavorite}
              testID={getTestId('favorite')}
            >
              <Skeleton width={55} radius={50} height={30} />
            </FilterSection>
            <Picture source={{}} />
            <TitleSection>
              <TitleWrapper>
                <Skeleton height={35} width={150} />
              </TitleWrapper>
              <Skeleton height={35} width={35} />
            </TitleSection>
            <TagsContainer>
              <Skeleton width={55} radius={50} height={35} />
            </TagsContainer>
          </SkeletonContainer>
        ) : (
          <GuidesFlatlist
            data={
              (isFavorite ? sortedData : restOfArray)?.filter(
                (guide) =>
                  !articlesTags.length || articlesTags.includes(guide.tag)
              ) || []
            }
            scrollEnabled={false}
            ListHeaderComponent={
              <>
                <Text size={12} align="center">
                  Having doubts on where to start or how to improve your whiskey
                  experience? You can find here a wide range of articles to help
                  you on your journey.
                </Text>
                <FilterSection isFavorite={isFavorite}>
                  <TagFilter
                    testID={getTestId('favorite')}
                    ml={0}
                    tags={tags?.items?.map((obj: { name: string } | null) => obj?.name).filter((name): name is string => !!name)}
                    selectedTags={articlesTags}
                    setSelectedTags={setArticlesTags}
                    isFavorite={isFavorite}
                    setIsFavorite={setIsFavorite}
                  />
                </FilterSection>
                {!isFavorite && firstElement[0] && (
                  <>
                    <TouchableOpacity
                      onPress={() => goToArticle(firstElement[0]?.id)}
                    >
                      <Picture source={coverPhoto} />
                      <ShareButtonContainer
                        testID={getTestId('share')}
                        onPress={handleShare}
                      >
                        <Icon name="share" size={16} color="white" />
                      </ShareButtonContainer>
                      <TitleSection>
                        <TitleWrapper>
                          <Text size={16} bold>
                            {firstElement[0]?.title}
                          </Text>
                        </TitleWrapper>
                        <FavoriteButton guideId={firstElement[0]?.id} />
                      </TitleSection>
                    </TouchableOpacity>
                    <TagsContainer>
                      <Tag text={firstElement[0]?.tag} />
                    </TagsContainer>
                  </>
                )}
              </>
            }
            renderItem={({ item }: { item: Guides }) => (
              <HorizontalGuideCard
                article={item}
                onPress={() => goToArticle(item?.id)}
              />
            )}
          />
        )}
      </ContentContainer>
    </ScreenContainer>
  );
};
