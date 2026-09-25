import { HorizontalGuideCard, Title } from '@components';
import { getTestId } from '@helpers';
import { useListArticles } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { Guides, NavigationProps,
  Routes
} from '@types';
import { useMemo, useCallback } from 'react';
import { Empty, FlatList, Link, TitleContainer } from './styles';

export const LatestArticles = () => {
  const navigation = useNavigation<NavigationProps>();
  const { data, isLoading } = useListArticles();

  const goToArticle = useCallback(async (id: string) => {
    navigation.navigate(Routes.Article, { id });
  }, [navigation]);

  const goToArticles = useCallback(async () => {
    navigation.navigate(Routes.Articles);
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Guides }) => (
      <HorizontalGuideCard article={item} onPress={() => goToArticle(item.id)} />
    ),
    [goToArticle]
  );

  const sortedData = useMemo(
    () =>
      data?.items
        ? [...data.items]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
        : [],
    [data?.items]
  );

  return (
    !isLoading && (
      <>
        <TitleContainer>
          <Title size={18}>Latest Articles</Title>
          <Link
            testID={getTestId('go-to-articles')}
            onPress={goToArticles}
            color="primary500"
          >
            Go to Articles
          </Link>
        </TitleContainer>

        <FlatList
          data={sortedData}
          horizontal
          initialNumToRender={4}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
          keyExtractor={({ id }: { id: string }) => id}
          renderItem={renderItem}
          ListFooterComponent={<Empty />}
        />
      </>
    )
  );
};
