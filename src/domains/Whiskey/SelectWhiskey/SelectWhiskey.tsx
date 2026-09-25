import {
  Header,
  HorizontalWhiskeyCard,
  Icon,
  Input,
  KeyboardAvoidingContainer,
  Link,
  NoWhiskeyFound,
  TagFilter,
  Text,
} from '@components';
import { pickBottlePhoto } from '@helpers';
import {
  useAddWhiskeyToMyCollection,
  useDebounce,
  useFeatureFlags,
  useHadPouredThisWhiskey,
  useWhiskeys,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  UserType,
  WhiskeyType,
  type RootStackParams,
  type Whiskey,
  Routes
} from '@types';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard } from 'react-native';
import {
  ContentContainer,
  Empty,
  ErrorContainer,
  InputContainer,
  ListContainer,
  ScanRow,
  ScreenContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'SelectWhiskey'>;

export const SelectWhiskeyScreen = ({ navigation, route }: Props) => {
  const { myWhiskeysIds, myUserType } = route.params;
  const { mutate } = useAddWhiskeyToMyCollection();
  const [myWhiskeysTags, setMyWhiskeysTags] = useState<string[]>([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 100);
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWhiskeys(debouncedSearch, [...myWhiskeysIds], myWhiskeysTags[0]);
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const { data: featureFlags } = useFeatureFlags();

  const whiskeys = useMemo(
    () => (data?.pages.flatMap((page) => page.items) as Whiskey[]) ?? [],
    [data]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && whiskeys.length) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, whiskeys.length, fetchNextPage]);

  const goToBottleDetailsFormScreen = useCallback(
    async (whiskey: any) => {
      if (myUserType === UserType.VENUE) {
        mutate({ whiskeyId: whiskey.id });
      } else {
        navigation.navigate(Routes.BottleDetailsForm, {
          whiskey,
        });
      }
    },
    [myUserType, mutate, navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Whiskey }) => (
      <HorizontalWhiskeyCard
        whiskey={item}
        onPress={goToBottleDetailsFormScreen}
        pour={checkIfUserPoured(item.id)}
      />
    ),
    [goToBottleDetailsFormScreen, checkIfUserPoured]
  );

  const handleSearchCloseIcon = () => {
    setSearch('');
    setMyWhiskeysTags([]);
    Keyboard.dismiss();
  };

  const goSuggestWhiskeyScreen = () => {
    navigation.navigate(Routes.SuggestWhiskey);
  };

  const goScanBottleScreen = async () => {
    const picture = await pickBottlePhoto();

    if (picture) {
      navigation.navigate(Routes.ScanBottle, {
        imageUri: picture.uri,
        myUserType,
        intent: 'add',
      });
    }
  };

  const renderList = () => {
    if (isError) {
      return (
        <ErrorContainer>
          <Text align="center">Something went wrong loading whiskeys.</Text>
          <Link color="primary" onPress={() => refetch()}>
            Tap to retry.
          </Link>
        </ErrorContainer>
      );
    }

    if (isLoading || !data) {
      return (
        <FlatList data={[{}, {}]} renderItem={() => <HorizontalWhiskeyCard />} />
      );
    }

    return (
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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        removeClippedSubviews
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
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        <ContentContainer>
          <Header title="Select Whiskey" />
          <InputContainer>
            <Input
              icon="search"
              iconSize={22}
              placeholder="Search by name, brand, etc"
              value={search}
              onChangeText={setSearch}
              iconRight="close"
              onPressIcon={handleSearchCloseIcon}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
              startedWithFocus
              round
            />
          </InputContainer>

          {!!featureFlags?.whiskey_bottle_scan && (
            <ScanRow>
              <Icon name="camera" size={18} color="primary" />
              <Link color="primary" onPress={goScanBottleScreen}>
                Scan bottle
              </Link>
            </ScanRow>
          )}

          <ListContainer>
            <TagFilter
              tags={Object.keys(WhiskeyType)}
              selectedTags={myWhiskeysTags}
              setSelectedTags={setMyWhiskeysTags}
              ml={0}
            />
            {renderList()}
          </ListContainer>
        </ContentContainer>
      </KeyboardAvoidingContainer>
    </ScreenContainer>
  );
};
