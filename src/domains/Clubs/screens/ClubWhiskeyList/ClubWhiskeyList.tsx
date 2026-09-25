import {
  Header,
  HorizontalWhiskeyCard,
  Icon,
  RoundedDropdown,
  TagFilter,
} from '@components';
import {
  ClubWhiskeyWithDetails,
  useClubMembershipPolling,
  useListClubWhiskeys,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ClubRole,
  MemberStatus,
  RootStackParams,
  Whiskey,
  WhiskeyType,
  Routes
} from '@types';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import {
  ContentContainer,
  EmptyContainer,
  EmptyText,
  FooterLoaderContainer,
  HeaderRow,
  LoadingContainer,
  ScreenContainer,
  WhiskeysList,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ClubWhiskeyList'>;

export const ClubWhiskeyListScreen = ({ navigation, route }: Props) => {
  const { clubId, clubName } = route.params;
  const [sortType, setSortType] = useState('default');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Polling for real-time blocking detection
  const { membership, wasBlocked } = useClubMembershipPolling(clubId);

  // Handle blocking - navigate away when user gets blocked
  useEffect(() => {
    if (wasBlocked) {
      Alert.alert(
        'Removed from Club',
        'You are no longer a member of this club.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
    // Runs only when the blocked state flips; navigation is stable for the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasBlocked]);

  const isAdmin =
    membership?.status === MemberStatus.ACTIVE &&
    (membership?.role === ClubRole.CLUBADMINROLE ||
      membership?.role === ClubRole.CLUBOWNERROLE);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useListClubWhiskeys(clubId);

  // Flatten paginated data
  const allWhiskeys = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Filter by type
  const filteredWhiskeys = useMemo(() => {
    if (!filterTags.length) return allWhiskeys;
    return allWhiskeys.filter(
      (item) => item.whiskey?.type && filterTags.includes(item.whiskey.type[0])
    );
  }, [allWhiskeys, filterTags]);

  // Sort whiskeys
  const sortedWhiskeys = useMemo(() => {
    const sorted = [...filteredWhiskeys];
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
  }, [filteredWhiskeys, sortType]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
      isAdmin,
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <Header title="Club Whiskeys" />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#fff" />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Club Whiskeys" />
      <ContentContainer>
        <TagFilter
          tags={Object.keys(WhiskeyType)}
          selectedTags={filterTags}
          setSelectedTags={setFilterTags}
          ml={0}
        />

        <HeaderRow>
          <RoundedDropdown sortType={sortType} setSortType={setSortType} />
        </HeaderRow>

        <WhiskeysList
          data={sortedWhiskeys}
          renderItem={({ item }: { item: ClubWhiskeyWithDetails }) => {
            if (!item.whiskey) return null;

            return (
              <HorizontalWhiskeyCard
                whiskey={item.whiskey as Whiskey}
                onPress={() => handleWhiskeyPress(item)}
                mv={6}
              />
            );
          }}
          keyExtractor={(item: ClubWhiskeyWithDetails) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="wine-glass" size={48} color="grey300" />
              <EmptyText>{clubName} doesn't have any whiskeys yet.</EmptyText>
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
