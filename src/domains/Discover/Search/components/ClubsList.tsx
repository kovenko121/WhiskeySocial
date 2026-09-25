import { Text, HorizontalClubCard, Icon, Link } from '@components';
import { useSearchClubs } from '@hooks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { Club, RootStackParams
} from '@types';
import { ActivityIndicator, FlatList } from 'react-native';
import { capturePostHogEvent } from '../../../../config/posthog';
import { Empty, ListContainer, LinkButton } from '../styles';

const ClubsList = ({
  search,
  show,
  navigation,
}: {
  search: string;
  show: boolean;
  navigation: NativeStackNavigationProp<RootStackParams, 'Search'>;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchClubs(search);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleClubPress = (club: Club) => {
    navigation.navigate(Routes.ClubProfile, { clubId: club.id });
  };

  if (!show) {
    return null;
  }

  return (
    <ListContainer>
      <LinkButton onPress={() => navigation.navigate(Routes.RequestClub)}>
        <Icon name="plus" size={20} color="primary500" />
        <Link align="left" color="primary500" mh={6} mv={4}>
          Create a club
        </Link>
      </LinkButton>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        data && (
          (() => {
            const clubs = data.pages.flatMap((page) => page.items) as Club[];
            return (
              <FlatList
                data={clubs}
                renderItem={({ item, index }) => (
                  <HorizontalClubCard
                    club={item}
                    onPress={() => {
                      capturePostHogEvent('search_performed', {
                        query: search,
                        results_count: clubs.length,
                        result_tapped_index: index,
                        result_type: 'club',
                      });
                      handleClubPress(item);
                    }}
                  />
                )}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                ListEmptyComponent={
                  <Text size={14} mv={20} mr={24} color="grey300" align="center">
                    No clubs found
                  </Text>
                }
                ListFooterComponent={
                  <>
                    {isFetchingNextPage && <ActivityIndicator />}
                    <Empty />
                  </>
                }
              />
            );
          })()
        )
      )}
    </ListContainer>
  );
};

export default ClubsList;
