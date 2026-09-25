import { Input, RoundedDropdown, Text, Title, VerticalWhiskeyCard } from '@components';
import { useGetUser } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, Whiskey,
  Routes
} from '@types';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatListProps } from 'react-native';
import styled from 'styled-components/native';

const MyCollectionDividerView = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin-top: 20px;
  gap: 6px;
`;

const SearchContainer = styled.View`
  padding: 0 24px;
  margin-top: 12px;
  margin-bottom: 12px;
  min-height: 70px;
`;

const HorizontalFlatList = styled.FlatList<FlatListProps<Whiskey>>`
  padding: 0 0 0 24px;
  margin-top: -20px;
`;

const Empty = styled.View`
  width: 24px;
`;

const EmptyPostList = styled.View`
  padding: 0 24px;
  margin: 20px 0;
`;

const BrandWhiskeysList = ({ userId }: { userId: string }) => {
  const navigation = useNavigation<NavigationProps>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('alphabetical');
  const { data: user, isLoading } = useGetUser(userId);

  const allWhiskeys = useMemo(() => {
    if (!user?.brandWhiskeys?.items) return [];
    return user.brandWhiskeys.items.filter((item): item is Whiskey => Boolean(item));
  }, [user?.brandWhiskeys?.items]);

  const sortedWhiskeys = useMemo(() => {
    if (sortType === 'alphabetical') {
      return [...allWhiskeys].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
    }
    return allWhiskeys;
  }, [allWhiskeys, sortType]);

  const filteredWhiskeys = useMemo(() => {
    if (!searchQuery.trim()) return sortedWhiskeys;

    const query = searchQuery.toLowerCase().trim();
    return sortedWhiskeys.filter((whiskey) =>
      whiskey.name?.toLowerCase().includes(query) ||
      whiskey.brandUser?.brandName?.toLowerCase().includes(query) ||
      whiskey.type?.some(type => type?.toLowerCase().includes(query))
    );
  }, [sortedWhiskeys, searchQuery]);

  const handleWhiskeyPress = (whiskey: Whiskey) => {
    navigation.navigate(Routes.WhiskeyInfo, {
      id: whiskey.id
    });
  };

  if (!isLoading && !allWhiskeys.length) {
    return null;
  }

  return (
    <>
      <MyCollectionDividerView>
        <Title size={16} mb={0} mt={0}>
          {user?.brandName}'s Whiskeys
          {allWhiskeys.length > 0 && (
            <Text size={13}>{`  (${allWhiskeys.length})`}</Text>
          )}
        </Title>
        {allWhiskeys.length > 0 && (
          <RoundedDropdown sortType={sortType} setSortType={setSortType} right />
        )}
      </MyCollectionDividerView>

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          {allWhiskeys.length > 0 && (
            <SearchContainer>
              <Input
                placeholder="Search whiskeys..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon="search"
                iconRight={searchQuery ? "close" : undefined}
                iconSize={22}
                iconColor="primary500"
                onPressIcon={() => setSearchQuery('')}
                round
              />
            </SearchContainer>
          )}

          <HorizontalFlatList
            data={filteredWhiskeys}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: Whiskey) => item.id}
            renderItem={({ item }: { item: Whiskey }) => (
              <VerticalWhiskeyCard
                whiskey={item}
                isMyCollection={false}
                onPress={() => handleWhiskeyPress(item)}
              />
            )}
            ListFooterComponent={<Empty />}
            ListEmptyComponent={
              <EmptyPostList>
                <Text size={13} color="white" align="center">
                  {searchQuery.trim()
                    ? `No whiskeys found matching "${searchQuery}"`
                    : `${user?.brandName} doesn't have any whiskeys yet.`}
                </Text>
              </EmptyPostList>
            }
          />
        </>
      )}
    </>
  );
};

export { BrandWhiskeysList };