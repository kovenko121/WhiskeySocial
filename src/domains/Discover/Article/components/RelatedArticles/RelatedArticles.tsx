import { HorizontalGuideCard, Link, Title } from '@components';
import { useListArticles } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { Guides, NavigationProps,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { Empty, HorizontalFlatList, TitleContainer } from './styles';

export const RelatedArticles = ({ guide }: { guide: Guides }) => {
  const navigation = useNavigation<NavigationProps>();
  const [articlesTag, setArticlesTag] = useState(guide.tag);
  const { data, isLoading, refetch } = useListArticles(articlesTag);
  const goToArticle = async (id: string) => {
    navigation.navigate(Routes.Article, { id });
  };

  const goToArticles = async () => {
    navigation.navigate(Routes.Articles);
  };

  useEffect(() => {
    if (data && data?.items?.length <= 1) {
      setArticlesTag('');
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    !isLoading && (
      <>
        <TitleContainer>
          <Title size={18} mv={8}>
            Related Articles
          </Title>
          <Link onPress={goToArticles} color="primary500">
            Return to Articles
          </Link>
        </TitleContainer>

        <HorizontalFlatList
          data={data?.items.filter((item) => item.id !== guide.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={({ id }: { id: string }) => id}
          renderItem={({ item }: { item: Guides }) => (
            <HorizontalGuideCard
              article={item}
              onPress={() => goToArticle(item?.id)}
            />
          )}
        />
        <Empty />
      </>
    )
  );
};
