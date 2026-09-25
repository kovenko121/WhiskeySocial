import { HorizontalUserCard, Icon, Text, Title } from '@components';
import { useAuth, useLocation } from '@contexts';
import {
  getDistanceBetweenGeoPoints,
  getDistanceBetweenGeoPointsKm,
  getTestId,
  navigateUserProfile,
  NEARBY_PLACES_RADIUS_KM,
} from '@helpers';
import { useGuestGuard, useVenuesByGeoPoint } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, User,
  Routes
} from '@types';
import { Linking } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import {
  Empty,
  FlatList,
  IconContainer,
  Link,
  LinkContainer,
  TitleContainer,
} from './styles';

export const NearbyPlaces = React.memo(({
  setSelectedVenue,
  setCreatePostVisible,
}: {
  setSelectedVenue: (item: User) => User;
  setCreatePostVisible: (visible: boolean) => void;
}) => {
  
  const { user } = useAuth();
  const sub = user?.sub;
  const guardedCheckin = useGuestGuard('pour_log');

  const navigation = useNavigation<NavigationProps>();

  const seeOnMap = useCallback(async () => {
    navigation.navigate(Routes.NearbyPlaces);
  }, [navigation]);

  const openLocationSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const { location, error } = useLocation();

  const { data } = useVenuesByGeoPoint(location!, NEARBY_PLACES_RADIUS_KM);

  const handleCheckin = useCallback(
    (item: User) => {
      guardedCheckin(() => {
        setSelectedVenue(item);
        setCreatePostVisible(true);
      });
    },
    [guardedCheckin, setSelectedVenue, setCreatePostVisible]
  );

  const venues = useMemo(() => {
    const filteredVenues = data?.pages
      .flatMap((page) => page.items)
      .filter((venue) => !venue.deleted && !venue.archived) ?? [];

    if (!location) return filteredVenues;

    return filteredVenues.sort((a, b) => {
      // Handle venues without geo locations gracefully to avoid runtime errors.
      const geoA = a.venueAddressGeo;
      const geoB = b.venueAddressGeo;
      if (!geoA && !geoB) {
        return 0;
      }
      if (!geoA) {
        // Place venues without geo data after those with geo data.
        return 1;
      }
      if (!geoB) {
        return -1;
      }
      const distanceA = getDistanceBetweenGeoPointsKm(geoA, {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
      const distanceB = getDistanceBetweenGeoPointsKm(geoB, {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
      return distanceA - distanceB;
    });
  }, [data, location]);
  

  return (
    <>
      <TitleContainer>
        <Title size={18}>Nearby Places</Title>
        <LinkContainer onPress={location ? seeOnMap : openLocationSettings}>
          <IconContainer>
            <Icon
              name={location ? 'map' : 'gear'}
              size={16}
              color="primary500"
            />
          </IconContainer>
          <Link color="primary500" testID={getTestId(location ? 'see-on-map' : 'location-settings')}>
            {location ? 'See on map' : 'Location settings'}
          </Link>
        </LinkContainer>
      </TitleContainer>

      {!location && (
        <Text size={12} mv={50} align="center">
          Turn on your location to see nearby venues.
        </Text>
      )}

      {!!location && venues.length === 0 && (
        <Text size={12} mv={42} mh={40} align="center">
          {error || 'No spots in the Whiskey Social catalog within 60 miles of you.'}
        </Text>
      )}

      {!!location && venues.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={venues}
          keyExtractor={(item: User) => item.id}
          renderItem={({ item }: { item: User }) => (
            <HorizontalUserCard
              user={item}
              distance={getDistanceBetweenGeoPoints(item.venueAddressGeo!, {
                lat: location!.coords!.latitude,
                lon: location!.coords!.longitude,
              })}
              followButton={false}
              onPress={() => navigateUserProfile(item?.id, sub, navigation)}
              checkinOnPress={() => handleCheckin(item)}
              checkinButton
              fixedHeight={120}
            />
          )}
          ListFooterComponent={<Empty />}
        />
      )}
    </>
  );
});
