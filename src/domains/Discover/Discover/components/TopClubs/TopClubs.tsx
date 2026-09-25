import { HorizontalClubCard, Icon, Text, Title } from '@components';
import { getTestId } from '@helpers';
import { useTopClubs } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { Club, NavigationProps,
  Routes
} from '@types';
import React, { useCallback, useMemo } from 'react';
import {
  Empty,
  FlatList,
  IconContainer,
  Link,
  LinkContainer,
  SubtitleRow,
  TitleContainer,
} from './styles';

export const TopClubs = React.memo(() => {
  const navigation = useNavigation<NavigationProps>();

  const { data: clubs, isLoading } = useTopClubs(10);

  const goToClubSearch = useCallback(() => {
    navigation.navigate(Routes.Search, { category: 'Clubs' });
  }, [navigation]);

  const goToCreateClub = useCallback(() => {
    navigation.navigate(Routes.RequestClub);
  }, [navigation]);

  const handleClubPress = useCallback(
    (club: Club) => {
      navigation.navigate(Routes.ClubProfile, { clubId: club.id });
    },
    [navigation]
  );

  const clubList = useMemo(() => clubs || [], [clubs]);

  return (
    <>
      <TitleContainer>
        <Title size={18}>Top Clubs</Title>
        <LinkContainer onPress={goToClubSearch}>
          <IconContainer>
            <Icon name="search" size={16} color="primary500" />
          </IconContainer>
          <Link color="primary500" testID={getTestId('club-search')}>
            Search clubs
          </Link>
        </LinkContainer>
      </TitleContainer>
      <SubtitleRow>
        <Text size={12} color="grey50">
          Want to start your own club?{'  '}
        </Text>
        <Text size={12} color="primary500" onPress={goToCreateClub}>
          Create one
        </Text>
      </SubtitleRow>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={clubList}
        keyExtractor={(item: Club) => item.id}
        renderItem={({ item }: { item: Club }) => (
          <HorizontalClubCard club={item} onPress={handleClubPress} />
        )}
        ListFooterComponent={<Empty />}
        ListEmptyComponent={
          isLoading ? null : (
            <Text size={12} mv={42} mh={80} align="center">
              No clubs available yet.
            </Text>
          )
        }
      />
    </>
  );
});
