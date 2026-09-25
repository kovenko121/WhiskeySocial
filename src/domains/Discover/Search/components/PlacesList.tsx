import {
  CreatePostModal,
  HorizontalUserCard,
  Icon,
  Link,
  Text,
} from '@components';
import { navigateUserProfile } from '@helpers';
import { useGuestGuard, useNearbyPlacesFromGoogle, useUsers } from '@hooks';
import { User, UserType,
  Routes
} from '@types';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { capturePostHogEvent } from '../../../../config/posthog';
import { Empty, LinkButton, ListContainer } from '../styles';

const PlacesList = ({
  search,
  show,
  sub,
  navigation,
}: {
  search: string;
  show: boolean;
  sub: string | undefined;
  navigation: any;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUsers(search, UserType.VENUE);
  const { results, triggerFetchNearbyPlaces } = useNearbyPlacesFromGoogle();
  const guardedCheckin = useGuestGuard('pour_log');

  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<User>();

  const handleCheckin = (item: User) => {
    guardedCheckin(() => {
      setSelectedVenue(item);
      setCreatePostVisible(true);
    });
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

  const filteredResults =
    !isLoading &&
    data &&
    data.pages.flatMap((page, index) => {
      if (index) {
        return page.items;
      }
      return page.items.concat(
        results
          .sort((a: any, b: any) => (a.venueName || '').localeCompare(b.venueName || ''))
          .filter((venue) =>
            (venue.venueName || '').toLowerCase().includes(search.toLowerCase())
          ) as any[]
      );
    });

  const idsToExclude = filteredResults
    ? new Set(
      filteredResults
        .filter((item) => item.externalId)
        .map((item) => item.externalId)
    )
    : new Set();

  if (!show) {
    return null;
  }

  return (
    <ListContainer>
      <LinkButton onPress={() => navigation.navigate(Routes.NearbyPlaces)}>
        <Icon name="map" size={20} color="primary500" />
        <Link align="left" color="primary500" mh={6} mv={4}>
          See nearby places
        </Link>
      </LinkButton>
      {filteredResults && (
        (() => {
          const finalData = filteredResults.filter((item) => !idsToExclude.has(item.id));
          return (
            <FlatList
              data={finalData}
              renderItem={({ item, index }) => (
                <HorizontalUserCard
                  user={item}
                  onPress={() => {
                    capturePostHogEvent('search_performed', {
                      query: search,
                      results_count: finalData.length,
                      result_tapped_index: index,
                      result_type: 'venue',
                    });
                    navigateUserProfile(item.id, sub, navigation);
                  }}
                  checkinButton
                  followButton={false}
                  checkinOnPress={() => handleCheckin(item)}
                  disabled={!item.username}
                  fixedHeight={120}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleLoadMore}
              ListEmptyComponent={
                <Text size={14} mv={20} color="grey300" align="center" mr={24}>
                  No places found
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
      )}
      <CreatePostModal
        venueCheckin={selectedVenue}
        visible={createPostVisible}
        onBackButtonPress={() => setCreatePostVisible(false)}
      />
    </ListContainer>
  );
};

export default PlacesList;
