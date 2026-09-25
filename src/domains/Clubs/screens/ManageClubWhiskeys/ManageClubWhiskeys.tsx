import { Button, Header, HorizontalWhiskeyCard, Icon, RoundedDropdown } from '@components';
import { ClubWhiskeyWithDetails, useListClubWhiskeys } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Whiskey,
  Routes
} from '@types';
import { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  AddButtonContainer,
  ContentContainer,
  CountText,
  EmptyContainer,
  EmptyText,
  FooterLoaderContainer,
  HeaderRow,
  LoadingContainer,
  ScreenContainer,
  WhiskeyCardWrapper,
  WhiskeysList,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ManageClubWhiskeys'>;

export const ManageClubWhiskeysScreen = ({ navigation, route }: Props) => {
  const { clubId, clubName } = route.params;
  const [sortType, setSortType] = useState('default');

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useListClubWhiskeys(clubId);

  // Flatten paginated data
  const allWhiskeys = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Sort whiskeys
  const sortedWhiskeys = useMemo(() => {
    const sorted = [...allWhiskeys];
    if (sortType === 'alphabetical') {
      return sorted.sort((a, b) => {
        const nameA = a.whiskey?.name || '';
        const nameB = b.whiskey?.name || '';
        return nameA.localeCompare(nameB);
      });
    }
    // Default: by date added (newest first)
    return sorted.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [allWhiskeys, sortType]);

  // Get existing whiskey IDs for the add screen
  const existingWhiskeyIds = useMemo(() => allWhiskeys.map((item) => item.whiskeyId), [allWhiskeys]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAddWhiskey = () => {
    navigation.navigate(Routes.AddClubWhiskey, {
      clubId,
      clubName,
      existingWhiskeyIds,
    });
  };

  const handleWhiskeyPress = (item: ClubWhiskeyWithDetails) => {
    if (!item.whiskey) return;
    navigation.navigate(Routes.ClubWhiskeyDetails, {
      clubWhiskeyId: item.id,
      whiskeyId: item.whiskeyId,
      clubId,
      clubName,
      notes: item.notes,
      addedAt: item.addedAt,
      isAdmin: true,
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <Header title="Manage Whiskeys" />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#fff" />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Manage Whiskeys" />
      <ContentContainer>
        <AddButtonContainer>
          <Button
            label="Add Whiskey"
            icon="plus"
            variant="default"
            onPress={handleAddWhiskey}
            full
          />
        </AddButtonContainer>

        <HeaderRow>
          <RoundedDropdown sortType={sortType} setSortType={setSortType} />
          <CountText>{allWhiskeys.length} whiskeys</CountText>
        </HeaderRow>

        <WhiskeysList
          data={sortedWhiskeys}
          contentContainerStyle={{ paddingTop: 6 }}
          renderItem={({ item }: { item: ClubWhiskeyWithDetails }) => {
            if (!item.whiskey) return null;

            return (
              <WhiskeyCardWrapper>
                <HorizontalWhiskeyCard
                  whiskey={item.whiskey as Whiskey}
                  onPress={() => handleWhiskeyPress(item)}
                  mv={0}
                />
              </WhiskeyCardWrapper>
            );
          }}
          keyExtractor={(item: ClubWhiskeyWithDetails) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="wine-glass" size={48} color="grey300" />
              <EmptyText>No whiskeys yet.{'\n'}Tap "Add Whiskey" to get started.</EmptyText>
            </EmptyContainer>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <FooterLoaderContainer>
                <ActivityIndicator />
              </FooterLoaderContainer>
            ) : null
          }
        />
      </ContentContainer>
    </ScreenContainer>
  );
};
