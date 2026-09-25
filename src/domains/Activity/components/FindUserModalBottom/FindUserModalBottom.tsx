import { useDebounce, useNearbyPlacesFromGoogle, useUsers } from '@hooks';
import { User, UserType } from '@types';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { HorizontalUserCard } from '../../../../components/Card/HorizontalCard/HorizontalCard';
import { Input } from '../../../../components/Input/Input';
import { ModalBottom } from '../../../../components/ModalBottom/ModalBottom';
import { Link } from '../../../../components/Text/Text';
import { CenterContainer, ContentContainer, Empty } from './styles';
import { useListClubMembers } from '../../../../hooks/clubs/useListClubMembers';

const FindUserModalBottom = ({
  onBackButtonPress,
  onUserSelected,
  visible,
  userType = UserType.PERSON,
  followButton = false,
  clubId,
}: {
  onBackButtonPress: () => void;
  onUserSelected: (user: User) => void;
  visible: boolean;
  followButton?: boolean;
  userType?: UserType;
  clubId?: string;
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Use club member list if clubId is provided, otherwise use general user search
  const {
    data: generalUserData,
    isLoading: generalUserLoading,
    fetchNextPage: fetchNextGeneralPage,
    hasNextPage: hasNextGeneralPage,
    isFetchingNextPage: isFetchingNextGeneralPage,
    refetch: refetchGeneral,
  } = useUsers(debouncedSearch, userType);

  // For club context: get club members (PERSON users only)
  const {
    data: clubMemberData,
    isLoading: isClubMemberLoading,
    fetchNextPage: fetchNextClubPage,
    hasNextPage: hasNextClubPage,
    isFetchingNextPage: isFetchingNextClubPage,
    refetch: refetchClub,
  } = useListClubMembers(clubId);

  // Select which data source to use
  const isLoading = clubId ? isClubMemberLoading : generalUserLoading;
  const fetchNextPage = clubId ? fetchNextClubPage : fetchNextGeneralPage;
  const hasNextPage = clubId ? hasNextClubPage : hasNextGeneralPage;
  const isFetchingNextPage = clubId ? isFetchingNextClubPage : isFetchingNextGeneralPage;
  const refetch = clubId ? refetchClub : refetchGeneral;

  const { results, triggerFetchNearbyPlaces } = useNearbyPlacesFromGoogle();

  const closeModal = () => {
    refetch();
    onBackButtonPress();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getLastKnownPositionAsync();
      triggerFetchNearbyPlaces(location!, 10000);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResults = useMemo(() => {
    // If we're in a club context, only show PERSON users who are club members
    if (clubId) {
      if (isClubMemberLoading) return [];

      const allUsers: User[] = [];

      // Extract users from club members and filter to only PERSON users
      if (clubMemberData) {
        const clubUsers = clubMemberData.pages.flatMap((page) =>
          page.items
            .filter((member) => member.user && member.user.userType === UserType.PERSON) // Only PERSON users
            .map((member) => member.user!)
        ) as User[];
        allUsers.push(...clubUsers);
      }

      // Filter by search query if present
      if (!search) return allUsers;

      const lowerSearch = search.toLowerCase();
      return allUsers.filter((user) => {
        const username = user.username?.toLowerCase() || '';
        const firstName = user.personFirstName?.toLowerCase() || '';
        const lastName = user.personLastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return username.includes(lowerSearch) ||
               firstName.includes(lowerSearch) ||
               lastName.includes(lowerSearch) ||
               fullName.includes(lowerSearch);
      });
    }

    // Otherwise, use the general user search
    if (generalUserLoading || !generalUserData) return [];
    return generalUserData?.pages.flatMap((page, index) => {
      if (index) return page.items;

      const users = page.items;
      const venues =
        userType !== UserType.PERSON
          ? (results
            .sort((a: any, b: any) =>
              a.venueName.localeCompare(b.venueName)
            )
            .filter((venue) =>
              venue.venueName.toLowerCase().includes(search.toLowerCase())
            ) as any[])
          : [];

      return users.concat(venues);
    }) as User[];
  }, [clubId, clubMemberData, isClubMemberLoading, generalUserData, generalUserLoading, search, userType, results]);

  const idsToExclude = useMemo(() => new Set(
      filteredResults
        ?.filter((item) => item.externalId)
        .map((item) => item.externalId)
    ), [filteredResults]);

  const finalResults = useMemo(() => filteredResults?.filter((item) => !idsToExclude.has(item.id)) ?? [], [filteredResults, idsToExclude]);

  return (
    <ModalBottom onBackButtonPress={closeModal} visible={visible}>
      <ContentContainer>
        <Link color="primary500" bold onPress={closeModal}>
          Cancel
        </Link>
        <Input
          icon="search"
          iconSize={25}
          placeholder="Search user"
          value={search}
          onChangeText={setSearch}
          maxLength={50}
          round
        />
        <CenterContainer>
          {(() => {
            if (isLoading) return <ActivityIndicator />;

            if (finalResults.length === 0) {
              return (
                <FlatList
                  data={[{}, {}]}
                  renderItem={() => <HorizontalUserCard shadow />}
                />
              );
            }

            return (
              <FlatList
                data={finalResults}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                renderItem={({ item }) => (
                  <HorizontalUserCard
                    shadow
                    user={item}
                    onPress={() => onUserSelected(item)}
                    followButton={followButton}
                  />
                )}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                ListFooterComponent={
                  <>
                    {isFetchingNextPage && <ActivityIndicator />}
                    <Empty />
                  </>
                }
              />
            );
          })()}
        </CenterContainer>
      </ContentContainer>
    </ModalBottom>
  );
};

export { FindUserModalBottom };
