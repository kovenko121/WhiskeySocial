import { HorizontalGuideCard, TagFilter, Text } from '@components';
import { useArticles, useGetUser } from '@hooks';
import { useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { FilterSection, ListContainer } from '../styles';

const ArticlesList = ({
  search,
  show,
  onItemPress,
  myArticlesTags,
  setMyArticlesTags,
  allTags,
}: {
  search: string;
  show: boolean;
  onItemPress: (item: any) => {};
  myArticlesTags: string[];
  setMyArticlesTags: (tags: string[]) => void;
  allTags: string[];
}) => {
  const {
    data: articles,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArticles(search);
  const { data: user } = useGetUser();

  const [isFavorite, setIsFavorite] = useState(false);
  const favoritesIds = user?.favoriteGuides?.items
    .flatMap((guide) => guide?.guides)
    .map((item) => item.id);

  const sortedData = isFavorite
    ? articles?.pages
        .flatMap((page) => page?.items)
        .filter((guide) => favoritesIds?.includes(guide.id)) ||
      [].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : articles?.pages
        .flatMap((page) => page?.items)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <FilterSection isFavorite={isFavorite}>
        <TagFilter
          tags={allTags}
          selectedTags={myArticlesTags}
          setSelectedTags={setMyArticlesTags}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          ml={0}
        />
      </FilterSection>

      <ListContainer>
        {!isLoading && articles ? (
          <FlatList
            data={
              sortedData?.filter(
                (article) =>
                  !myArticlesTags.length || myArticlesTags.includes(article.tag)
              ) as any[]
            }
            renderItem={({ item }) => (
              <HorizontalGuideCard
                article={item}
                onPress={() => onItemPress(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            ListEmptyComponent={
              <Text size={14} mv={20} color="grey300" align="center" mr={24}>
                No articles found
              </Text>
            }
          />
        ) : (
          <FlatList
            data={[{}, {}]}
            renderItem={() => <HorizontalGuideCard />}
          />
        )}
      </ListContainer>
    </>
  );
};

export default ArticlesList;
