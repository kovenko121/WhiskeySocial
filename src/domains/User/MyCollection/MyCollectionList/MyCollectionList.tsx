import {
  Header,
  HorizontalCollectionWhiskeyCard,
  HorizontalWhiskeyCard,
  Input,
  LoadingComponent,
  NoWhiskeyFound,
  NoWhiskeyInMyCollection,
  RoundedDropdown,
  Tag,
  TagFilter,
} from '@components';
import { useAuth } from '@contexts';
import { normalizeApostrophes, setApostrophe } from '@helpers';
import { useGetUser, useUpdateCollectionPrivacy } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getProofDisplay, RootStackParams, UserType, Whiskey, WhiskeyType,
  Routes
} from '@types';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard } from 'react-native';
import {
  ContentContainer,
  HeaderPadding,
  InputContainer,
  ListContainer,
  LoadingContainer,
  ScreenContainer,
  TagButton,
  VisibilityButtonsContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'MyCollectionList'>;

const MyCollectionListScreen = ({ navigation, route }: Props) => {
  const { userId } = route.params;
  const {
    user: { sub },
  } = useAuth();
  const { data: user, isLoading: isLoadingUser } = useGetUser(userId);

  const { mutate: mutateCollectionPrivacy } = useUpdateCollectionPrivacy();
  const [myWhiskeysTags, setMyWhiskeysTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('alphabetical');

  const handleSearchCloseIcon = () => {
    setSearch('');
    setMyWhiskeysTags([]);
    Keyboard.dismiss();
  };

  const [visibilitySelected, setVisibilitySelected] = useState<boolean>(
    !!user?.isMyCollectionPublic
  );

  const goToBottleDetails = useCallback(
    (bottleId: string) => {
      navigation.navigate(Routes.BottleDetails, {
        bottleId,
        myUser: sub,
      });
    },
    [navigation, sub]
  );

  const goToWhiskeyScreen = useCallback(
    (id: any) => {
      navigation.navigate(Routes.WhiskeyInfo, { id });
    },
    [navigation]
  );

  // Derive the visible list once per relevant input instead of re-filtering and
  // re-sorting the whole collection on every render. The sort also copies the
  // array first — `.sort()` mutates in place, and the source here is the shared
  // React Query cache, which must not be mutated.
  const visibleWhiskeys = useMemo(() => {
    const items = user?.whiskeys?.items;
    if (!items) return [] as any[];

    // Curly quotes (U+2019/U+2018) and backticks all collapse to a straight
    // apostrophe so names like "Michter's" / "Angel's Envy" match regardless
    // of which quote style is stored vs. typed. Applied to both sides.
    const normalizeQuotes = (value: string) =>
      normalizeApostrophes(value).toLowerCase();

    const normalizedTerm = normalizeQuotes(search);
    const rawTerm = search.toLowerCase();

    const filtered = items.filter(
      (item) =>
        !item?.archived &&
        (!myWhiskeysTags.length ||
          (!!item?.whiskey?.type?.[0] &&
            myWhiskeysTags.includes(item.whiskey.type[0]))) &&
        (normalizeQuotes(item?.whiskey?.brand ?? '').includes(normalizedTerm) ||
          normalizeQuotes(item?.whiskey?.name ?? '').includes(normalizedTerm) ||
          (item && getProofDisplay(item).toLowerCase().includes(rawTerm)) ||
          item?.whiskey?.proof?.toString().toLowerCase().includes(rawTerm) ||
          item?.age?.toString().toLowerCase().includes(rawTerm))
    );

    const sorted = [...filtered];
    if (sortType === 'alphabetical') {
      sorted.sort((a: any, b: any) => {
        const fullNameA =
          (a.whiskey.brandUser?.brandName || '') + a.whiskey.name;
        const fullNameB =
          (b.whiskey.brandUser?.brandName || '') + b.whiskey.name;
        return fullNameA.localeCompare(fullNameB);
      });
    } else {
      sorted.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [user?.whiskeys?.items, myWhiskeysTags, search, sortType]);

  const handleCardPress = useCallback(
    (item: any) => {
      if (user?.userType === UserType.PERSON) {
        goToBottleDetails(item.id);
      } else {
        goToWhiskeyScreen(item?.whiskey?.id);
      }
    },
    [user?.userType, goToBottleDetails, goToWhiskeyScreen]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <HorizontalCollectionWhiskeyCard
        whiskey={item}
        onPress={handleCardPress}
        backgroundColor="primary"
      />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const handleTitle = () => {
    if (user?.id !== sub) {
      if (user?.userType === UserType.PERSON) {
        return `${setApostrophe(user?.personFirstName)} Collection List`;
      }
      if (user?.userType === UserType.VENUE) {
        return `${setApostrophe(user?.venueName)} Menu`;
      }
    }
    return 'My Collection List';
  };

  return (
    <ScreenContainer>
      {!isLoadingUser ? (
        <ContentContainer>
          <HeaderPadding>
            <Header title={handleTitle()} />
          </HeaderPadding>

          <InputContainer>
            <Input
              icon="search"
              iconSize={22}
              placeholder={
                user?.userType === UserType.PERSON
                  ? 'Search by name, brand, proof, age'
                  : 'Search by name, brand and proof'
              }
              value={search}
              onChangeText={setSearch}
              iconRight="close"
              onPressIcon={handleSearchCloseIcon}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
              round
            />
          </InputContainer>
          <>
            {user?.whiskeys?.items && user?.whiskeys?.items?.length > 0 && (
              <TagFilter
                tags={Object.keys(WhiskeyType)}
                selectedTags={myWhiskeysTags}
                setSelectedTags={setMyWhiskeysTags}
                ml={0}
                mv={6}
              />
            )}
            <VisibilityButtonsContainer>
              <RoundedDropdown sortType={sortType} setSortType={setSortType} />
              {user?.id === sub && (
                <TagButton
                  onPress={() => {
                    if (visibilitySelected) {
                      setVisibilitySelected(false);
                      mutateCollectionPrivacy(false);
                      return;
                    }
                    setVisibilitySelected(true);
                    mutateCollectionPrivacy(true);
                  }}
                >
                  <Tag
                    text={
                      visibilitySelected
                        ? 'Visibility: public'
                        : 'Visibility: private'
                    }
                    icon={visibilitySelected ? 'eye-on' : 'eye-off'}
                    selected={visibilitySelected}
                  />
                </TagButton>
              )}
            </VisibilityButtonsContainer>

            <ListContainer>
              {user ? (
                <FlatList
                  data={visibleWhiskeys as unknown as Whiskey[]}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={21}
                  removeClippedSubviews
                  ListEmptyComponent={
                    user?.whiskeys?.items &&
                    user?.whiskeys?.items?.length > 0 ? (
                      <NoWhiskeyFound
                        goSuggestWhiskeyScreen={() => {}}
                        addSuggestionLink={false}
                      />
                    ) : (
                      <NoWhiskeyInMyCollection />
                    )
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
        </ContentContainer>
      ) : (
        <LoadingContainer>
          <LoadingComponent />
        </LoadingContainer>
      )}
    </ScreenContainer>
  );
};
export { MyCollectionListScreen };
