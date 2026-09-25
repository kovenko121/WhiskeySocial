import React, { useMemo } from 'react';
import { HorizontalWhiskeyCard, NoWhiskeyFound, TagFilter } from '@components';
import { useHadPouredThisWhiskey, useWhiskeys } from '@hooks';
import { Whiskey, WhiskeyType } from '@types';
import { ActivityIndicator, FlatList } from 'react-native';
import { capturePostHogEvent } from '../../../../config/posthog';
import { Empty, ListContainer } from '../styles';

const MemoizedHorizontalWhiskeyCard = React.memo(HorizontalWhiskeyCard);

const WhiskeysList = ({
  search,
  show,
  onItemPress,
  myWhiskeysTags,
  setMyWhiskeysTags,
  goSuggestWhiskeyScreen,
}: {
  search: string;
  show: boolean;
  onItemPress: (item: Whiskey) => {};
  myWhiskeysTags: string[];
  setMyWhiskeysTags: (tags: string[]) => void;
  goSuggestWhiskeyScreen: () => void;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWhiskeys(search, [], myWhiskeysTags[0]);
  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const whiskeys: Whiskey[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items as Whiskey[]);
  }, [data]);

  if (!show) {
    return null;
  }

  return (
    <>
      <TagFilter
        tags={Object.keys(WhiskeyType)}
        selectedTags={myWhiskeysTags}
        setSelectedTags={setMyWhiskeysTags}
        ml={0}
      />
      <ListContainer>
        {!isLoading && data ? (
          <FlatList
            contentContainerStyle={
              whiskeys.length
                ? undefined
                : { flexGrow: 1, justifyContent: 'center' }
            }
            data={whiskeys}
            renderItem={({ item, index }) => (
              <MemoizedHorizontalWhiskeyCard
                whiskey={item}
                onPress={() => {
                  capturePostHogEvent('search_performed', {
                    query: search,
                    results_count: whiskeys.length,
                    result_tapped_index: index,
                    result_type: 'whiskey',
                  });
                  onItemPress(item);
                }}
                pour={checkIfUserPoured(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            ListEmptyComponent={
              <NoWhiskeyFound
                goSuggestWhiskeyScreen={goSuggestWhiskeyScreen}
                marginRight
              />
            }
            ListFooterComponent={
              whiskeys.length > 0 ? (
                <>
                  {isFetchingNextPage && <ActivityIndicator />}
                  <Empty />
                </>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={[{}, {}]}
            renderItem={() => <HorizontalWhiskeyCard />}
            keyExtractor={(_, index) => `placeholder-${index}`}
          />
        )}
      </ListContainer>
    </>
  );
};

export default WhiskeysList;