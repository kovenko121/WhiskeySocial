import {
  HorizontalWhiskeyCard,
  Icon,
  NoWhiskeyFound,
  TagFilter,
} from '@components';
import {
  useAddWhiskeyToWishlist,
  useGetUser,
  useHadPouredThisWhiskey,
  useRemoveWhiskeyFromWishlist,
  useWhiskeys,
} from '@hooks';
import { theme } from '@theme';
import { Whiskey, WhiskeyType } from '@types';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import {
  AddToWishListButtonContainer,
  AddToWishlistButton,
  Empty,
  ListContainer,
} from './styles';

const WishlistWhiskeysList = ({
  search,
  onItemPress,
  goSuggestWhiskeyScreen,
}: {
  search: string;
  goSuggestWhiskeyScreen: () => void;
  onItemPress: (item: Whiskey) => {};
}) => {
  const { data: myUser } = useGetUser();
  const { mutate: addToWishlist, isLoading: addingToWishlist } =
    useAddWhiskeyToWishlist();

  const { mutate: removeFromWishlist, isLoading: removingFromWishlist } =
    useRemoveWhiskeyFromWishlist();

  const [myWhiskeysTags, setMyWhiskeysTags] = useState([]);
  const [selectedWhiskey, setSelectedWhiskey] = useState('');

  const {
    data,
    isLoading: isLoadingWhiskeys,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWhiskeys(search, [], myWhiskeysTags[0]);

  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const whiskeys = useMemo(
    () => (data?.pages.flatMap((page) => page.items) as Whiskey[]) ?? [],
    [data]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && whiskeys.length) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, whiskeys.length, fetchNextPage]);

  const showLoadingIndicator = addingToWishlist || removingFromWishlist;

  return (
    <>
      <TagFilter
        tags={Object.keys(WhiskeyType)}
        selectedTags={myWhiskeysTags}
        setSelectedTags={setMyWhiskeysTags}
        ml={0}
        mv={8}
      />
      <ListContainer>
        {!isLoadingWhiskeys && data ? (
          <FlatList
            contentContainerStyle={
              whiskeys.length
                ? {}
                : {
                    flexGrow: 1,
                    justifyContent: 'center',
                  }
            }
            data={whiskeys}
            removeClippedSubviews
            renderItem={({ item }) => {
              const userWhiskeyWishlistId =
                myUser?.wishList?.items.find(
                  (w) => w && w.whiskey && w.whiskey.id === item.id
                )?.id || '';

              return (
                <HorizontalWhiskeyCard
                  whiskey={item}
                  onPress={() => onItemPress(item)}
                  selected={!!userWhiskeyWishlistId}
                  pour={checkIfUserPoured(item.id)}
                >
                  <AddToWishListButtonContainer>
                    <AddToWishlistButton
                      color={
                        userWhiskeyWishlistId
                          ? theme.colors.red
                          : theme.colors.primary500
                      }
                      onPress={() => {
                        setSelectedWhiskey(item.id);
                        if (userWhiskeyWishlistId) {
                          removeFromWishlist({
                            whiskeyId: item.id,
                          });
                        } else {
                          addToWishlist({ whiskeyId: item.id });
                        }
                      }}
                    >
                      {selectedWhiskey === item.id && showLoadingIndicator ? (
                        <ActivityIndicator size={12} color="white" />
                      ) : (
                        <Icon
                          name={userWhiskeyWishlistId ? 'close' : 'plus'}
                          size={12}
                          color="white"
                        />
                      )}
                    </AddToWishlistButton>
                  </AddToWishListButtonContainer>
                </HorizontalWhiskeyCard>
              );
            }}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            ListEmptyComponent={
              <NoWhiskeyFound goSuggestWhiskeyScreen={goSuggestWhiskeyScreen} />
            }
            ListFooterComponent={
              whiskeys.length ? (
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
          />
        )}
      </ListContainer>
    </>
  );
};

export default WishlistWhiskeysList;
