import {
  Button,
  Header,
  HorizontalWhiskeyCard,
  Input,
  KeyboardAvoidingContainer,
  NoWhiskeyFound,
  TagFilter,
} from '@components';
import { isUnauthorizedClubActionError } from '@helpers';
import { useAddClubWhiskey, useDebounce, useWhiskeys } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Whiskey, WhiskeyType,
  Routes
} from '@types';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard } from 'react-native';
import {
  AddButtonContainer,
  CharacterCount,
  ContentContainer,
  Empty,
  InputContainer,
  ListContainer,
  LoadingOverlay,
  NotesInput,
  NotesLabel,
  NotesSection,
  ScreenContainer,
  SearchResultsLabel,
  SelectedLabel,
  SelectedSection,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'AddClubWhiskey'>;

const MAX_NOTES_LENGTH = 500;

export const AddClubWhiskeyScreen = ({ navigation, route }: Props) => {
  const { clubId, existingWhiskeyIds } = route.params;

  const [search, setSearch] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedWhiskey, setSelectedWhiskey] = useState<Whiskey | null>(null);
  const [notes, setNotes] = useState('');

  const debouncedSearch = useDebounce(search, 100);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWhiskeys(debouncedSearch, existingWhiskeyIds, filterTags[0]);

  const { mutate: addWhiskey, isPending: isAdding } = useAddClubWhiskey();

  const handleLoadMore = () => {
    const filteredWhiskeys = data?.pages.flatMap((page) => page.items) || [];
    if (hasNextPage && !isFetchingNextPage && filteredWhiskeys.length) {
      fetchNextPage();
    }
  };

  const handleSelectWhiskey = (whiskey: Whiskey) => {
    setSelectedWhiskey(whiskey);
    Keyboard.dismiss();
  };

  const handleDeselectWhiskey = () => {
    setSelectedWhiskey(null);
  };

  const handleSearchCloseIcon = () => {
    setSearch('');
    setFilterTags([]);
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleAdd = () => {
    if (!selectedWhiskey) return;

    addWhiskey(
      {
        clubId,
        whiskeyId: selectedWhiskey.id,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.isDuplicate) {
            Alert.alert('Already Added', 'This whiskey is already in the club.');
          } else {
            Alert.alert('Success', 'Whiskey added to club!');
            navigation.goBack();
          }
        },
        onError: (error: Error) => {
          const errorMessage = isUnauthorizedClubActionError(error)
            ? error.message
            : 'Failed to add whiskey. Please try again.';
          Alert.alert('Error', errorMessage);
        },
      }
    );
  };

  const goSuggestWhiskeyScreen = () => {
    navigation.navigate(Routes.SuggestWhiskey);
  };

  const canAdd = selectedWhiskey !== null && !isAdding;

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        <Header title="Add Whiskey" navBack={handleCancel} />
        <ContentContainer>
          <InputContainer>
            <Input
              icon="search"
              iconSize={22}
              placeholder="Search whiskeys..."
              value={search}
              onChangeText={setSearch}
              iconRight="close"
              onPressIcon={handleSearchCloseIcon}
              maxLength={50}
              startedWithFocus
              round
            />
          </InputContainer>

          <ListContainer>
            <TagFilter
              tags={Object.keys(WhiskeyType)}
              selectedTags={filterTags}
              setSelectedTags={setFilterTags}
              ml={0}
            />

            {selectedWhiskey && (
              <SelectedSection>
                <SelectedLabel>Selected:</SelectedLabel>
                <HorizontalWhiskeyCard
                  whiskey={selectedWhiskey}
                  deleteButton
                  onDeleteButtonPress={handleDeselectWhiskey}
                  selected
                  mv={0}
                />

                <NotesSection>
                  <NotesLabel>Notes (optional)</NotesLabel>
                  <NotesInput
                    placeholder="Add notes about this whiskey..."
                    placeholderTextColor="#666"
                    value={notes}
                    onChangeText={(text: string) =>
                      setNotes(text.slice(0, MAX_NOTES_LENGTH))
                    }
                    multiline
                    numberOfLines={3}
                  />
                  <CharacterCount>
                    {MAX_NOTES_LENGTH - notes.length} characters remaining
                  </CharacterCount>
                </NotesSection>

                <AddButtonContainer>
                  <Button
                    label="Add Whiskey"
                    onPress={handleAdd}
                    disabled={!canAdd}
                    full
                  />
                </AddButtonContainer>
              </SelectedSection>
            )}

            {!selectedWhiskey && (
              <>
                <SearchResultsLabel>Search Results:</SearchResultsLabel>
                {!isLoading && data ? (
                  <FlatList
                    contentContainerStyle={
                      data.pages.flatMap((page) => page.items).length
                        ? {}
                        : { flexGrow: 1, justifyContent: 'center' }
                    }
                    data={data.pages.flatMap((page) => page.items) as Whiskey[]}
                    renderItem={({ item }) => (
                      <HorizontalWhiskeyCard
                        whiskey={item}
                        onPress={() => handleSelectWhiskey(item)}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    onEndReached={handleLoadMore}
                    ListEmptyComponent={
                      search.length >= 2 ? (
                        <NoWhiskeyFound
                          goSuggestWhiskeyScreen={goSuggestWhiskeyScreen}
                        />
                      ) : null
                    }
                    ListFooterComponent={
                      data.pages.flatMap((page) => page.items).length ? (
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
                    keyExtractor={(_, index) => `skeleton-${index}`}
                  />
                )}
              </>
            )}
          </ListContainer>
        </ContentContainer>
      </KeyboardAvoidingContainer>

      {isAdding && (
        <LoadingOverlay>
          <ActivityIndicator size="large" color="#fff" />
        </LoadingOverlay>
      )}
    </ScreenContainer>
  );
};
