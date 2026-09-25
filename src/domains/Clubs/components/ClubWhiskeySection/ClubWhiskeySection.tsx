import {
  Icon,
  PopUpMenu,
  RoundedDropdown,
  TagFilter,
  Text,
  Title,
  VerticalWhiskeyCard,
} from '@components';
import { ClubWhiskeyWithDetails, useListClubWhiskeys } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, WhiskeyType,
  Routes
} from '@types';
import { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  DropDownSection,
  Empty,
  EmptyContainer,
  EmptyText,
  HorizontalFlatList,
  IconButton,
  LockContainer,
  LockText,
  SectionContainer,
  SectionHeader,
} from './styles';

interface ClubWhiskeySectionProps {
  clubId: string;
  clubName: string;
  isAdmin: boolean;
  canViewWhiskeys: boolean;
}

export const ClubWhiskeySection = ({
  clubId,
  clubName,
  isAdmin,
  canViewWhiskeys,
}: ClubWhiskeySectionProps) => {
  const navigation = useNavigation<NavigationProps>();
  const [showPopUpMenu, setShowPopUpMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [sortType, setSortType] = useState('default');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const { data, isLoading } = useListClubWhiskeys(clubId);

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

  // Get existing whiskey IDs for the add screen
  const existingWhiskeyIds = useMemo(() => allWhiskeys.map((item) => item.whiskeyId), [allWhiskeys]);

  const menuOptions = useMemo(() => {
    const options: { id: string; title: string; icon: string; action: () => void }[] = [
      {
        id: 'view-list',
        title: 'View List',
        icon: 'list',
        action: () => {
          navigation.navigate(Routes.ClubWhiskeyList, { clubId, clubName });
          setShowPopUpMenu(false);
        },
      },
    ];

    if (isAdmin) {
      options.push({
        id: 'manage-whiskeys',
        title: 'Manage Whiskeys',
        icon: 'edit',
        action: () => {
          navigation.navigate(Routes.ManageClubWhiskeys, { clubId, clubName });
          setShowPopUpMenu(false);
        },
      });
    }

    return options;
  }, [isAdmin, clubId, clubName, navigation]);

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

  const handleMenuPress = () => {
    if (showPopUpMenu && !isClosing) setShowPopUpMenu(false);
    if (!showPopUpMenu && !isClosing) setShowPopUpMenu(true);
  };

  // Lock screen for non-members of private clubs
  if (!canViewWhiskeys) {
    return (
      <SectionContainer>
        <SectionHeader>
          <Title size={18}>Club Whiskeys</Title>
        </SectionHeader>
        <LockContainer>
          <Icon name="lock" size={32} color="grey300" />
          <LockText>Join this club to view whiskeys</LockText>
        </LockContainer>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionHeader>
        <Title size={18}>
          Club Whiskeys
          {allWhiskeys.length > 0 && (
            <Text size={13}>{`  (${allWhiskeys.length})`}</Text>
          )}
        </Title>
        <IconButton onPress={handleMenuPress}>
          <Icon name="dot-menu-horizontal" size={16} color="white" />
        </IconButton>
      </SectionHeader>

      {showPopUpMenu && (
        <PopUpMenu
          width={55}
          options={menuOptions}
          alignItems="bottom"
          paddingBottom={0}
          paddingLeft={45}
          setVisibleStatus={setShowPopUpMenu}
          setIsClosingStatus={setIsClosing}
          reverse
          showLoading={false}
        />
      )}

      {isLoading ? (
        <EmptyContainer>
          <ActivityIndicator color="#fff" />
        </EmptyContainer>
      ) : (
        <>
          {allWhiskeys.length > 0 && (
            <TagFilter
              tags={Object.keys(WhiskeyType)}
              selectedTags={filterTags}
              setSelectedTags={setFilterTags}
              search={() =>
                navigation.navigate(Routes.ClubWhiskeyList, { clubId, clubName })
              }
            />
          )}

          <DropDownSection>
            {allWhiskeys.length > 0 && (
              <RoundedDropdown sortType={sortType} setSortType={setSortType} />
            )}
            {isAdmin && (
              <Text
                color="primary500"
                size={14}
                style={{ marginLeft: 'auto' }}
                onPress={() =>
                  navigation.navigate(Routes.AddClubWhiskey, {
                    clubId,
                    clubName,
                    existingWhiskeyIds,
                  })
                }
              >
                + Add
              </Text>
            )}
          </DropDownSection>

          <HorizontalFlatList
            data={sortedWhiskeys}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: ClubWhiskeyWithDetails) => item.id}
            renderItem={({ item }: { item: ClubWhiskeyWithDetails }) =>
              item.whiskey ? (
                <VerticalWhiskeyCard
                  whiskey={item.whiskey}
                  onPress={() => handleWhiskeyPress(item)}
                />
              ) : null
            }
            ListFooterComponent={<Empty />}
            ListEmptyComponent={
              <EmptyContainer>
                <Icon name="wine-glass" size={48} color="grey300" />
                <EmptyText>
                  {isAdmin
                    ? "This club doesn't have any whiskeys yet.\nTap + Add to get started."
                    : "This club doesn't have any whiskeys yet."}
                </EmptyText>
              </EmptyContainer>
            }
          />
        </>
      )}
    </SectionContainer>
  );
};
