import { Header, HorizontalClubCard, Input, Text } from '@components';
import { useGetUserClubs } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { Club, RootStackParams
} from '@types';
import { useState, useMemo } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import {
  ContentContainer,
  ScreenContainer,
  SearchContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'UserClubsList'>;

export const UserClubsListScreen = ({ navigation, route }: Props) => {
  const { userId, username } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clubs, isLoading, error } = useGetUserClubs({ userId });

  // Filter clubs based on search query (client-side filtering)
  const filteredClubs = useMemo(() => {
    if (!clubs) return [];

    if (!searchQuery.trim()) return clubs;

    const lowerQuery = searchQuery.toLowerCase();
    return clubs.filter((club) =>
      club.clubName.toLowerCase().includes(lowerQuery)
    );
  }, [clubs, searchQuery]);

  const handleClubPress = (club: Club) => {
    navigation.navigate(Routes.ClubProfile, { clubId: club.id });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ContentContainer>
          <Header
            title={username ? `${username}'s Clubs` : 'User Clubs'}
            navBack={() => navigation.goBack()}
            actionText=""
          />
          <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        </ContentContainer>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <ContentContainer>
          <Header
            title={username ? `${username}'s Clubs` : 'User Clubs'}
            navBack={() => navigation.goBack()}
            actionText=""
          />
          <Text size={14} mv={20} mr={24} color="grey300" align="center">
            Failed to load clubs
          </Text>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header
          title={username ? `${username}'s Clubs` : 'User Clubs'}
          navBack={() => navigation.goBack()}
          actionText=""
        />
        <FlatList
          data={filteredClubs}
          renderItem={({ item }: { item: Club }) => (
            <HorizontalClubCard club={item} onPress={handleClubPress} />
          )}
          keyExtractor={(item: Club) => item.id}
          ListHeaderComponent={
            <SearchContainer>
              <Input
                placeholder="Search clubs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </SearchContainer>
          }
          ListEmptyComponent={
            <Text size={14} mv={20} mr={24} color="grey300" align="center">
              {searchQuery.trim()
                ? 'No clubs match your search'
                : 'Not a member of any clubs yet'}
            </Text>
          }
        />
      </ContentContainer>
    </ScreenContainer>
  );
};
