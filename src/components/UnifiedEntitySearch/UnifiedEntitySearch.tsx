import React, { useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { useDebounce } from '@hooks';
import { EntitySearchResult, InlineTagType, User, UserType, Whiskey } from '@types';
import { ModalBottom } from '../ModalBottom/ModalBottom';
import { Input } from '../Input/Input';
import { Link, Text } from '../Text/Text';
import { useSearchEntitiesForTag } from '../../hooks/inlineTags/useSearchEntitiesForTag';
import { useSearchWhiskeysForTag } from '../../hooks/inlineTags/useSearchWhiskeysForTag';
import { useSearchClubMembersForTag } from '../../hooks/inlineTags/useSearchClubMembersForTag';
import { HorizontalUserCard, HorizontalWhiskeyCard } from '../Card/HorizontalCard/HorizontalCard';
import {
  ContentContainer,
  CenterContainer,
  Empty,
  SectionHeader,
} from './styles';

interface UnifiedEntitySearchProps {
  visible: boolean;
  onBackButtonPress: () => void;
  onEntitySelected: (entity: EntitySearchResult) => void;
  triggerSymbol?: '@' | '#';
  clubId?: string | null;
}

export const UnifiedEntitySearch: React.FC<UnifiedEntitySearchProps> = ({
  visible,
  onBackButtonPress,
  onEntitySelected,
  triggerSymbol = '@',
  clubId = null,
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isWhiskeySearch = triggerSymbol === '#';
  const isClubContext = !!clubId;

  // For club posts, use club member search; otherwise use general entity search
  const {
    data: entityData,
    isLoading: isEntityLoading,
    fetchNextPage: fetchNextEntityPage,
    hasNextPage: hasNextEntityPage,
    isFetchingNextPage: isFetchingNextEntityPage,
  } = useSearchEntitiesForTag(
    debouncedSearch,
    visible && debouncedSearch.length > 0 && !isWhiskeySearch && !isClubContext
  );

  const {
    data: clubMemberData,
    isLoading: isClubMemberLoading,
    fetchNextPage: fetchNextClubPage,
    hasNextPage: hasNextClubPage,
    isFetchingNextPage: isFetchingNextClubPage,
  } = useSearchClubMembersForTag(
    clubId,
    debouncedSearch,
    visible && debouncedSearch.length > 0 && !isWhiskeySearch && isClubContext
  );

  const { data: whiskeyData, isLoading: isWhiskeyLoading } = useSearchWhiskeysForTag(
    debouncedSearch,
    visible && debouncedSearch.length > 0 && isWhiskeySearch
  );

  // Flatten paginated club member data
  const clubMemberResults = React.useMemo(() => {
    if (!clubMemberData) return undefined;
    return clubMemberData.pages.flatMap(page => page.results);
  }, [clubMemberData]);

  // Flatten paginated entity data
  const entityResults = React.useMemo(() => {
    if (!entityData) return undefined;
    return entityData.pages.flatMap(page => page.results);
  }, [entityData]);

  // The three search modes: whiskey, club-member, and general entity.
  const resolveData = () => {
    if (isWhiskeySearch) return whiskeyData;
    if (isClubContext) return clubMemberResults;
    return entityResults;
  };

  const resolveIsLoading = () => {
    if (isWhiskeySearch) return isWhiskeyLoading;
    if (isClubContext) return isClubMemberLoading;
    return isEntityLoading;
  };

  const resolveEmptyPrompt = () => {
    if (isWhiskeySearch) return 'Type to search for whiskeys';
    if (isClubContext) return 'Type to search for members, venues, brands';
    return 'Type to search for users, venues, or brands';
  };

  const resolvePlaceholder = () => {
    if (isWhiskeySearch) return 'Search whiskeys...';
    if (isClubContext) return 'Search members, venues, brands...';
    return 'Search users, venues, brands...';
  };

  const data = resolveData();
  const isLoading = resolveIsLoading();

  // Convert EntitySearchResult to User type for HorizontalUserCard
  const convertToUser = (entity: EntitySearchResult): User => {
    let userType: UserType;
    if (entity.type === InlineTagType.USER) userType = UserType.PERSON;
    else if (entity.type === InlineTagType.VENUE) userType = UserType.VENUE;
    else userType = UserType.BRAND;

    return {
      id: entity.id,
      username: entity.username || '',
      userType,
      personFirstName: entity.personFirstName,
      personLastName: entity.personLastName,
      venueName: entity.venueName,
      brandName: entity.brandName,
      profilePicture: entity.profilePicture,
      brandLogo: entity.logo,
      venueAddressStreet: entity.location,
      followers: entity.followers,
      following: entity.following,
    } as User;
  };

  // Convert EntitySearchResult to Whiskey type for HorizontalWhiskeyCard
  const convertToWhiskey = (entity: EntitySearchResult): Whiskey => ({
      id: entity.id,
      name: entity.name,
      fullName: entity.whiskeyFullName || entity.name,
      type: entity.whiskeyType,
      picture: entity.whiskeyPicture,
      brandUser: entity.whiskeyBrandUser,
      calculatedRating: entity.whiskeyCalculatedRating,
    } as Whiskey);

  const handleClose = () => {
    setSearch('');
    onBackButtonPress();
  };

  const handleSelect = (entity: EntitySearchResult) => {
    onEntitySelected(entity);
    handleClose();
  };

  const handleLoadMore = () => {
    if (isClubContext) {
      if (hasNextClubPage && !isFetchingNextClubPage) {
        fetchNextClubPage();
      }
    } else if (hasNextEntityPage && !isFetchingNextEntityPage) {
        fetchNextEntityPage();
      }
  };

  const groupedData = React.useMemo(() => {
    if (!data) return { users: [], venues: [], brands: [], whiskeys: [] };

    return {
      users: data.filter((e) => e.type === InlineTagType.USER),
      venues: data.filter((e) => e.type === InlineTagType.VENUE),
      brands: data.filter((e) => e.type === InlineTagType.BRAND),
      whiskeys: data.filter((e) => e.type === InlineTagType.WHISKEY),
    };
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <CenterContainer>
          <ActivityIndicator />
        </CenterContainer>
      );
    }

    if (!debouncedSearch) {
      return (
        <CenterContainer>
          <Text color="grey25">{resolveEmptyPrompt()}</Text>
        </CenterContainer>
      );
    }

    if (!data || data.length === 0) {
      return (
        <CenterContainer>
          <Text color="grey25">No results found</Text>
        </CenterContainer>
      );
    }

    return (
      <CenterContainer>
        <FlatList
          data={[
            ...(groupedData.whiskeys.length > 0 ? [{ type: 'header', title: 'Whiskeys' }] : []),
            ...groupedData.whiskeys.map((w) => ({ type: 'whiskey', data: w })),
            ...(groupedData.users.length > 0 ? [{ type: 'header', title: 'Users' }] : []),
            ...groupedData.users.map((u) => ({ type: 'item', data: u })),
            ...(groupedData.venues.length > 0 ? [{ type: 'header', title: 'Venues' }] : []),
            ...groupedData.venues.map((v) => ({ type: 'item', data: v })),
            ...(groupedData.brands.length > 0 ? [{ type: 'header', title: 'Brands' }] : []),
            ...groupedData.brands.map((b) => ({ type: 'item', data: b })),
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return (
                <SectionHeader>
                  <Text bold size={16} color="grey25">
                    {item.title}
                  </Text>
                </SectionHeader>
              );
            }
            if (item.type === 'whiskey') {
              return (
                <HorizontalWhiskeyCard
                  shadow
                  whiskey={convertToWhiskey(item.data)}
                  onPress={() => handleSelect(item.data)}
                />
              );
            }
            return (
              <HorizontalUserCard
                shadow
                user={convertToUser(item.data)}
                onPress={() => handleSelect(item.data)}
                followButton={false}
              />
            );
          }}
          keyExtractor={(item: any) =>
            item.type === 'header' ? `header-${item.title}` : `item-${item.data.id}`
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <>
              {(isFetchingNextClubPage || isFetchingNextEntityPage) && <ActivityIndicator />}
              <Empty />
            </>
          }
        />
      </CenterContainer>
    );
  };

  return (
    <ModalBottom onBackButtonPress={handleClose} visible={visible}>
      <ContentContainer>
        <Link color="primary500" bold onPress={handleClose}>
          Cancel
        </Link>
        <Input
          icon="search"
          iconSize={25}
          placeholder={resolvePlaceholder()}
          value={search}
          onChangeText={setSearch}
          maxLength={50}
          round
          startedWithFocus
        />
        {renderContent()}
      </ContentContainer>
    </ModalBottom>
  );
};
