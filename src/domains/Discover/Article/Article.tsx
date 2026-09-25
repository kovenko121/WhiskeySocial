import {
  AbsoluteHeader,
  Ad,
  Divider,
  FavoriteButton,
  Skeleton,
  Tag,
  Text,
  Title,
} from '@components';
import { useGetArticle } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getArticleFromScreen, SCREEN_NAMES } from '@services';
import { AdType, RootStackParams } from '@types';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useRef } from 'react';
import { FlatList, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RelatedArticles } from './components';
import {
  ContentContainer,
  Empty,
  Picture,
  ScreenContainer,
  ScrollContainer,
  StatusBar,
  TagsContainer,
  TagsSection,
  TitleSection,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Article'>;

export const ArticleScreen = ({ route }: Props) => {
  const { data, isFetching, refetch } = useGetArticle(route.params.id);
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const trackedArticleId = useRef<string | undefined>(undefined);
  const dataArray = data?.body.map((item, index) => ({
    text: item,
    image: data.photos[index] || '',
  }));

  useEffect(() => {
    refetch();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [route.params.id]);

  // Fire the Article $screen event here (instead of in the central navigation
  // tracker) so it can include the human-readable `title` — only available once
  // the article data has loaded. Tracked once per article id (WHI-130).
  useEffect(() => {
    if (!data?.title || trackedArticleId.current === route.params.id) return;

    trackedArticleId.current = route.params.id;
    posthog.screen(SCREEN_NAMES.Article, {
      id: route.params.id,
      title: data.title,
      from_screen: getArticleFromScreen(),
      route_name: route.name,
    });
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [data?.title, route.params.id]);

  const handleShare = () =>
    Share.share({
      message: `Look at ${data!.title!} on Whiskey Social\nhttps://whiskeysocial.app/article/${route.params.id}`,
    });

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScrollContainer scrollEventThrottle={60}>
        <>
          <WhiskeyImageContainer>
            <AbsoluteHeader actionIcon="share" action={handleShare} />
            <WhiskeyImage source={isFetching ? undefined : data?.coverPhoto} />
          </WhiskeyImageContainer>
          {isFetching ? (
            <ContentContainer>
              <TagsSection>
                <TagsContainer>
                  <Skeleton width={100} height={35} radius={50} />
                </TagsContainer>
                <Skeleton width={30} height={30} />
              </TagsSection>
              <Empty />
              <TitleSection>
                <Skeleton width={300} height={35} />
              </TitleSection>
              <Empty />
              <Skeleton width={200} height={35} />
              <Empty />
              <Skeleton width="100%" height={200} />
            </ContentContainer>
          ) : (
            <FlatList
              data={dataArray}
              scrollEnabled={false}
              ListHeaderComponent={
                <ContentContainer>
                  <TagsSection>
                    <TagsContainer>
                      <Tag selected text={data?.tag} />
                    </TagsContainer>
                    <FavoriteButton guideId={data?.id} />
                  </TagsSection>
                  <TitleSection>
                    <Title
                      style={{ lineHeight: 40 }}
                      align="center"
                      color="primary500"
                      size={27}
                    >
                      {data?.title}
                    </Title>
                  </TitleSection>
                  <Text color="secondary300" size={16} mv={20} align="center">
                    {data?.subtitle}
                  </Text>
                </ContentContainer>
              }
              renderItem={({ item }) => (
                <ContentContainer>
                  <Text size={13} mv={10}>
                    {item.text}
                  </Text>
                  {item.image && <Picture source={item.image} />}
                </ContentContainer>
              )}
              ListFooterComponent={
                <ContentContainer>
                  <Ad type={AdType.ARTICLE} topDivider />
                  <Divider />
                  <RelatedArticles guide={data} />
                </ContentContainer>
              }
            />
          )}
        </>
      </ScrollContainer>
    </ScreenContainer>
  );
};
