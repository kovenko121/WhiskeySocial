import {
  Header,
  HorizontalPoursCard,
  Input,
  LoadingComponent,
  NoWhiskeyFound,
  RoundedDropdown,
} from '@components';
import { getTestId } from '@helpers';
import { useGetUser, useSearchUserPours } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, UserType,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { FlatList, Keyboard } from 'react-native';
import { NoPours } from './components';
import {
  ContentContainer,
  HeaderPadding,
  InputContainer,
  ListContainer,
  LoadingContainer,
  RoundedDropdownContainer,
  ScreenContainer,
  ToolBar,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'PoursList'>;

const PoursList = ({ navigation, route }: Props) => {
  const { userId } = route.params;
  const { data: user, isLoading: isLoadingUser } = useGetUser(userId);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('default');
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchUserPours(userId, search, sortType);

  const pours = data?.pages
    .flatMap((page) => page.items)
    .reduce((acc: Array<{ id: string; count?: number; whiskey: { id: string } }>, current: { id: string; count?: number; whiskey: { id: string } }) => {
      if (!current?.whiskey) return acc;
      const pour = acc.find((item: { whiskey: { id: string } }) => item.whiskey.id === current.whiskey.id);
      if (!pour) {
        acc.push(current);
      }
      return acc;
    }, []);

  const handleSearchCloseIcon = () => {
    setSearch('');
    Keyboard.dismiss();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const goToWhiskeyScreen = async (id: any) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const goToPourDetais = async (id: any) => {
    navigation.navigate(Routes.PourDetails, { id, userId });
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  return (
    <ScreenContainer>
      {!isLoadingUser ? (
        <ContentContainer>
          <HeaderPadding>
            <Header title="Pours" />
          </HeaderPadding>

          <InputContainer>
            <Input
              icon="search"
              iconSize={22}
              placeholder={
                user?.userType === UserType.PERSON
                  ? 'Search bottle, crest, type, etc...'
                  : 'Search by name, brand and proof'
              }
              value={search}
              onChangeText={setSearch}
              iconRight="close"
              onPressIcon={handleSearchCloseIcon}
              maxLength={50}
              round
            />
          </InputContainer>
          <>
            <ToolBar>
              <RoundedDropdownContainer>
                <RoundedDropdown
                  sortType={sortType}
                  setSortType={setSortType}
                  testID={getTestId('sort-dropdown')}
                />
              </RoundedDropdownContainer>
            </ToolBar>

            <ListContainer>
              {!isLoading && data ? (
                <FlatList
                  data={pours}
                  renderItem={({ item }: { item: { id: string; count?: number; whiskey: { id: string } } }) => (
                    <HorizontalPoursCard
                      shadow
                      pour={item}
                      stack={item.count > 1}
                      counter={item.count ?? 0}
                      onPress={
                        item.count > 1
                          ? ({ id }) => {
                              goToPourDetais(id);
                            }
                          : ({ id }) => goToWhiskeyScreen(id)
                      }
                    />
                  )}
                  keyExtractor={(item: { id: string }) => item.id}
                  onEndReached={handleLoadMore}
                  ListEmptyComponent={
                    user?.whiskeys?.items &&
                    user?.whiskeys?.items?.length > 0 ? (
                      <NoWhiskeyFound
                        goSuggestWhiskeyScreen={() => {}}
                        addSuggestionLink={false}
                      />
                    ) : (
                      <NoPours />
                    )
                  }
                />
              ) : (
                <FlatList
                  data={[{}, {}]}
                  renderItem={() => <HorizontalPoursCard />}
                />
              )}
            </ListContainer>
          </>
        </ContentContainer>
      ) : (
        <LoadingContainer>
          <LoadingComponent />
        </LoadingContainer>
      )}
    </ScreenContainer>
  );
};
export { PoursList };
